require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/authroutes');
const adminRoutes = require('./routes/adminroutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorhandler');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', async (req, res) => {
  res.json({
    challenge: "Complete the Authentication Flow",
    instruction:
      "Complete the authentication flow and obtain a valid access token.",
  });
});

app.use('/api/v1', authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/api/v1', adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect database:', err.message);
    process.exit(1);
  }
};

startServer();
