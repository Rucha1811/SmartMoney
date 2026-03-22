<?php
// SmartMoney X - AI Chat Backend
// Handles secure communication with Google Gemini API

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Configuration
// TODO: PASTE YOUR GEMINI API KEY BELOW inside the quotes
$API_KEY = "AIzaSyA6IMmTVc7FOsVE-nn9opX7Oj7IV8SahJc";
$API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $API_KEY;

// 2. Get Input
$input = json_decode(file_get_contents("php://input"), true);
$userMessage = $input['message'] ?? '';

if (empty($userMessage)) {
    echo json_encode(["status" => "error", "message" => "No message provided"]);
    exit();
}

// 3. Prepare Payload for Gemini
$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $userMessage]
            ]
        ]
    ]
];

// 4. Send Request via CURL
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

try {
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    curl_close($ch);

    // 5. Return Response
    if ($httpCode === 200) {
        $decoded = json_decode($response, true);
        $aiText = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? "I couldn't generate a response.";
        echo json_encode(["status" => "success", "reply" => $aiText]);
    } else {
        echo json_encode(["status" => "error", "message" => "API Error ($httpCode)", "raw" => $response]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
