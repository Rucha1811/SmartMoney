<?php
/**
 * Financial Insights - Monthly Trend Data API
 * 
 * Retrieves expense trends over months
 * Returns JSON for Line Chart visualization
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
    // Get the last 12 months of data
    $months = [];
    $dates = [];
    for ($i = 11; $i >= 0; $i--) {
        $date = new DateTime("-$i months");
        $months[] = $date->format('Y-m');
        $dates[] = $date->format('Y-m-d');
    }
    
    // Query: Monthly expense and income trends
    $query = "
        SELECT 
            DATE_TRUNC(transaction_date, MONTH) as month,
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
            COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count
        FROM transactions
        WHERE user_id = 1
        AND DATE_TRUNC(transaction_date, MONTH) >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_TRUNC(transaction_date, MONTH)
        ORDER BY DATE_TRUNC(transaction_date, MONTH)
    ";
    
    // SQLite compatible version
    $query = "
        SELECT 
            strftime('%Y-%m', transaction_date) as month,
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
            COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count
        FROM transactions
        WHERE user_id = 1
        GROUP BY strftime('%Y-%m', transaction_date)
        ORDER BY strftime('%Y-%m', transaction_date) DESC
        LIMIT 12
    ";
    
    // MySQL compatible version (more common)
    $query = "
        SELECT 
            DATE_FORMAT(transaction_date, '%Y-%m') as month,
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
            COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count
        FROM transactions
        WHERE user_id = 1
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY DATE_FORMAT(transaction_date, '%Y-%m') DESC
        LIMIT 12
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $trendData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Reverse to get chronological order (oldest to newest)
    $trendData = array_reverse($trendData);
    
    // Query: Category-wise monthly breakdown
    $categoryTrendQuery = "
        SELECT 
            DATE_FORMAT(transaction_date, '%Y-%m') as month,
            category,
            SUM(ABS(amount)) as amount,
            COUNT(*) as count
        FROM transactions
        WHERE user_id = 1
        AND type = 'expense'
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), category
        ORDER BY DATE_FORMAT(transaction_date, '%Y-%m') DESC
        LIMIT 120
    ";
    
    $stmt = $conn->prepare($categoryTrendQuery);
    $stmt->execute();
    $categoryTrendData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate averages
    $totalExpenses = array_sum(array_map(function($x) { return floatval($x['total_expenses']); }, $trendData));
    $avgExpenses = count($trendData) > 0 ? $totalExpenses / count($trendData) : 0;
    
    // Prepare response
    $response = [
        'status' => 'success',
        'trendData' => $trendData,
        'categoryTrendData' => $categoryTrendData,
        'analytics' => [
            'totalExpensesLast12M' => round($totalExpenses, 2),
            'averageMonthlyExpense' => round($avgExpenses, 2),
            'highestMonth' => max(array_map(function($x) { return floatval($x['total_expenses']); }, $trendData)),
            'lowestMonth' => min(array_map(function($x) { return floatval($x['total_expenses']); }, $trendData)),
            'dataPoints' => count($trendData)
        ],
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
