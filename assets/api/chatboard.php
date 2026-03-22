<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load .env file
loadEnv();

// Load configuration
require_once '../config/chatboard.config.php';

// Handle chat requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Message required']);
        exit();
    }
    
    $message = trim($data['message']);
    $context = isset($data['context']) ? $data['context'] : [];
    
    $response = generateChatResponse($message, $context);
    echo json_encode($response);
    exit();
}

// Handle conversation history
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'history') {
        $conversationId = $_GET['id'] ?? 'default';
        $history = getConversationHistory($conversationId);
        echo json_encode(['history' => $history]);
        exit();
    }
    
    if ($action === 'clear') {
        $conversationId = $_GET['id'] ?? 'default';
        clearConversationHistory($conversationId);
        echo json_encode(['success' => true]);
        exit();
    }
}

/**
 * Generate chat response using Gemini API
 */
function generateChatResponse($message, $context = []) {
    global $CHATBOARD_CONFIG;
    
    $apiKey = getenv('GEMINI_API_KEY');
    if (!$apiKey) {
        return [
            'success' => false,
            'error' => 'API key not configured',
            'message' => 'Please configure your Gemini API key'
        ];
    }
    
    try {
        // Build conversation history for context
        $conversationHistory = buildConversationHistory($context);
        
        // Prepare the prompt with financial context
        $systemPrompt = buildSystemPrompt($context);
        $fullPrompt = $systemPrompt . "\n\nUser: " . $message;
        
        // Call Gemini API
        $response = callGeminiAPI($apiKey, $fullPrompt, $conversationHistory);
        
        if (!$response['success']) {
            return $response;
        }
        
        // Save to conversation history
        saveToHistory($message, $response['text']);
        
        return [
            'success' => true,
            'message' => $response['text'],
            'timestamp' => date('Y-m-d H:i:s'),
            'source' => 'gemini'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Chat error: ' . $e->getMessage()
        ];
    }
}

/**
 * Call Gemini API
 */
function callGeminiAPI($apiKey, $prompt, $history = []) {
    $url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . $apiKey;
    
    // Build messages array
    $messages = [];
    
    // Add history
    foreach ($history as $item) {
        $messages[] = [
            'role' => $item['role'],
            'parts' => [['text' => $item['text']]]
        ];
    }
    
    // Add new message
    $messages[] = [
        'role' => 'user',
        'parts' => [['text' => $prompt]]
    ];
    
    $payload = [
        'contents' => $messages,
        'generationConfig' => [
            'temperature' => 0.7,
            'topK' => 40,
            'topP' => 0.95,
            'maxOutputTokens' => 2048,
        ]
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return [
            'success' => false,
            'error' => 'API Error: ' . $httpCode,
            'text' => 'Sorry, I encountered an error. Please try again.'
        ];
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        return [
            'success' => false,
            'error' => 'Invalid API response',
            'text' => 'I could not generate a response. Please try again.'
        ];
    }
    
    return [
        'success' => true,
        'text' => $result['candidates'][0]['content']['parts'][0]['text']
    ];
}

/**
 * Build system prompt with financial context
 */
function buildSystemPrompt($context = []) {
    $prompt = "You are a helpful AI financial advisor for SmartMoney - a personal finance management app. ";
    $prompt .= "You help users with financial advice, budgeting tips, investment strategies, and stock market insights. ";
    $prompt .= "Be professional, friendly, and provide accurate financial information. ";
    
    if (!empty($context['portfolio'])) {
        $prompt .= "\n\nUser's Portfolio: " . json_encode($context['portfolio']);
    }
    
    if (!empty($context['budget'])) {
        $prompt .= "\n\nUser's Budget: " . json_encode($context['budget']);
    }
    
    if (!empty($context['recent_transactions'])) {
        $prompt .= "\n\nRecent Transactions: " . count($context['recent_transactions']) . " transactions";
    }
    
    $prompt .= "\n\nProvide helpful, accurate responses. If unsure about specific market data, indicate you don't have real-time data and suggest checking the app's market section.";
    
    return $prompt;
}

/**
 * Build conversation history for context
 */
function buildConversationHistory($context = []) {
    $history = [];
    
    if (!empty($context['messages'])) {
        foreach ($context['messages'] as $msg) {
            if (isset($msg['role']) && isset($msg['text'])) {
                $history[] = [
                    'role' => $msg['role'],
                    'text' => $msg['text']
                ];
            }
        }
    }
    
    return $history;
}

/**
 * Save message to conversation history
 */
function saveToHistory($userMessage, $aiResponse) {
    $cacheFile = __DIR__ . '/../../cache/chatboard_history.json';
    
    // Create cache directory if needed
    if (!is_dir(dirname($cacheFile))) {
        mkdir(dirname($cacheFile), 0755, true);
    }
    
    $history = [];
    if (file_exists($cacheFile)) {
        $history = json_decode(file_get_contents($cacheFile), true) ?: [];
    }
    
    // Add new exchange
    $history[] = [
        'user' => $userMessage,
        'ai' => $aiResponse,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Keep last 50 exchanges
    if (count($history) > 50) {
        $history = array_slice($history, -50);
    }
    
    file_put_contents($cacheFile, json_encode($history, JSON_PRETTY_PRINT));
}

/**
 * Get conversation history
 */
function getConversationHistory($id = 'default') {
    $cacheFile = __DIR__ . '/../../cache/chatboard_history.json';
    
    if (!file_exists($cacheFile)) {
        return [];
    }
    
    return json_decode(file_get_contents($cacheFile), true) ?: [];
}

/**
 * Clear conversation history
 */
function clearConversationHistory($id = 'default') {
    $cacheFile = __DIR__ . '/../../cache/chatboard_history.json';
    
    if (file_exists($cacheFile)) {
        unlink($cacheFile);
    }
    
    return true;
}

/**
 * Load .env file and set environment variables
 */
function loadEnv() {
    $envFile = __DIR__ . '/../../.env';
    
    if (!file_exists($envFile)) {
        return false;
    }
    
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        // Skip comments
        if (strpos($line, '#') === 0) {
            continue;
        }
        
        // Parse KEY=value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^"(.+)"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match('/^\'(.+)\'$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            // Set environment variable
            putenv("$key=$value");
        }
    }
    
    return true;
}
?>
