const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all tasks with pagination, filtering, and sorting
router.get('/', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      priority = '',
      employee_id = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (status) {
      whereClause += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      whereClause += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (employee_id) {
      whereClause += ` AND t.employee_id = ?`;
      params.push(employee_id);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['title', 'status', 'priority', 'due_date', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = db.prepare(`
      SELECT COUNT(*) as total FROM tasks t WHERE ${whereClause}
    `).get(...params);
    const total = countResult.total;

    // Get tasks with employee info
    const tasks = db.prepare(`
      SELECT t.*, 
        e.first_name as employee_first_name, 
        e.last_name as employee_last_name,
        e.email as employee_email,
        e.department as employee_department
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      byStatus: db.prepare(`
        SELECT status, COUNT(*) as count FROM tasks GROUP BY status
      `).all(),
      byPriority: db.prepare(`
        SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority
      `).all(),
      overdue: db.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE due_date < DATE('now') AND status != 'completed'
      `).get(),
      dueThisWeek: db.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE due_date BETWEEN DATE('now') AND DATE('now', '+7 days') AND status != 'completed'
      `).get()
    };
    res.json(stats);
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
});

// Get single task
router.get('/:id', (req, res) => {
  try {
    const task = db.prepare(`
      SELECT t.*, 
        e.first_name as employee_first_name, 
        e.last_name as employee_last_name,
        e.email as employee_email
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE t.id = ?
    `).get(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
router.post('/', authMiddleware, [
  body('title').trim().notEmpty().escape(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status = 'pending', priority = 'medium', due_date, employee_id } = req.body;

  try {
    // Verify employee exists if provided
    if (employee_id) {
      const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id);
      if (!employee) {
        return res.status(400).json({ error: 'Employee not found' });
      }
    }

    const result = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date, employee_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, status, priority, due_date, employee_id || null, req.user.id);

    const newTask = db.prepare(`
      SELECT t.*, 
        e.first_name as employee_first_name, 
        e.last_name as employee_last_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authMiddleware, [
  body('title').optional().trim().notEmpty().escape(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, status, priority, due_date, employee_id } = req.body;

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify employee exists if provided
    if (employee_id) {
      const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(employee_id);
      if (!employee) {
        return res.status(400).json({ error: 'Employee not found' });
      }
    }

    db.prepare(`
      UPDATE tasks SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        employee_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, status, priority, due_date, employee_id !== undefined ? employee_id : task.employee_id, id);

    const updatedTask = db.prepare(`
      SELECT t.*, 
        e.first_name as employee_first_name, 
        e.last_name as employee_last_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE t.id = ?
    `).get(id);

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Bulk update tasks status
router.patch('/bulk/status', authMiddleware, [
  body('taskIds').isArray({ min: 1 }),
  body('status').isIn(['pending', 'in_progress', 'completed'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { taskIds, status } = req.body;

  try {
    const placeholders = taskIds.map(() => '?').join(',');
    db.prepare(`
      UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})
    `).run(status, ...taskIds);

    res.json({ message: `Updated ${taskIds.length} tasks to ${status}` });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update tasks' });
  }
});

module.exports = router;
