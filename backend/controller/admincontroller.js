const { User, Task } = require('../models');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role'],
      order: [['id', 'DESC']],
    });

    res.status(200).json({
      message: 'Users fetched successfully',
      users,
    });
  } catch (err) {
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'role'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'role'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.status(200).json({
      message: 'User deleted successfully',
      user,
    });
  } catch (err) {
    return next(err);
  }
};

const createAdminTask = async (req, res, next) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (assigned_to) {
      const userCheck = await User.findByPk(assigned_to);
      if (!userCheck) {
        return res.status(404).json({ error: 'Assigned user not found' });
      }
    }

    const task = await Task.create({
      title,
      description: description || null,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: due_date || null,
      createdBy: req.user.id,
      assignedTo: assigned_to || null,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (err) {
    return next(err);
  }
};

const getAllTasksAdmin = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'All tasks fetched successfully',
      tasks,
    });
  } catch (err) {
    return next(err);
  }
};

const getTaskByIdAdmin = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task fetched successfully',
      task,
    });
  } catch (err) {
    return next(err);
  }
};

const updateTaskAdmin = async (req, res, next) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  try {
    const existingTask = await Task.findByPk(req.params.id);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (assigned_to) {
      const userCheck = await User.findByPk(assigned_to);
      if (!userCheck) {
        return res.status(404).json({ error: 'Assigned user not found' });
      }
    }

    await existingTask.update({
      title: title ?? existingTask.title,
      description: description ?? existingTask.description,
      status: status ?? existingTask.status,
      priority: priority ?? existingTask.priority,
      dueDate: due_date ?? existingTask.dueDate,
      assignedTo: assigned_to ?? existingTask.assignedTo,
    });

    res.status(200).json({
      message: 'Task updated successfully',
      task: existingTask,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteTaskAdmin = async (req, res, next) => {
  try {
    const result = await Task.destroy({
      where: { id: req.params.id },
    });

    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
};

const assignTaskToUser = async (req, res, next) => {
  const { assigned_to } = req.body;

  try {
    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required' });
    }

    const taskCheck = await Task.findByPk(req.params.id);
    if (!taskCheck) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const userCheck = await User.findByPk(assigned_to);
    if (!userCheck) {
      return res.status(404).json({ error: 'Assigned user not found' });
    }

    await taskCheck.update({
      assignedTo: assigned_to,
    });

    res.status(200).json({
      message: 'Task assigned successfully',
      task: taskCheck,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  createAdminTask,
  getAllTasksAdmin,
  getTaskByIdAdmin,
  updateTaskAdmin,
  deleteTaskAdmin,
  assignTaskToUser,
};