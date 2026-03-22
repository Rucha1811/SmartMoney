-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 29, 2023 at 08:30 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `money`
--
CREATE DATABASE IF NOT EXISTS `money` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `money`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_initials` varchar(5) DEFAULT NULL,
  `plan_type` enum('Free','Premium') DEFAULT 'Free',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `avatar_initials`, `plan_type`, `created_at`, `updated_at`) VALUES
(1, 'Tejas Gandhi', 'tejas@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TG', 'Premium', '2023-10-24 10:00:00', '2023-10-24 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `icon_class` varchar(50) DEFAULT 'fa-solid fa-circle',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `title`, `category`, `transaction_date`, `amount`, `type`, `icon_class`, `created_at`) VALUES
(1, 1, 'Apple Store', 'Shopping', '2023-10-24', -1299.00, 'expense', 'fa-brands fa-apple', '2023-10-24 14:30:00'),
(2, 1, 'Salary Deposit', 'Income', '2023-10-25', 4500.00, 'income', 'fa-solid fa-building-columns', '2023-10-25 09:00:00'),
(3, 1, 'Netflix Subscription', 'Entertainment', '2023-10-26', -15.99, 'expense', 'fa-solid fa-film', '2023-10-26 10:00:00'),
(4, 1, 'Uber Ride', 'Transport', '2023-10-27', -24.50, 'expense', 'fa-solid fa-car', '2023-10-27 18:45:00'),
(5, 1, 'Freelance Project', 'Income', '2023-10-28', 1200.00, 'income', 'fa-solid fa-laptop-code', '2023-10-28 15:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `portfolio_stocks`
--

CREATE TABLE `portfolio_stocks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `shares_owned` decimal(10,4) NOT NULL,
  `avg_buy_price` decimal(10,2) NOT NULL,
  `current_market_price` decimal(10,2) NOT NULL,
  `change_percent` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `portfolio_stocks`
--

INSERT INTO `portfolio_stocks` (`id`, `user_id`, `symbol`, `company_name`, `shares_owned`, `avg_buy_price`, `current_market_price`, `change_percent`) VALUES
(1, 1, 'AAPL', 'Apple Inc.', '10.0000', '145.00', '173.50', '1.25'),
(2, 1, 'TSLA', 'Tesla Inc.', '5.0000', '200.00', '215.30', '-0.85'),
(3, 1, 'NVDA', 'NVIDIA Corp.', '8.0000', '420.00', '460.10', '2.40');

-- --------------------------------------------------------

--
-- Table structure for table `portfolio_crypto`
--

CREATE TABLE `portfolio_crypto` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `holdings` decimal(18,8) NOT NULL,
  `avg_buy_price` decimal(15,2) NOT NULL,
  `current_price` decimal(15,2) NOT NULL,
  `change_percent` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `portfolio_crypto`
--

INSERT INTO `portfolio_crypto` (`id`, `user_id`, `symbol`, `name`, `holdings`, `avg_buy_price`, `current_price`, `change_percent`) VALUES
(1, 1, 'BTC', 'Bitcoin', '0.15000000', '28000.00', '34500.00', '5.20'),
(2, 1, 'ETH', 'Ethereum', '2.50000000', '1600.00', '1850.00', '1.80');

-- --------------------------------------------------------

--
-- Table structure for table `financial_stats`
--

CREATE TABLE `financial_stats` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `net_worth` decimal(15,2) DEFAULT 0.00,
  `monthly_income` decimal(15,2) DEFAULT 0.00,
  `monthly_expense` decimal(15,2) DEFAULT 0.00,
  `savings_rate` decimal(5,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `financial_stats`
--

INSERT INTO `financial_stats` (`id`, `user_id`, `net_worth`, `monthly_income`, `monthly_expense`, `savings_rate`, `updated_at`) VALUES
(1, 1, '84520.50', '6200.00', '2450.00', '45.00', '2023-10-29 10:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `portfolio_stocks`
--
ALTER TABLE `portfolio_stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `portfolio_crypto`
--
ALTER TABLE `portfolio_crypto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `financial_stats`
--
ALTER TABLE `financial_stats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `portfolio_stocks`
--
ALTER TABLE `portfolio_stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `portfolio_crypto`
--
ALTER TABLE `portfolio_crypto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `financial_stats`
--
ALTER TABLE `financial_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `portfolio_stocks`
--
ALTER TABLE `portfolio_stocks`
  ADD CONSTRAINT `portfolio_stocks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `portfolio_crypto`
--
ALTER TABLE `portfolio_crypto`
  ADD CONSTRAINT `portfolio_crypto_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `financial_stats`
--
ALTER TABLE `financial_stats`
  ADD CONSTRAINT `financial_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- --------------------------------------------------------

--
-- Table structure for table `financial_goals`
--

CREATE TABLE `financial_goals` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Indexes for table `financial_goals`
--
ALTER TABLE `financial_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for table `financial_goals`
--
ALTER TABLE `financial_goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Table structure for table `stocks_cache`
--

CREATE TABLE `stocks_cache` (
  `id` int(11) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `current_price` decimal(15,2) NOT NULL,
  `price_change` decimal(10,2) DEFAULT 0.00,
  `change_percent` decimal(8,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'INR',
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stocks_cache`
--

INSERT INTO `stocks_cache` (`symbol`, `company_name`, `current_price`, `price_change`, `change_percent`, `currency`, `last_updated`) VALUES
('TCS', 'Tata Consultancy Services', '3650.50', '45.25', '1.26', 'INR', NOW()),
('INFY', 'Infosys Limited', '1542.75', '-12.50', '-0.80', 'INR', NOW()),
('RELIANCE', 'Reliance Industries', '2890.30', '78.45', '2.79', 'INR', NOW()),
('HDFC', 'HDFC Bank', '1845.60', '35.20', '1.93', 'INR', NOW()),
('ICICI', 'ICICI Bank', '925.40', '-15.75', '-1.67', 'INR', NOW()),
('WIPRO', 'Wipro Limited', '385.25', '8.50', '2.26', 'INR', NOW());

--
-- Indexes for table `stocks_cache`
--
ALTER TABLE `stocks_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `symbol` (`symbol`);

--
-- AUTO_INCREMENT for table `stocks_cache`
--
ALTER TABLE `stocks_cache`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
