const pool = require('../db');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role FROM users ORDER BY id DESC'
    );

    res.status(200).json({
      message: 'Users fetched successfully',
      users: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, role',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createAdminTask = async (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (assigned_to) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [assigned_to]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Assigned user not found' });
      }
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
        due_date || null,
        req.user.id,
        assigned_to || null,
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

const getAllTasksAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );

    res.status(200).json({
      message: 'All tasks fetched successfully',
      tasks: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getTaskByIdAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [req.params.id]
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

const updateTaskAdmin = async (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  try {
    const existingTask = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [req.params.id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (assigned_to) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [assigned_to]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Assigned user not found' });
      }
    }

    const oldTask = existingTask.rows[0];

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           priority = $4,
           due_date = $5,
           assigned_to = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        title ?? oldTask.title,
        description ?? oldTask.description,
        status ?? oldTask.status,
        priority ?? oldTask.priority,
        due_date ?? oldTask.due_date,
        assigned_to ?? oldTask.assigned_to,
        req.params.id,
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

const deleteTaskAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [req.params.id]
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

const assignTaskToUser = async (req, res) => {
  const { assigned_to } = req.body;

  try {
    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required' });
    }

    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [req.params.id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [assigned_to]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Assigned user not found' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET assigned_to = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [assigned_to, req.params.id]
    );

    res.status(200).json({
      message: 'Task assigned successfully',
      task: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
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