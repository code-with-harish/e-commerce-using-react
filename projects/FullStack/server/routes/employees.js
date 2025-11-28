const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all employees with pagination, filtering, and sorting
router.get('/', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      department = '', 
      status = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR position LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (department) {
      whereClause += ` AND department = ?`;
      params.push(department);
    }

    if (status) {
      whereClause += ` AND status = ?`;
      params.push(status);
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['first_name', 'last_name', 'email', 'department', 'position', 'salary', 'hire_date', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = db.prepare(`SELECT COUNT(*) as total FROM employees WHERE ${whereClause}`).get(...params);
    const total = countResult.total;

    // Get employees
    const employees = db.prepare(`
      SELECT * FROM employees 
      WHERE ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get departments list
router.get('/departments', (req, res) => {
  try {
    const departments = db.prepare(`
      SELECT DISTINCT department, COUNT(*) as count 
      FROM employees 
      GROUP BY department 
      ORDER BY department
    `).all();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get single employee
router.get('/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get employee's tasks
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE employee_id = ? ORDER BY due_date ASC
    `).all(req.params.id);

    res.json({ ...employee, tasks });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee
router.post('/', authMiddleware, [
  body('first_name').trim().notEmpty().escape(),
  body('last_name').trim().notEmpty().escape(),
  body('email').isEmail().normalizeEmail(),
  body('department').trim().notEmpty().escape(),
  body('position').trim().notEmpty().escape(),
  body('hire_date').isDate()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, phone, department, position, salary, hire_date, status = 'active', avatar } = req.body;

  try {
    // Check if email exists
    const existing = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    const result = db.prepare(`
      INSERT INTO employees (first_name, last_name, email, phone, department, position, salary, hire_date, status, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(first_name, last_name, email, phone, department, position, salary, hire_date, status, avatar);

    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', authMiddleware, [
  body('first_name').optional().trim().notEmpty().escape(),
  body('last_name').optional().trim().notEmpty().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().trim().notEmpty().escape(),
  body('position').optional().trim().notEmpty().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { first_name, last_name, email, phone, department, position, salary, hire_date, status, avatar } = req.body;

  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check email uniqueness if changed
    if (email && email !== employee.email) {
      const existing = db.prepare('SELECT id FROM employees WHERE email = ? AND id != ?').get(email, id);
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    db.prepare(`
      UPDATE employees SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        department = COALESCE(?, department),
        position = COALESCE(?, position),
        salary = COALESCE(?, salary),
        hire_date = COALESCE(?, hire_date),
        status = COALESCE(?, status),
        avatar = COALESCE(?, avatar),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(first_name, last_name, email, phone, department, position, salary, hire_date, status, avatar, id);

    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;
