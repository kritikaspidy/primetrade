const { Op } = require('sequelize');
const { Task } = require('../models');

const createTask = async (req, res, next) => {
  const { title, description, status, priority, due_date } = req.body;

  const normalizedDueDate = due_date === '' ? null : due_date;

  try {
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    const allowedPriorities = ['low', 'medium', 'high'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const task = await Task.create({
      title,
      description: description || null,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: normalizedDueDate,
      createdBy: req.user.id,
      assignedTo: req.user.id,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (err) {
    return next(err);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      where: {
        [Op.or]: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
      },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Tasks fetched successfully',
      tasks,
    });
  } catch (err) {
    return next(err);
  }
};

const getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: {
        id,
        [Op.or]: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
      },
    });

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

const updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  try {
    const existingTask = await Task.findOne({
      where: {
        id,
        createdBy: req.user.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    const allowedPriorities = ['low', 'medium', 'high'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const normalizedDueDate =
      due_date === '' ? null : (due_date ?? existingTask.dueDate);

    await existingTask.update({
      title: title ?? existingTask.title,
      description: description ?? existingTask.description,
      status: status ?? existingTask.status,
      priority: priority ?? existingTask.priority,
      dueDate: normalizedDueDate,
    });

    res.status(200).json({
      message: 'Task updated successfully',
      task: existingTask,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await Task.destroy({
      where: {
        id,
        createdBy: req.user.id,
      },
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

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};