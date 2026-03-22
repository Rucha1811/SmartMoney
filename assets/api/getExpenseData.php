<?php
/**
 * Financial Insights - Expense Data API
 * 
 * Retrieves aggregated expense data grouped by category
 * Returns JSON for Chart.js visualization
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    // Get the requested timeframe (default: current month)
    $timeframe = isset($_GET['timeframe']) ? $_GET['timeframe'] : 'month';
    
    // Determine the date range
    $startDate = date('Y-m-01'); // First day of current month
    $endDate = date('Y-m-t');    // Last day of current month
    
    if ($timeframe === 'year') {
        $startDate = date('Y-01-01');
        $endDate = date('Y-12-31');
    } elseif ($timeframe === 'week') {
        $startDate = date('Y-m-d', strtotime('monday this week'));
        $endDate = date('Y-m-d', strtotime('sunday this week'));
    }
    
    // Query 1: Expenses by Category (Pie Chart Data)
    $categoryQuery = "
        SELECT 
            category,
            SUM(ABS(amount)) AS total,
            COUNT(*) as count
        FROM transactions
        WHERE type = 'expense'
        AND transaction_date BETWEEN ? AND ?
        AND user_id = 1
        GROUP BY category
        ORDER BY total DESC
    ";
    
    $stmt = $conn->prepare($categoryQuery);
    $stmt->execute([$startDate, $endDate]);
    $categoryData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Query 2: Daily expenses trend (Line Chart Data)
    $trendQuery = "
        SELECT 
            DATE(transaction_date) as date,
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
        FROM transactions
        WHERE transaction_date BETWEEN ? AND ?
        AND user_id = 1
        GROUP BY DATE(transaction_date)
        ORDER BY DATE(transaction_date)
    ";
    
    $stmt = $conn->prepare($trendQuery);
    $stmt->execute([$startDate, $endDate]);
    $trendData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Query 3: Total statistics
    $statsQuery = "
        SELECT 
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions
        WHERE transaction_date BETWEEN ? AND ?
        AND user_id = 1
    ";
    
    $stmt = $conn->prepare($statsQuery);
    $stmt->execute([$startDate, $endDate]);
    $statsData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Prepare response
    $response = [
        'status' => 'success',
        'timeframe' => $timeframe,
        'startDate' => $startDate,
        'endDate' => $endDate,
        'categoryData' => $categoryData,
        'trendData' => $trendData,
        'statistics' => $statsData,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
