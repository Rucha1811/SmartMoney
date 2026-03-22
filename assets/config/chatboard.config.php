<?php
/**
 * Chatboard Configuration
 */

$CHATBOARD_CONFIG = [
    'model' => 'gemini-2.5-flash',
    'api_url' => 'https://generativelanguage.googleapis.com/v1/models/',
    'temperature' => 0.7,
    'max_tokens' => 2048,
    'max_history' => 50,
    'cache_duration' => 0, // Don't cache responses
    'enable_context' => true,
    'financial_mode' => true,
];

// Get API key from environment
if (!getenv('GEMINI_API_KEY')) {
    error_log('Warning: GEMINI_API_KEY environment variable not set');
}

?>
