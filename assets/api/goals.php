<?php
require_once 'db.php';

header('Content-Type: application/json');

// Check if user is logged in (simulated for now, or check session)
// In a real app, we'd check $_SESSION['user_id']
$user_id = 1; // Default to user 1 for this demo environment

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // Fetch all goals
            $stmt = $pdo->prepare("SELECT * FROM financial_goals WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user_id]);
            $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($goals ?: []);
            break;

        case 'POST':
            // Create new goal
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!isset($data['name']) || !isset($data['target_amount'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: name and target_amount']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO financial_goals (user_id, name, target_amount, current_amount, deadline, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)");
            
            $current_amount = isset($data['current_amount']) ? (float)$data['current_amount'] : 0;
            $deadline = isset($data['deadline']) && !empty($data['deadline']) ? $data['deadline'] : null;
            $icon = isset($data['icon']) ? $data['icon'] : 'fa-solid fa-bullseye';
            $color = isset($data['color']) ? $data['color'] : '#0a84ff';

            if ($stmt->execute([$user_id, $data['name'], (float)$data['target_amount'], $current_amount, $deadline, $icon, $color])) {
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create goal: ' . implode(', ', $stmt->errorInfo())]);
            }
            break;

        case 'PUT':
            // Update goal (add money or edit details)
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing goal ID']);
                exit;
            }

            // Build dynamic update query
            $fields = [];
            $params = [];
            
            if (isset($data['name'])) { $fields[] = "name = ?"; $params[] = $data['name']; }
            if (isset($data['target_amount'])) { $fields[] = "target_amount = ?"; $params[] = (float)$data['target_amount']; }
            if (isset($data['current_amount'])) { $fields[] = "current_amount = ?"; $params[] = (float)$data['current_amount']; }
            if (isset($data['deadline'])) { $fields[] = "deadline = ?"; $params[] = !empty($data['deadline']) ? $data['deadline'] : null; }
            if (isset($data['icon'])) { $fields[] = "icon = ?"; $params[] = $data['icon']; }
            if (isset($data['color'])) { $fields[] = "color = ?"; $params[] = $data['color']; }

            if (empty($fields)) {
                echo json_encode(['success' => true, 'message' => 'No changes made']);
                exit;
            }

            $sql = "UPDATE financial_goals SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
            $params[] = $data['id'];
            $params[] = $user_id;

            $stmt = $pdo->prepare($sql);
            if ($stmt->execute($params)) {
                 echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update goal: ' . implode(', ', $stmt->errorInfo())]);
            }
            break;

        case 'DELETE':
            // Delete goal
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing goal ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM financial_goals WHERE id = ? AND user_id = ?");
            if ($stmt->execute([$id, $user_id])) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete goal: ' . implode(', ', $stmt->errorInfo())]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>

