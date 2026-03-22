<?php
require_once 'db.php';

header('Content-Type: application/json');
$user_id = 1;

// 1. Spending by Category (Pie Chart)
$stmt = $pdo->prepare("SELECT category, SUM(ABS(amount)) as total FROM transactions WHERE user_id = ? AND type = 'expense' GROUP BY category");
$stmt->execute([$user_id]);
$spending_by_category = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2. Income vs Expense Last 6 Months (Bar Chart)
// This requires a bit of SQL magic or loop in PHP. Let's do SQL.
// Simplified for SQLite/MariaDB
$sql = "
    SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expense
    FROM transactions 
    WHERE user_id = ? AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY month
    ORDER BY month ASC
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$income_vs_expense = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. Net Worth Trend (Line Chart) -> We need history for this, but user only has 'current' net worth stats.
// We can approximate it by calculating daily balance changes backwards?
// Or just show accumulated transaction history + initial balance?
// For now, let's just mock a trend or use the transactions to build a running balance.
// Running balance calculation:
$running_balance = 0; // Starting point? Ideally we have an initial balance.
// detailed calculation for trend line
$stmt = $pdo->prepare("SELECT transaction_date, amount FROM transactions WHERE user_id = ? ORDER BY transaction_date ASC");
$stmt->execute([$user_id]);
$history = $stmt->fetchAll(PDO::FETCH_ASSOC);

$trend = [];
$balance = 0; // Assume 0 start or fetch from user setting
foreach($history as $tx) {
    $balance += $tx['amount'];
    // key by month for smoother graph? or day?
    $date = $tx['transaction_date'];
    $trend[$date] = $balance; // Overwrites if multiple tx on same day, ideally we sum them
}

// Convert trend key-value to array
$trend_data = [];
$current_val = 0;
foreach($trend as $date => $val) {
    $data_point = ['date' => $date, 'value' => $val];
    $trend_data[] = $data_point;
}

echo json_encode([
    'spending_by_category' => $spending_by_category,
    'income_vs_expense' => $income_vs_expense,
    'net_worth_trend' => $trend_data
]);
?>
