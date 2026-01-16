create database ecommerce;
use ecommerce;

create table users (
userId int auto_increment primary key,
username varchar(50) not null,
email varchar(100) not null,
password_hash varchar(255) not null,
created_at datetime default current_timestamp,
updated_at datetime default current_timestamp on update current_timestamp,
unique (email),
unique (username)
);

create table categories (
id int auto_increment primary key,
name varchar(50) not null
);

CREATE TABLE products (
  productId int auto_increment primary key,
  productName varchar(100) not null,
  productDescription text,
  productPrice decimal(10,2) not null,
  category_id INT,
  created_at datetime default current_timestamp,
  updated_at datetime default current_timestamp on update current_timestamp,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pending','shipped','delivered','canceled') NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(userID)
);


CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_oi_order
    FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_oi_product
    FOREIGN KEY (product_id) REFERENCES products(productId)
);


CREATE TABLE numbers (
  n INT PRIMARY KEY
);


INSERT INTO numbers (n)
SELECT a.n + b.n*10 + c.n*100 + d.n*1000 + e.n*10000 + f.n*100000
FROM
(SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
(SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b,
(SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c,
(SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) d,
(SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) e,
(SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) f
LIMIT 1000000;


SELECT COUNT(*) FROM numbers;


-- test dữ liệu 
INSERT INTO users (username, email, password_hash)
SELECT
  CONCAT('user_', n),
  CONCAT('user_', n, '@gmail.com'),
  'hashed_password'
FROM numbers
LIMIT 10;


INSERT INTO categories (name) VALUES
('Electronics'),
('Fashion'),
('Home'),
('Books'),
('Sports');


INSERT INTO categories (name) VALUES
('Electronics'),
('Fashion'),
('Home'),
('Books'),
('Sports');

INSERT INTO products (productName, productDescription, productPrice, category_id)
SELECT
  CONCAT('Product_', n),
  'Random product description',
  ROUND(RAND() * 5000000, 2),
  (n % 5) + 1
FROM numbers
LIMIT 10;


-- tét
INSERT INTO orders (user_id, status, total_amount, created_at)
SELECT
  (n % 10) + 1,
  ELT(FLOOR(1 + RAND() * 4), 'pending','shipped','delivered','canceled'),
  ROUND(RAND() * 3000000, 2),
  NOW() - INTERVAL (n % 365) DAY
FROM numbers;


SELECT COUNT(*) FROM orders;

-- 3tr records tesst
SHOW VARIABLES LIKE 'net_read_timeout';
SHOW VARIABLES LIKE 'net_write_timeout';
SHOW VARIABLES LIKE 'wait_timeout';


 INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
  o.id,
  FLOOR(1 + RAND() * 10),
  FLOOR(1 + RAND() * 3),
  p.productPrice
FROM orders o
JOIN numbers n ON n.n < 3
JOIN products p ON p.productId = FLOOR(1 + RAND() * 10); 


INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
  o.id,
  FLOOR(1 + RAND() * 10),
  FLOOR(1 + RAND() * 3),
  p.productPrice
FROM orders o
JOIN numbers n ON n.n < 3
JOIN products p ON p.productId = FLOOR(1 + RAND() * 10)
WHERE o.id BETWEEN 1 AND 200000;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
  o.id,
  FLOOR(1 + RAND() * 10),
  FLOOR(1 + RAND() * 3),
  p.productPrice
FROM orders o
JOIN numbers n ON n.n < 3
JOIN products p ON p.productId = FLOOR(1 + RAND() * 10)
WHERE o.id BETWEEN 200001 AND 400000;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
  o.id,
  FLOOR(1 + RAND() * 10),
  FLOOR(1 + RAND() * 3),
  p.productPrice
FROM orders o
JOIN numbers n ON n.n < 3
JOIN products p ON p.productId = FLOOR(1 + RAND() * 10)
WHERE o.id BETWEEN 400001 AND 600000;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
  o.id,
  FLOOR(1 + RAND() * 10),
  FLOOR(1 + RAND() * 3),
  p.productPrice
FROM orders o
JOIN numbers n ON n.n < 3
JOIN products p ON p.productId = FLOOR(1 + RAND() * 10)
WHERE o.id BETWEEN 600001 AND 800000;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
  o.id,
  FLOOR(1 + RAND() * 10),
  FLOOR(1 + RAND() * 3),
  p.productPrice
FROM orders o
JOIN numbers n ON n.n < 3
JOIN products p ON p.productId = FLOOR(1 + RAND() * 10)
WHERE o.id BETWEEN 800001 AND 1000000;


SELECT COUNT(*) FROM order_items;


-- test truy vấn 
-- 1. danh sachs đơn mới nhất 
select id, user_id, status, total_amount, created_at
from orders
order by created_at desc
limit 20;


-- 2. loc theo status
select * 
from orders
where status = "pending";

-- 3.loc theo user
select * 
from orders
where user_id = 1
order by created_at desc;

-- history mua hang
SELECT id, status, total_amount, created_at
FROM orders
WHERE user_id = 3
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;


SELECT COUNT(*) FROM orders;



