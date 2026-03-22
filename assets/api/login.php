<?php
require_once 'db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)){
    
    $query = "SELECT id, full_name, email, password_hash, avatar_initials, plan_type FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    if($stmt->rowCount() > 0){
        $row = $stmt->fetch();
        
        if(password_verify($data->password, $row['password_hash'])){
            
            // Success - return user data directly
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['full_name'],
                    "email" => $row['email'],
                    "plan" => $row['plan_type'],
                    "avatar" => $row['avatar_initials'],
                    "currency" => "$"
                ]
            ]);

        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid password."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["error" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required."]);
}
?>
