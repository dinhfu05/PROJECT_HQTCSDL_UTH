-- Initial database setup for HQTCSDL
-- Focus: Query optimization and performance learning

-- Create sample tables for query practice
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data
INSERT INTO users (email, name, password) VALUES
('admin@example.com', 'Admin User', 'hashed_password_1'),
('user1@example.com', 'User One', 'hashed_password_2'),
('user2@example.com', 'User Two', 'hashed_password_3');
