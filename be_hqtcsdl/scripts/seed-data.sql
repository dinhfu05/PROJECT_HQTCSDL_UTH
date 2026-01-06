-- Seed Sample Data for Testing
-- Use this to verify API functionality

INSERT INTO categories (name, description) VALUES
('Electronics', 'Devices and gadgets'),
('Clothing', 'Apparel and fashion'),
('Books', 'Literature and educational materials');

INSERT INTO products (productName, productPrice, productDescription, category_id) VALUES
('iPhone 15 Pro', 28990000, 'Titanium design, A17 Pro chip', 1),
('MacBook Air M2', 24500000, 'Supercharged by M2', 1),
('Sony WH-1000XM5', 8490000, 'Noise cancelling headphones', 1),
('T-Shirt Cotton', 150000, '100% Cotton basic tee', 2),
('Jeans Slim Fit', 450000, 'Classic blue jeans', 2),
('Clean Code', 800000, 'A Handbook of Agile Software Craftsmanship', 3);
