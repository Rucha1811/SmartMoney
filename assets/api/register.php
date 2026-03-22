<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->name) &&
    !empty($data->email) &&
    !empty($data->password)
){
    // Check if email exists
    $check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($check_query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();
    
    if($stmt->rowCount() > 0){
        http_response_code(400);
        echo json_encode(["status" => "error", "error" => "Email already registered."]);
        exit();
    }

    // Insert new user
    $query = "INSERT INTO users SET full_name=:name, email=:email, password_hash=:password, avatar_initials=:avatar, plan_type='Free'";

    $stmt = $conn->prepare($query);

    // Sanitize and bind
    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    $avatar = strtoupper(substr($name, 0, 2));

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":avatar", $avatar);

    if($stmt->execute()){
        // Get the ID
        $user_id = $conn->lastInsertId();
        
        // Return success with user data (similar to what JS expects)
        echo json_encode([
            "status" => "success",
            "message" => "User registered successfully.",
            "user" => [
                "id" => $user_id,
                "name" => $name,
                "email" => $email,
                "plan" => "Free",
                "avatar" => $avatar,
                "currency" => "$"
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "error" => "Unable to register user."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "error" => "Incomplete data."]);
}
?>
