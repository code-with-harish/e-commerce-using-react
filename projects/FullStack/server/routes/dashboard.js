const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      employees: {
        total: db.prepare('SELECT COUNT(*) as count FROM employees').get().count,
        active: db.prepare('SELECT COUNT(*) as count FROM employees WHERE status = ?').get('active').count,
        byDepartment: db.prepare(`
          SELECT department, COUNT(*) as count 
          FROM employees 
          GROUP BY department 
          ORDER BY count DESC
        `).all()
      },
      tasks: {
        total: db.prepare('SELECT COUNT(*) as count FROM tasks').get().count,
        pending: db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('pending').count,
        inProgress: db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('in_progress').count,
        completed: db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('completed').count,
        overdue: db.prepare(`
          SELECT COUNT(*) as count FROM tasks 
          WHERE due_date < DATE('now') AND status != 'completed'
        `).get().count,
        byPriority: db.prepare(`
          SELECT priority, COUNT(*) as count 
          FROM tasks 
          GROUP BY priority
        `).all()
      },
      recentActivity: {
        recentEmployees: db.prepare(`
          SELECT id, first_name, last_name, department, position, created_at 
          FROM employees 
          ORDER BY created_at DESC 
          LIMIT 5
        `).all(),
        recentTasks: db.prepare(`
          SELECT t.id, t.title, t.status, t.priority, t.due_date, t.created_at,
            e.first_name as employee_first_name, e.last_name as employee_last_name
          FROM tasks t
          LEFT JOIN employees e ON t.employee_id = e.id
          ORDER BY t.created_at DESC 
          LIMIT 5
        `).all(),
        upcomingDeadlines: db.prepare(`
          SELECT t.id, t.title, t.status, t.priority, t.due_date,
            e.first_name as employee_first_name, e.last_name as employee_last_name
          FROM tasks t
          LEFT JOIN employees e ON t.employee_id = e.id
          WHERE t.due_date >= DATE('now') AND t.status != 'completed'
          ORDER BY t.due_date ASC 
          LIMIT 5
        `).all()
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get employee performance data
router.get('/performance', (req, res) => {
  try {
    const performance = db.prepare(`
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        e.department,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.employee_id
      GROUP BY e.id
      ORDER BY completed_tasks DESC
      LIMIT 10
    `).all();

    res.json(performance);
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

module.exports = router;
