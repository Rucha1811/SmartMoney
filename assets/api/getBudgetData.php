<?php
/**
 * Financial Insights - Budget vs Expense Comparison API
 * 
 * Retrieves budget allocations and actual spending by category
 * Returns JSON for Bar Chart visualization
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
    // Get current month date range
    $currentMonth = date('Y-m');
    $startDate = date('Y-m-01');
    $endDate = date('Y-m-t');
    
    // Get user id
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }
    
    // Query: Get budget vs actual spending
    $query = "
        SELECT 
            b.category,
            b.limit_amount as budget,
            COALESCE(SUM(ABS(t.amount)), 0) as spent,
            ROUND(COALESCE(SUM(ABS(t.amount)), 0) / b.limit_amount * 100, 1) as usage_percent,
            CASE 
                WHEN COALESCE(SUM(ABS(t.amount)), 0) > b.limit_amount THEN 'exceeded'
                WHEN COALESCE(SUM(ABS(t.amount)), 0) > (b.limit_amount * 0.8) THEN 'warning'
                ELSE 'ok'
            END as status
        FROM budgets b
        LEFT JOIN transactions t ON b.category = t.category 
            AND t.type = 'expense'
            AND t.transaction_date BETWEEN ? AND ?
            AND t.user_id = ?
        WHERE b.user_id = ?
        GROUP BY b.category, b.limit_amount
        ORDER BY b.limit_amount DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$startDate, $endDate, $user_id, $user_id]);
    $budgetData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate totals
    $totalBudget = 0;
    $totalSpent = 0;
    foreach ($budgetData as $item) {
        $totalBudget += floatval($item['budget']);
        $totalSpent += floatval($item['spent']);
    }
    
    // Query: Get category statistics
    $statsQuery = "
        SELECT 
            category,
            COUNT(*) as transaction_count,
            AVG(ABS(amount)) as avg_transaction,
            MAX(ABS(amount)) as max_transaction
        FROM transactions
        WHERE type = 'expense'
        AND transaction_date BETWEEN ? AND ?
        AND user_id = ?
        GROUP BY category
    ";
    
    $stmt = $conn->prepare($statsQuery);
    $stmt->execute([$startDate, $endDate, $user_id]);
    $statsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Merge stats with budget data
    $statsMap = [];
    foreach ($statsData as $stat) {
        $statsMap[$stat['category']] = $stat;
    }
    
    foreach ($budgetData as &$item) {
        if (isset($statsMap[$item['category']])) {
            $item['stats'] = $statsMap[$item['category']];
        }
    }
    
    // Prepare response
    $response = [
        'status' => 'success',
        'month' => $currentMonth,
        'budgetData' => $budgetData,
        'summary' => [
            'totalBudget' => round($totalBudget, 2),
            'totalSpent' => round($totalSpent, 2),
            'remaining' => round($totalBudget - $totalSpent, 2),
            'utilization' => round(($totalSpent / $totalBudget) * 100, 1)
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
