const express = require('express');
const {
  getAllUsers,
  getUserById,
  deleteUser,
  createAdminTask,
  getAllTasksAdmin,
  getTaskByIdAdmin,
  updateTaskAdmin,
  deleteTaskAdmin,
  assignTaskToUser
} = require('../controller/admincontroller');

const protect = require('../middleware/auth');
const authorizeRole = require('../middleware/authrole');

const router = express.Router();

router.use(protect);
router.use(authorizeRole('admin'));

router.get('/admin/users', getAllUsers);
router.get('/admin/users/:id', getUserById);
router.delete('/admin/users/:id', deleteUser);

router.post('/admin/tasks', createAdminTask);
router.get('/admin/tasks', getAllTasksAdmin);
router.get('/admin/tasks/:id', getTaskByIdAdmin);
router.patch('/admin/tasks/:id', updateTaskAdmin);
router.delete('/admin/tasks/:id', deleteTaskAdmin);
router.patch('/admin/tasks/:id/assign', assignTaskToUser);

module.exports = router;