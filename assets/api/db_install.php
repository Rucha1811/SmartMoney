<?php
require_once 'db.php';

echo "<h1>SmartMoney X - Database Update</h1>";

try {
    $commands = [
        "CREATE TABLE IF NOT EXISTS `financial_goals` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `user_id` int(11) NOT NULL,
          `name` varchar(100) NOT NULL,
          `target_amount` decimal(15,2) NOT NULL,
          `current_amount` decimal(15,2) DEFAULT 0.00,
          `deadline` date DEFAULT NULL,
          `icon` varchar(50) DEFAULT 'fa-solid fa-bullseye',
          `color` varchar(20) DEFAULT '#0a84ff',
          `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`),
          CONSTRAINT `financial_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",
        
        "CREATE TABLE IF NOT EXISTS `subscriptions` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `user_id` int(11) NOT NULL,
          `name` varchar(100) NOT NULL,
          `amount` decimal(10,2) NOT NULL,
          `billing_cycle` enum('Monthly','Yearly') DEFAULT 'Monthly',
          `next_payment_date` date NOT NULL,
          `category` varchar(50) DEFAULT 'General',
          `status` enum('Active','Cancelled') DEFAULT 'Active',
          `icon` varchar(50) DEFAULT 'fa-solid fa-ticket',
          `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`),
          CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",

        "CREATE TABLE IF NOT EXISTS `budgets` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `user_id` int(11) NOT NULL,
          `category` varchar(50) NOT NULL,
          `limit_amount` decimal(10,2) NOT NULL,
          `color` varchar(20) DEFAULT '#0a84ff',
          `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`),
          CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;"
    ];

    foreach ($commands as $sql) {
        $pdo->exec($sql);
        echo "<p style='color: green'>✓ Executed table creation.</p>";
    }
    
    echo "<h2>Update Complete! You can now use Goals and Subscriptions.</h2>";
    echo "<a href='../..'>Go to Dashboard</a>";

} catch (PDOException $e) {
    echo "<p style='color: red'>Error: " . $e->getMessage() . "</p>";
}
?>
