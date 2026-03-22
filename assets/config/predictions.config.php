<?php
/**
 * Predictions Configuration
 * 
 * API keys for stock market prediction services
 * Keep these secure! Use environment variables in production.
 */

return [
    // Gemini API Configuration
    'gemini_api_key' => getenv('GEMINI_API_KEY') ?: '', // Get from environment or set here
    'gemini_model' => 'gemini-2.5-flash',
    'gemini_timeout' => 10,
    
    // Alpha Vantage Configuration (Optional - for enhanced data)
    'alpha_vantage_key' => getenv('ALPHA_VANTAGE_KEY') ?: '',
    'alpha_vantage_timeout' => 8,
    
    // Market configurations
    'markets' => [
        'NSE' => [
            'name' => 'National Stock Exchange (India)',
            'currency' => 'INR',
            'symbols' => ['TCS', 'INFY', 'RELIANCE', 'ICICIBANK', 'WIPRO', 'BAJAJ-AUTO', 'LT', 'SBIN'],
        ],
        'BSE' => [
            'name' => 'Bombay Stock Exchange (India)',
            'currency' => 'INR',
            'symbols' => [],
        ],
        'NASDAQ' => [
            'name' => 'Nasdaq (USA)',
            'currency' => 'USD',
            'symbols' => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
        ],
        'NYSE' => [
            'name' => 'New York Stock Exchange (USA)',
            'currency' => 'USD',
            'symbols' => ['JNJ', 'V', 'JPM', 'PG', 'MA'],
        ],
    ],
    
    // Prediction settings
    'prediction_settings' => [
        'cache_duration' => 3600, // 1 hour
        'min_confidence' => 60, // Minimum confidence % to display
        'max_stocks_per_market' => 10,
        'refresh_interval' => 300, // Refresh every 5 minutes (frontend)
    ],
    
    // Cache settings
    'cache_path' => __DIR__ . '/../../cache/predictions/',
    'cache_enabled' => true,
];
?>
