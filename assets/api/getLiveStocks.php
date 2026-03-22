<?php
/**
 * Live Stock Market API - Cache-based
 * 
 * Reads pre-cached live stock data that is continuously updated
 * by a background Python process. Very fast and reliable.
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$CACHE_FILE = __DIR__ . '/../../stocks_live_cache.json';
$FALLBACK_DATA_TIMEOUT = 3600;

// Try to read cache
$cacheData = null;
$cacheAge = 0;
$isFresh = false;

if (file_exists($CACHE_FILE)) {
    try {
        $json = file_get_contents($CACHE_FILE);
        $cacheData = json_decode($json, true);
        
        if ($cacheData && isset($cacheData['timestamp']) && isset($cacheData['stocks'])) {
            $cacheAge = time() - $cacheData['timestamp'];
            $isFresh = $cacheAge < $FALLBACK_DATA_TIMEOUT;
            
            // Return cached data
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'timestamp' => date('Y-m-d H:i:s'),
                'data' => $cacheData['stocks'],
                'cached' => true,
                'cacheAge' => $cacheAge,
                'dataAge' => $cacheData['dataAge'] ?? date('Y-m-d H:i:s'),
                'isFresh' => $isFresh,
                'source' => $isFresh ? 'live_cache' : 'stale_cache'
            ]);
            exit();
        }
    } catch (Exception $e) {
        error_log("Cache read error: " . $e->getMessage());
    }
}

// Cache not available, return fallback data
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'timestamp' => date('Y-m-d H:i:s'),
    'data' => getFallbackData(),
    'cached' => false,
    'cacheAge' => 0,
    'dataAge' => 'offline',
    'isFresh' => false,
    'source' => 'fallback',
    'note' => 'Background updater not running'
]);

/**
 * Get stock data with intelligent caching
 */
function getStockData() {
    global $CACHE_DURATION, $CACHE_FILE, $PYTHON_SCRIPT;
    
    // Check if cache exists and is fresh
    if (file_exists($CACHE_FILE)) {
        $cacheData = json_decode(file_get_contents($CACHE_FILE), true);
        $cacheAge = time() - $cacheData['timestamp'];
        
        if ($cacheAge < $CACHE_DURATION && !empty($cacheData['stocks'])) {
            return [
                'data' => $cacheData['stocks'],
                'cached' => true,
                'cacheAge' => $cacheAge,
                'dataAge' => $cacheData['dataAge'] ?? 'unknown'
            ];
        }
    }
    
    // Fetch fresh data using Python
    $freshData = fetchLiveStocks($PYTHON_SCRIPT);
    
    if ($freshData) {
        // Save to cache
        saveCache($CACHE_FILE, $freshData);
        
        return [
            'data' => $freshData,
            'cached' => false,
            'cacheAge' => 0,
            'dataAge' => date('Y-m-d H:i:s')
        ];
    }
    
    // If fetch fails, try to return old cache
    if (file_exists($CACHE_FILE)) {
        $cacheData = json_decode(file_get_contents($CACHE_FILE), true);
        if (!empty($cacheData['stocks'])) {
            return [
                'data' => $cacheData['stocks'],
                'cached' => true,
                'cacheAge' => time() - $cacheData['timestamp'],
                'dataAge' => $cacheData['dataAge'] ?? 'stale'
            ];
        }
    }
    
    return false;
}

/**
 * Fetch live stock data using Python yfinance
 */
function fetchLiveStocks($pythonScript) {
    if (!file_exists($pythonScript)) {
        error_log("Python script not found: $pythonScript");
        return false;
    }
    
    // Get Python executable path
    $pythonCmd = getPythonCommand();
    if (!$pythonCmd) {
        error_log("Python not found in system");
        return false;
    }
    
    error_log("Using Python: $pythonCmd");
    
    // Execute Python script
    $escapedScript = escapeshellarg($pythonScript);
    $command = "$pythonCmd $escapedScript 2>&1";
    
    error_log("Executing: $command");
    
    // Simple exec approach (works better in PHP CLI mode)
    $output = '';
    $returnVar = 0;
    
    // Use proc_open with timeout
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w']
    ];
    
    $process = @proc_open($command, $descriptors, $pipes);
    
    if (!is_resource($process)) {
        error_log("Failed to execute Python script");
        return false;
    }
    
    // Set non-blocking mode
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);
    
    $output = '';
    $error = '';
    $startTime = microtime(true);
    $timeout = 20; // 20 second timeout
    
    // Read output
    while ((microtime(true) - $startTime) < $timeout) {
        $out = stream_get_contents($pipes[1]);
        if ($out) $output .= $out;
        
        $err = stream_get_contents($pipes[2]);
        if ($err) $error .= $err;
        
        $status = proc_get_status($process);
        if (!$status['running']) {
            break;
        }
        
        usleep(100000); // 100ms sleep
    }
    
    // Read any remaining output
    $output .= stream_get_contents($pipes[1]);
    $error .= stream_get_contents($pipes[2]);
    
    // Close pipes
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    
    $status = proc_get_status($process);
    if ($status['running']) {
        proc_terminate($process, 9);
    }
    proc_close($process);
    
    // Log errors if any
    if (!empty($error)) {
        error_log("Python stderr: $error");
    }
    
    error_log("Python output length: " . strlen($output));
    
    // Parse JSON output
    try {
        $result = json_decode(trim($output), true);
        
        if ($result && isset($result['status']) && $result['status'] === 'success' && !empty($result['data'])) {
            error_log("Successfully fetched " . count($result['data']) . " stocks");
            return $result['data'];
        } else {
            error_log("Invalid response structure: " . substr($output, 0, 200));
        }
    } catch (Exception $e) {
        error_log("JSON parse error: " . $e->getMessage());
    }
    
    return false;
}

/**
 * Get Python executable path
 */
function getPythonCommand() {
    // Try environment variable first
    $pythonPath = getenv('PYTHON_PATH');
    if ($pythonPath && file_exists($pythonPath)) {
        return $pythonPath;
    }
    
    $pythonVersions = ['python3', 'python', 'python3.9', 'python3.10', 'python3.11', 'python3.12', 'python3.14'];
    
    foreach ($pythonVersions as $python) {
        // Try to find Python using exec which command
        $output = shell_exec("which $python 2>/dev/null");
        if (!empty($output)) {
            return trim($output);
        }
    }
    
    // Try common macOS/Unix paths
    $commonPaths = [
        '/usr/local/bin/python3',
        '/opt/homebrew/bin/python3',
        '/opt/homebrew/bin/python',
        '/usr/bin/python3',
        '/usr/bin/python',
        '/opt/local/bin/python3',
        '/opt/local/bin/python',
    ];
    
    foreach ($commonPaths as $path) {
        if (file_exists($path)) {
            return $path;
        }
    }
    
    // Log available paths for debugging
    $debugPath = shell_exec("echo $PATH 2>/dev/null");
    error_log("Python not found in PATH: $debugPath");
    
    return null;
}

/**
 * Save cache to file
 */
function saveCache($cacheFile, $stocks) {
    $data = [
        'timestamp' => time(),
        'dataAge' => date('Y-m-d H:i:s'),
        'stocks' => $stocks
    ];
    
    file_put_contents($cacheFile, json_encode($data, JSON_PRETTY_PRINT));
}

/**
 * Fallback mock data
 */
function getFallbackData() {
    return [
        [
            'symbol' => 'TCS',
            'company_name' => 'Tata Consultancy Services Limited',
            'current_price' => 2390.60,
            'previous_price' => 2356.00,
            'price_change' => 34.60,
            'change_percent' => 1.47,
            'market_cap' => 8649400385536,
            'pe_ratio' => 18.12,
            'currency' => 'INR',
            'timestamp' => '2026-03-21T09:50:40',
            'status' => 'offline'
        ],
        [
            'symbol' => 'INFY',
            'company_name' => 'Infosys Limited',
            'current_price' => 1255.90,
            'previous_price' => 1220.80,
            'price_change' => 35.10,
            'change_percent' => 2.88,
            'market_cap' => 5081882165248,
            'pe_ratio' => 16.86,
            'currency' => 'INR',
            'timestamp' => '2026-03-21T09:50:41',
            'status' => 'offline'
        ],
        [
            'symbol' => 'RELIANCE',
            'company_name' => 'Reliance Industries Limited',
            'current_price' => 1414.40,
            'previous_price' => 1384.80,
            'price_change' => 29.60,
            'change_percent' => 2.14,
            'market_cap' => 19140328816640,
            'pe_ratio' => 22.52,
            'currency' => 'INR',
            'timestamp' => '2026-03-21T09:50:43',
            'status' => 'offline'
        ],
        [
            'symbol' => 'ICICIBANK',
            'company_name' => 'ICICI Bank Limited',
            'current_price' => 1245.40,
            'previous_price' => 1250.10,
            'price_change' => -4.70,
            'change_percent' => -0.38,
            'market_cap' => 8915312967680,
            'pe_ratio' => 17.0,
            'currency' => 'INR',
            'timestamp' => '2026-03-21T09:50:45',
            'status' => 'offline'
        ],
        [
            'symbol' => 'WIPRO',
            'company_name' => 'Wipro Limited',
            'current_price' => 190.90,
            'previous_price' => 188.41,
            'price_change' => 2.49,
            'change_percent' => 1.32,
            'market_cap' => 1999988457472,
            'pe_ratio' => 15.13,
            'currency' => 'INR',
            'timestamp' => '2026-03-21T09:50:47',
            'status' => 'offline'
        ],
        [
            'symbol' => 'BAJAJ-AUTO',
            'company_name' => 'Bajaj Auto Limited',
            'current_price' => 6850.00,
            'previous_price' => 6755.50,
            'price_change' => 94.50,
            'change_percent' => 1.40,
            'market_cap' => 282654783488,
            'pe_ratio' => 12.45,
            'currency' => 'INR',
            'timestamp' => '2026-03-21T09:50:49',
            'status' => 'offline'
        ]
    ];
}
?>
