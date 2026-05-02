-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert sample products
INSERT INTO products (name, price, description, image_url) VALUES
('iPhone 15', 999.99, 'Latest iPhone with A17 Pro chip', 'https://images.unsplash.com/photo-1690489876623-84c458799e3f?w=400'),
('MacBook Pro', 1999.99, '16-inch MacBook Pro M3 Max', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
('AirPods Pro', 249.99, 'Wireless earbuds with noise cancellation', 'https://images.unsplash.com/photo-1588423771079-cf495f6de772?w=400'),
('Apple Watch', 399.99, 'Series 9 with advanced health features', 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400'),
('iPad Pro', 1099.99, '12.9-inch M2 iPad Pro', 'https://images.unsplash.com/photo-1583354731455-1df7e318e59e?w=400');