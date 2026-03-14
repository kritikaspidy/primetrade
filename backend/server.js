require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const protect = require('./middleware/auth'); 
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/adminroutes');



const { hashPassword, comparePassword } = require('./utils/hashpassword');
const generateToken = require('./utils/token');

const app = express();
app.use(cors());
app.use(express.json());


const port = process.env.PORT || 5000;


function success(res, data) {
    res.status(200).json(data);
    }

function error(res, message, status) {
    res.status(status).json({ error: message });
    }

app.get('/', async (req, res) => {
    res.json({
    challenge: "Complete the Authentication Flow",
    instruction:
      "Complete the authentication flow and obtain a valid access token.",
  });
});

app.post('/api/v1/auth/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return error(res, 'Username and password are required', 400);
    }

    if (password.length < 6) {
      return error(res, 'Password must be at least 6 characters', 400);
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return error(res, 'Username already exists', 409);
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, 'user']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Internal Server Error', 500);
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return error(res, 'Username and password are required', 400);
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return error(res, 'Invalid credentials', 401);
    }

    const user = result.rows[0];

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return error(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user);

    return success(res, {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Internal Server Error', 500);
  }
});


app.get('/api/v1/auth/profile', protect, async (req, res) => {
  res.json({
    message: 'Protected route working',
    user: req.user,
  });
});

app.use('/api/v1', apiRoutes);
app.use('/api/v1', adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
