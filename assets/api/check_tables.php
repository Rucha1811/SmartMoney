<?php
require_once 'db.php';

header('Content-Type: application/json');

$tables = [];
try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $status = [
        'financial_goals' => in_array('financial_goals', $tables),
        'subscriptions' => in_array('subscriptions', $tables),
        'existing_tables' => $tables
    ];
    
    echo json_encode(['success' => true, 'data' => $status]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
