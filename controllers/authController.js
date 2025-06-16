const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Register regular user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, false) RETURNING *`,
      [name, email, hash]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'User already exists or DB error' });
  }
};


// ✅ LOGIN CONTROLLER
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.username,
      email: user.email,
      is_admin: user.is_admin
    };

    res.json({ user: req.session.user, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
   const result = await db.query( 'SELECT id, username AS name, email, is_admin FROM users WHERE id = $1', [req.user.id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


exports.getCurrent = (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};


exports.getCurrentUser = async (req, res) => {
  console.log('Session content:', req.session);

  if (!req.session?.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = req.session.user.id;
   console.log('Looking for user ID:', userId); // ✅ log
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
