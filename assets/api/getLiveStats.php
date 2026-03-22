<?php
/**
 * Live Statistics API
 * 
 * Calculates real-time dashboard statistics based on user's transaction data.
 * Since we're using localStorage (MoneyDB) for transactions, this API provides
 * server-side calculation capabilities for future scaling to a real database.
 * 
 * For now, returns mock data with smart calculations based on transaction patterns.
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// For demonstration, generate live stats with realistic variations
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 1;

try {
    // Current month
    $monthStart = date('Y-m-01');
    $monthEnd = date('Y-m-t');
    
    // Generate realistic statistics
    // In production, this would query the actual database
    // For now, we return calculated stats based on seed data patterns
    
    $baseIncome = 5700; // Base monthly income
    $baseExpense = 1890; // Base monthly expense
    
    // Add some variation based on the day of month
    $dayOfMonth = intval(date('d'));
    $incomeMultiplier = 1 + (($dayOfMonth / 30) * 0.15); // Gradually increase throughout month
    $expenseMultiplier = 1 + (($dayOfMonth / 30) * 0.25); // Expenses trend up
    
    $monthlyIncome = round($baseIncome * $incomeMultiplier, 2);
    $monthlyExpense = round($baseExpense * $expenseMultiplier, 2);
    
    $monthlyNetSavings = round($monthlyIncome - $monthlyExpense, 2);
    $savingsRate = $monthlyIncome > 0 ? round((($monthlyIncome - $monthlyExpense) / $monthlyIncome) * 100, 1) : 0;
    
    // Assets calculation
    $accountBalance = 45000 + (rand(-500, 1000)); // Bank accounts
    $investmentValue = 35000 + (rand(-2000, 3000)); // Portfolio
    $netWorth = $accountBalance + $investmentValue;
    
    // Last month comparison
    $lastMonthExpense = round($baseExpense * 0.95, 2); // Usually slightly less last month
    $expenseChangePercent = round((($monthlyExpense - $lastMonthExpense) / $lastMonthExpense) * 100, 1);
    
    $categoryBreakdown = [
        'Shopping' => round($monthlyExpense * 0.35, 2),
        'Entertainment' => round($monthlyExpense * 0.08, 2),
        'Transport' => round($monthlyExpense * 0.18, 2),
        'Food' => round($monthlyExpense * 0.25, 2),
        'Other' => round($monthlyExpense * 0.14, 2)
    ];
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => [
            'netWorth' => round($netWorth, 2),
            'monthlyIncome' => $monthlyIncome,
            'monthlyExpense' => $monthlyExpense,
            'monthlyNetSavings' => $monthlyNetSavings,
            'savingsRate' => $savingsRate,
            'accountBalance' => round($accountBalance, 2),
            'investmentValue' => round($investmentValue, 2),
            'monthStart' => $monthStart,
            'monthEnd' => $monthEnd,
            'lastMonthExpense' => $lastMonthExpense,
            'expenseChangePercent' => $expenseChangePercent,
            'categoryBreakdown' => $categoryBreakdown,
            'transactionCount' => rand(25, 45),
            'insight' => generateInsight($monthlyIncome, $monthlyExpense, $savingsRate)
        ]
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error calculating statistics',
        'error' => $e->getMessage()
    ]);
}

/**
 * Generate insight text based on stats
 */
function generateInsight($income, $expense, $savingsRate) {
    if ($income == 0) {
        return "Add income transactions to see insights";
    }
    
    if ($savingsRate >= 50) {
        return "Excellent! You're saving " . $savingsRate . "% of your income. Keep it up! 🎯";
    } else if ($savingsRate >= 30) {
        return "Good! You're saving " . $savingsRate . "% of your income. Room for improvement. 📈";
    } else if ($savingsRate >= 10) {
        return "Your savings rate is " . $savingsRate . "%. Consider reducing expenses. 💡";
    } else if ($savingsRate > 0) {
        return "Low savings rate at " . $savingsRate . "%. Focus on reducing expenses. ⚠️";
    } else {
        return "You're spending more than earning. Review your expenses! 🚨";
    }
}
?>
