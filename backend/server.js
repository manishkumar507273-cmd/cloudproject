const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ✅ IMPORTANT (Railway)
  ssl: { rejectUnauthorized: false },         // ✅ REQUIRED for Railway
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};


// ================= ROUTES =================

// Register
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email',
      [name, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products
app.get('/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/products', authenticateToken, async (req, res) => {
  const { name, price, description, image_url } = req.body;

  const result = await pool.query(
    'INSERT INTO products (name,price,description,image_url) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, price, description, image_url]
  );

  res.json(result.rows[0]);
});

// Cart
app.post('/cart', authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.user.id;

  const existing = await pool.query(
    'SELECT * FROM cart WHERE user_id=$1 AND product_id=$2',
    [user_id, product_id]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      'UPDATE cart SET quantity=quantity+$1 WHERE user_id=$2 AND product_id=$3',
      [quantity, user_id, product_id]
    );
  } else {
    await pool.query(
      'INSERT INTO cart (user_id,product_id,quantity) VALUES ($1,$2,$3)',
      [user_id, product_id, quantity]
    );
  }

  res.json({ message: 'Added to cart' });
});

app.get('/cart/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  const result = await pool.query(`
    SELECT c.*, p.name, p.price, p.image_url
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
  `, [user_id]);

  res.json(result.rows);
});

app.delete('/cart/:id', authenticateToken, async (req, res) => {
  await pool.query('DELETE FROM cart WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.sendStatus(204);
});

// Order
app.post('/order', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  const cartItems = await pool.query(`
    SELECT c.*, p.price
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id=$1
  `, [user_id]);

  const total = cartItems.rows.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await pool.query(
    'INSERT INTO orders (user_id,total_price) VALUES ($1,$2) RETURNING *',
    [user_id, total]
  );

  for (const item of cartItems.rows) {
    await pool.query(
      'INSERT INTO order_items (order_id,product_id,quantity,price) VALUES ($1,$2,$3,$4)',
      [order.rows[0].id, item.product_id, item.quantity, item.price]
    );
  }

  await pool.query('DELETE FROM cart WHERE user_id=$1', [user_id]);

  res.json({ message: 'Order placed' });
});


// ================= SERVE FRONTEND =================

// 👇 VERY IMPORTANT PART
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});