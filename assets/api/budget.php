<?php
require_once 'db.php';

// Get User ID from GET params (passed by frontend fetch)
$user_id_param = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$inputData = json_decode(file_get_contents("php://input"), true);
$user_id = $user_id_param ? $user_id_param : (isset($inputData['user_id']) ? intval($inputData['user_id']) : 0);

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access. User ID: " . $user_id]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all budgets for the user
        $stmt = $pdo->prepare("
            SELECT b.*, 
                   COALESCE(SUM(t.amount), 0) as spent 
            FROM budgets b 
            LEFT JOIN transactions t ON b.category = t.category AND t.user_id = b.user_id AND t.type = 'expense' AND MONTH(t.transaction_date) = MONTH(CURRENT_DATE()) AND YEAR(t.transaction_date) = YEAR(CURRENT_DATE())
            WHERE b.user_id = ? 
            GROUP BY b.id
        ");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        // Create new budget
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data && $inputData) $data = $inputData;

        if (!isset($data['category']) || !isset($data['limit_amount'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
            exit;
        }

        $sql = "INSERT INTO budgets (user_id, category, limit_amount, color) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $data['category'], $data['limit_amount'], $data['color'] ?? '#0a84ff']);
        
        echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        // Update budget
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data && $inputData) $data = $inputData;

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing budget ID"]);
            exit;
        }

        $fields = [];
        $params = [];
        
        if (isset($data['category'])) { $fields[] = "category = ?"; $params[] = $data['category']; }
        if (isset($data['limit_amount'])) { $fields[] = "limit_amount = ?"; $params[] = $data['limit_amount']; }
        if (isset($data['color'])) { $fields[] = "color = ?"; $params[] = $data['color']; }

        if (empty($fields)) {
            echo json_encode(["success" => true, "message" => "No changes"]);
            exit;
        }

        $sql = "UPDATE budgets SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
        $params[] = $data['id'];
        $params[] = $user_id;

        $stmt = $pdo->prepare($sql);
        if ($stmt->execute($params)) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update budget"]);
        }
        break;
        
    case 'DELETE':
        // Delete budget
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID"]);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(["status" => "deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
