const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      salary REAL,
      hire_date DATE NOT NULL,
      status TEXT DEFAULT 'active',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date DATE,
      employee_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ Database tables created successfully');
};

// Seed initial data
const seedData = () => {
  // Check if data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('📦 Database already seeded');
    return;
  }

  // Create admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (username, email, password, role) 
    VALUES (?, ?, ?, ?)
  `).run('admin', 'admin@company.com', hashedPassword, 'admin');

  // Create demo user
  const demoPassword = bcrypt.hashSync('demo123', 10);
  db.prepare(`
    INSERT INTO users (username, email, password, role) 
    VALUES (?, ?, ?, ?)
  `).run('demo', 'demo@company.com', demoPassword, 'user');

  // Seed employees
  const employees = [
    ['John', 'Smith', 'john.smith@company.com', '+1-555-0101', 'Engineering', 'Senior Developer', 95000, '2022-03-15', 'active'],
    ['Sarah', 'Johnson', 'sarah.johnson@company.com', '+1-555-0102', 'Marketing', 'Marketing Manager', 85000, '2021-06-20', 'active'],
    ['Michael', 'Brown', 'michael.brown@company.com', '+1-555-0103', 'Engineering', 'Junior Developer', 65000, '2023-01-10', 'active'],
    ['Emily', 'Davis', 'emily.davis@company.com', '+1-555-0104', 'HR', 'HR Specialist', 70000, '2022-08-05', 'active'],
    ['David', 'Wilson', 'david.wilson@company.com', '+1-555-0105', 'Sales', 'Sales Representative', 60000, '2023-04-12', 'active'],
    ['Jessica', 'Taylor', 'jessica.taylor@company.com', '+1-555-0106', 'Engineering', 'Tech Lead', 110000, '2020-11-30', 'active'],
    ['Robert', 'Anderson', 'robert.anderson@company.com', '+1-555-0107', 'Finance', 'Financial Analyst', 80000, '2021-09-18', 'active'],
    ['Amanda', 'Thomas', 'amanda.thomas@company.com', '+1-555-0108', 'Marketing', 'Content Specialist', 55000, '2023-02-28', 'active'],
    ['James', 'Martinez', 'james.martinez@company.com', '+1-555-0109', 'Engineering', 'DevOps Engineer', 100000, '2022-05-22', 'active'],
    ['Lisa', 'Garcia', 'lisa.garcia@company.com', '+1-555-0110', 'HR', 'HR Manager', 90000, '2020-07-14', 'active']
  ];

  const insertEmployee = db.prepare(`
    INSERT INTO employees (first_name, last_name, email, phone, department, position, salary, hire_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  employees.forEach(emp => insertEmployee.run(...emp));

  // Seed tasks
  const tasks = [
    ['Complete Q4 Report', 'Prepare and submit the quarterly financial report', 'in_progress', 'high', '2025-12-15', 7, 1],
    ['Update Employee Handbook', 'Review and update company policies', 'pending', 'medium', '2025-12-20', 4, 1],
    ['Code Review Sprint 23', 'Review all PRs from sprint 23', 'completed', 'high', '2025-11-25', 1, 1],
    ['Marketing Campaign Launch', 'Launch the holiday marketing campaign', 'in_progress', 'high', '2025-12-01', 2, 1],
    ['Server Maintenance', 'Perform scheduled server maintenance', 'pending', 'medium', '2025-12-05', 9, 1],
    ['New Employee Onboarding', 'Onboard three new team members', 'in_progress', 'medium', '2025-12-10', 10, 1],
    ['Bug Fix: Login Issue', 'Fix the authentication bug reported by users', 'completed', 'high', '2025-11-20', 3, 1],
    ['Sales Presentation', 'Prepare Q1 sales presentation', 'pending', 'low', '2025-12-30', 5, 1],
    ['API Documentation', 'Document all REST API endpoints', 'in_progress', 'medium', '2025-12-08', 6, 1],
    ['Content Calendar', 'Plan content for January 2026', 'pending', 'low', '2025-12-25', 8, 1]
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date, employee_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  tasks.forEach(task => insertTask.run(...task));

  console.log('🌱 Database seeded with initial data');
};

// Initialize database
createTables();
seedData();

module.exports = db;
