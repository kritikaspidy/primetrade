const pool = require('../db');

const createTask = async (req, res) => {
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

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, created_by, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description || null,
        status || 'pending',
        priority || 'medium',
        normalizedDueDate,
        req.user.id,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE created_by = $1 OR assigned_to = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      message: 'Tasks fetched successfully',
      tasks: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE id = $1 AND (created_by = $2 OR assigned_to = $2)`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task fetched successfully',
      task: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  try {
    const existingTask = await pool.query(
      `SELECT * FROM tasks
       WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = existingTask.rows[0];

    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    const allowedPriorities = ['low', 'medium', 'high'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const normalizedDueDate =
      due_date === '' ? null : (due_date ?? oldTask.due_date);

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           priority = $4,
           due_date = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        title ?? oldTask.title,
        description ?? oldTask.description,
        status ?? oldTask.status,
        priority ?? oldTask.priority,
        normalizedDueDate,
        id,
      ]
    );

    res.status(200).json({
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND created_by = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};