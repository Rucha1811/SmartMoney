<?php
/**
 * Live Stock Market API
 * 
 * Fetches live stock prices from Alpha Vantage API with smart caching.
 * Falls back to mock data if API is unavailable.
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Attempt to load database, but don't fail if it's unavailable
$conn = null;
try {
    require_once 'db.php';
} catch (Exception $e) {
    // Database not available, will use cache file instead
}

// Configuration
$CACHE_DURATION = 30; // seconds
$CACHE_FILE = __DIR__ . '/../../stocks_cache.json'; // File-based cache fallback
$API_KEY = 'demo'; // Alpha Vantage demo key (limited requests)
$STOCKS_TO_FETCH = ['TCS', 'INFY', 'RELIANCE', 'HDFC', 'ICICI', 'WIPRO'];

// Get cached stocks
$cachedStocks = getCachedStocks();

// Check if cache is still fresh
$shouldRefresh = shouldRefreshCache($cachedStocks);

// Fetch fresh data if needed
if ($shouldRefresh) {
    $freshStocks = fetchStocksFromAPI($STOCKS_TO_FETCH, $API_KEY);
    
    if (!empty($freshStocks)) {
        // Save to both database and file cache
        if ($conn) {
            saveToDatabase($conn, $freshStocks);
        }
        saveToFileCache($freshStocks);
        
        // Return fresh data
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'timestamp' => date('Y-m-d H:i:s'),
            'cached' => false,
            'cacheAge' => 0,
            'data' => $freshStocks
        ]);
    } else {
        // API failed, return cached data
        if (!empty($cachedStocks)) {
            http_response_code(200);
            $cacheAge = time() - strtotime($cachedStocks[0]['last_updated'] ?? date('Y-m-d H:i:s'));
            echo json_encode([
                'status' => 'success',
                'timestamp' => date('Y-m-d H:i:s'),
                'cached' => true,
                'cacheAge' => $cacheAge,
                'data' => $cachedStocks
            ]);
        } else {
            http_response_code(503);
            echo json_encode([
                'status' => 'error',
                'message' => 'Unable to fetch stock data',
                'data' => getFallbackData()
            ]);
        }
    }
} else {
    // Cache is still fresh, return it
    http_response_code(200);
    $cacheAge = time() - strtotime($cachedStocks[0]['last_updated'] ?? date('Y-m-d H:i:s'));
    echo json_encode([
        'status' => 'success',
        'timestamp' => date('Y-m-d H:i:s'),
        'cached' => true,
        'cacheAge' => $cacheAge,
        'data' => $cachedStocks
    ]);
}

/**
 * Get cached stocks from file or database
 */
function getCachedStocks() {
    global $conn, $CACHE_FILE, $STOCKS_TO_FETCH;
    
    // Try file cache first
    if (file_exists($CACHE_FILE)) {
        $data = json_decode(file_get_contents($CACHE_FILE), true);
        if (!empty($data)) {
            return $data;
        }
    }
    
    // Try database cache
    if ($conn) {
        try {
            $query = "SELECT symbol, company_name, current_price, price_change, change_percent, last_updated FROM stocks_cache ORDER BY symbol";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($data)) {
                return $data;
            }
        } catch (Exception $e) {
            // Database error, will use fallback
        }
    }
    
    // Return fallback data
    return getFallbackData();
}

/**
 * Check if cache should be refreshed
 */
function shouldRefreshCache($cachedStocks) {
    global $CACHE_DURATION;
    
    if (empty($cachedStocks)) {
        return true;
    }
    
    $lastUpdate = strtotime($cachedStocks[0]['last_updated'] ?? date('Y-m-d H:i:s'));
    $now = time();
    return ($now - $lastUpdate) >= $CACHE_DURATION;
}

/**
 * Save stocks to file cache
 */
function saveToFileCache($stocks) {
    global $CACHE_FILE;
    
    // Add timestamp to each stock
    $data = [];
    $timestamp = date('Y-m-d H:i:s');
    foreach ($stocks as $stock) {
        $stock['last_updated'] = $timestamp;
        $data[] = $stock;
    }
    
    file_put_contents($CACHE_FILE, json_encode($data));
}

/**
 * Save stocks to database
 */
function saveToDatabase($conn, $stocks) {
    try {
        // Create table if needed
        $createTableQuery = "CREATE TABLE IF NOT EXISTS stocks_cache (
            symbol VARCHAR(20) PRIMARY KEY,
            company_name VARCHAR(100),
            current_price DECIMAL(12, 2),
            price_change DECIMAL(12, 2),
            change_percent DECIMAL(8, 2),
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $conn->exec($createTableQuery);
        
        // Update stocks
        foreach ($stocks as $stock) {
            $query = "INSERT INTO stocks_cache (symbol, company_name, current_price, price_change, change_percent, last_updated) 
                     VALUES (:symbol, :company_name, :price, :change, :changePercent, NOW())
                     ON DUPLICATE KEY UPDATE 
                     current_price = :price,
                     price_change = :change,
                     change_percent = :changePercent,
                     last_updated = NOW()";
            $stmt = $conn->prepare($query);
            $stmt->execute([
                ':symbol' => $stock['symbol'],
                ':company_name' => $stock['company_name'],
                ':price' => $stock['current_price'],
                ':change' => $stock['price_change'],
                ':changePercent' => $stock['change_percent']
            ]);
        }
    } catch (Exception $e) {
        error_log('Database save error: ' . $e->getMessage());
    }
}

/**
 * Fetch REAL stock data from Alpha Vantage API
 */
function fetchStocksFromAPI($symbols, $apiKey) {
    $baseUrl = 'https://www.alphavantage.co/query';
    
    // Stock mapping for Indian stocks (BSE)
    $stockSymbols = [
        'TCS' => 'TCS.BSE',
        'INFY' => 'INFY.BSE',
        'RELIANCE' => 'RELIANCE.BSE',
        'HDFC' => 'HDFC.BSE',
        'ICICI' => 'ICICIBANK.BSE',
        'WIPRO' => 'WIPRO.BSE'
    ];
    
    $result = [];
    
    foreach ($symbols as $symbol) {
        try {
            $bseSymbol = $stockSymbols[$symbol] ?? $symbol;
            
            // Call Alpha Vantage API
            $url = $baseUrl . '?function=GLOBAL_QUOTE&symbol=' . $bseSymbol . '&apikey=' . $apiKey;
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => 5,
                    'user_agent' => 'Mozilla/5.0'
                ]
            ]);
            
            $response = @file_get_contents($url, false, $context);
            
            if ($response === false) {
                error_log('Failed to fetch stock: ' . $symbol);
                continue;
            }
            
            $data = json_decode($response, true);
            
            if (isset($data['Global Quote']) && !empty($data['Global Quote'])) {
                $quote = $data['Global Quote'];
                
                if (!empty($quote['05. price'])) {
                    $price = floatval($quote['05. price']);
                    $change = floatval($quote['09. change'] ?? 0);
                    $changePercent = floatval(str_replace('%', '', $quote['10. change percent'] ?? 0));
                    
                    $result[] = [
                        'symbol' => $symbol,
                        'company_name' => getCompanyName($symbol),
                        'current_price' => $price,
                        'price_change' => $change,
                        'change_percent' => $changePercent
                    ];
                }
            }
            
            // Rate limiting
            usleep(200000);
            
        } catch (Exception $e) {
            error_log('Stock API Error for ' . $symbol . ': ' . $e->getMessage());
            continue;
        }
    }
    
    // If API failed, return false to trigger fallback
    return empty($result) ? false : $result;
}

/**
 * Get company names
 */
function getCompanyName($symbol) {
    $names = [
        'TCS' => 'Tata Consultancy Services',
        'INFY' => 'Infosys Limited',
        'RELIANCE' => 'Reliance Industries',
        'HDFC' => 'HDFC Bank',
        'ICICI' => 'ICICI Bank',
        'WIPRO' => 'Wipro Limited'
    ];
    
    return $names[$symbol] ?? $symbol;
}

/**
 * Fallback mock data
 */
function getFallbackData() {
    return [
        [
            'symbol' => 'TCS',
            'company_name' => 'Tata Consultancy Services',
            'current_price' => 3650.50,
            'price_change' => 45.25,
            'change_percent' => 1.26,
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'symbol' => 'INFY',
            'company_name' => 'Infosys Limited',
            'current_price' => 1542.75,
            'price_change' => -15.50,
            'change_percent' => -1.00,
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'symbol' => 'RELIANCE',
            'company_name' => 'Reliance Industries',
            'current_price' => 2890.30,
            'price_change' => 78.50,
            'change_percent' => 2.79,
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'symbol' => 'HDFC',
            'company_name' => 'HDFC Bank',
            'current_price' => 1845.60,
            'price_change' => 22.75,
            'change_percent' => 1.25,
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'symbol' => 'ICICI',
            'company_name' => 'ICICI Bank',
            'current_price' => 925.40,
            'price_change' => -12.30,
            'change_percent' => -1.31,
            'last_updated' => date('Y-m-d H:i:s')
        ],
        [
            'symbol' => 'WIPRO',
            'company_name' => 'Wipro Limited',
            'current_price' => 385.25,
            'price_change' => 8.50,
            'change_percent' => 2.26,
            'last_updated' => date('Y-m-d H:i:s')
        ]
    ];
}
?>
