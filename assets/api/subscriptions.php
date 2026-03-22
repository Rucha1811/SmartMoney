<?php
require_once 'db.php';

header('Content-Type: application/json');
$user_id = 1; // Default user

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_payment_date ASC");
        $stmt->execute([$user_id]);
        $subs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($subs);
        break;

   case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $fields = ['name', 'amount', 'next_payment_date'];
        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing $field"]);
                exit;
            }
        }

        $stmt = $pdo->prepare("INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_payment_date, category, icon, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $billing = isset($data['billing_cycle']) ? $data['billing_cycle'] : 'Monthly';
        $category = isset($data['category']) ? $data['category'] : 'General';
        $icon = isset($data['icon']) ? $data['icon'] : 'fa-solid fa-ticket';
        $status = isset($data['status']) ? $data['status'] : 'Active';

        if ($stmt->execute([$user_id, $data['name'], $data['amount'], $billing, $data['next_payment_date'], $category, $icon, $status])) {
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add subscription']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing subscription ID']);
            exit;
        }

        $fields = [];
        $params = [];
        
        if (isset($data['name'])) { $fields[] = "name = ?"; $params[] = $data['name']; }
        if (isset($data['amount'])) { $fields[] = "amount = ?"; $params[] = $data['amount']; }
        if (isset($data['billing_cycle'])) { $fields[] = "billing_cycle = ?"; $params[] = $data['billing_cycle']; }
        if (isset($data['next_payment_date'])) { $fields[] = "next_payment_date = ?"; $params[] = $data['next_payment_date']; }
        if (isset($data['category'])) { $fields[] = "category = ?"; $params[] = $data['category']; }
        if (isset($data['icon'])) { $fields[] = "icon = ?"; $params[] = $data['icon']; }
        if (isset($data['status'])) { $fields[] = "status = ?"; $params[] = $data['status']; }

        if (empty($fields)) {
            echo json_encode(['success' => true, 'message' => 'No changes']);
            exit;
        }

        $sql = "UPDATE subscriptions SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
        $params[] = $data['id'];
        $params[] = $user_id;

        $stmt = $pdo->prepare($sql);
        if ($stmt->execute($params)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update subscription']);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['success' => true]);
        break;
}
?>
