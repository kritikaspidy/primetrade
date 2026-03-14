const express = require('express');

const taskRoutes = require('./taskroutes');

const router = express.Router();

// mount task routes
router.use('/', taskRoutes);


module.exports = router;