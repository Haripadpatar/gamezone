-- Non-Veg Shop Delivery System Database Schema

CREATE DATABASE IF NOT EXISTS nonveg_delivery;
USE nonveg_delivery;

-- 1. Users Table (Admin & Customers)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'CUSTOMER', 'ADMIN'
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock DOUBLE NOT NULL, -- Quantity in stock (can be fractional like 15.5 kg)
    category_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Product Images Table (Supports multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- PLACED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    notes TEXT,
    distance_km DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    quantity DOUBLE NOT NULL, -- Supports weight-based ordering (e.g., 1.5 kg)
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 7. Shop Settings Table
CREATE TABLE IF NOT EXISTS shop_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL
);

-- Pre-populate Default Categories
INSERT INTO categories (id, name) VALUES 
(1, 'Chicken') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO categories (id, name) VALUES 
(2, 'Mutton') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO categories (id, name) VALUES 
(3, 'Fish') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO categories (id, name) VALUES 
(4, 'Egg') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO categories (id, name) VALUES 
(5, 'Others') ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Pre-populate Default Shop Settings
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('shop_name', 'FreshCut Non-Veg Hub') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('shop_address', '123 Market Road, Bangalore, Karnataka, India') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('shop_lat_lng', '12.9716,77.5946') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('shop_phone', '+919876543210') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('delivery_hours', '08:00 AM - 09:00 PM') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- Pre-populate Default Delivery Fees Tiers
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('delivery_fee_0_3', '50') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('delivery_fee_3_6', '80') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
INSERT INTO shop_settings (setting_key, setting_value) VALUES 
('delivery_fee_6_10', '120') ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
