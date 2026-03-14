const express = require('express');
const protect = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controller/taskcontroller');

const router = express.Router();

router.post('/tasks', protect, createTask);
router.get('/tasks', protect, getTasks);
router.get('/tasks/:id', protect, getTaskById);
router.patch('/tasks/:id', protect, updateTask);
router.delete('/tasks/:id', protect, deleteTask);

module.exports = router;