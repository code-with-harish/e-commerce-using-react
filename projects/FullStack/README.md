#  TaskFlow - Employee & Task Management System

A full-stack web application for managing employees and tasks, built with React, Node.js, Express, and SQLite.

![TaskFlow Dashboard](screenshots/dashboard.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Bonus Features](#bonus-features)
- [Assumptions](#assumptions)

## Features

### Frontend (Track 1)
-  Responsive design that works on desktop and mobile
-  Modern, clean UI with smooth animations
-  Interactive dashboard with Chart.js visualizations
-  Search and filter functionality for employees and tasks
-  Pagination for large datasets
-  Client-side form validation
-  **Dark Mode** - Toggle between light and dark themes
-  **Kanban Board** - Drag-and-drop task management view
-  **Employee Profiles** - Detailed employee pages with task history

### Backend (Track 2)
-  JWT-based authentication system
-  Protected API routes with middleware
-  Full CRUD operations for Employees and Tasks
-  Input validation and sanitization
-  SQLite database with proper schema design
-  Dashboard statistics API
-  Health check endpoint for deployment monitoring

### Full Stack (Track 3)
-  Seamless frontend-backend integration
-  Real-time data synchronization
-  User authentication flow (login/register)
-  Toast notifications for user feedback
-  Consistent error handling across stack
-  **Deployment Ready** - Configured for Render & Netlify

##  Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Chart.js |
| Styling | Custom CSS (CSS Variables, Flexbox, Grid) |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| API Validation | express-validator |
| HTTP Client | Axios |

##  Project Structure

```
FullStack/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/
│       │   └── Navbar.js      # Navigation with theme toggle
│       ├── context/
│       │   ├── AuthContext.js # Authentication state management
│       │   └── ThemeContext.js # Dark mode theme management
│       ├── pages/
│       │   ├── Dashboard.js   # Dashboard with charts
│       │   ├── Employees.js   # Employee management
│       │   ├── EmployeeProfile.js # Employee detail page
│       │   ├── Login.js       # Authentication page
│       │   ├── Tasks.js       # Task list management
│       │   └── TaskBoard.js   # Kanban board view
│       ├── services/
│       │   └── api.js         # Axios configuration
│       ├── App.js             # Main app with routing
│       ├── index.css          # Global styles (light/dark)
│       └── index.js           # Entry point
│
├── server/                    # Node.js Backend
│   ├── config/
│   │   └── database.js        # SQLite setup & seed data
│   ├── data/
│   │   └── database.sqlite    # SQLite database file
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── dashboard.js       # Dashboard statistics
│   │   ├── employees.js       # Employee CRUD routes
│   │   └── tasks.js           # Task CRUD routes
│   └── index.js               # Express server entry
│
├── .env.example               # Environment variables template
├── .gitignore
├── netlify.toml               # Netlify deployment config
├── render.yaml                # Render deployment config
├── package.json               # Root package.json
└── README.md
```

##  Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/code-with-harish/my-repo.git
   cd FullStack
   ```

2. **Install all dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install && cd ..
   ```

   Or use the convenience script:
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and set your JWT_SECRET
   # PORT=5000
   # JWT_SECRET=your-secret-key
   # NODE_ENV=development
   ```

4. **Start the application**

   **Development mode (both servers):**
   ```bash
   npm run dev
   ```

   **Or run separately:**
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Demo Credentials

```
Email: admin@company.com
Password: admin123

-- or --

Email: demo@company.com
Password: demo123
```

## API Documentation

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/me` | GET | Get current user | Yes |

### Employees

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/employees` | GET | Get all employees (paginated) | No |
| `/api/employees/:id` | GET | Get single employee | No |
| `/api/employees` | POST | Create employee | Yes |
| `/api/employees/:id` | PUT | Update employee | Yes |
| `/api/employees/:id` | DELETE | Delete employee | Yes |
| `/api/employees/departments` | GET | Get department list | No |

**Query Parameters for GET /api/employees:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name, email, or position
- `department` - Filter by department
- `status` - Filter by status (active/inactive)
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - ASC or DESC (default: DESC)

### Tasks

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/tasks` | GET | Get all tasks (paginated) | No |
| `/api/tasks/:id` | GET | Get single task | No |
| `/api/tasks` | POST | Create task | Yes |
| `/api/tasks/:id` | PUT | Update task | Yes |
| `/api/tasks/:id` | DELETE | Delete task | Yes |
| `/api/tasks/stats` | GET | Get task statistics | No |

**Query Parameters for GET /api/tasks:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by title or description
- `status` - Filter by status (pending/in_progress/completed)
- `priority` - Filter by priority (low/medium/high)
- `employee_id` - Filter by assigned employee

### Dashboard

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/dashboard/stats` | GET | Get dashboard statistics | No |
| `/api/dashboard/performance` | GET | Get employee performance | No |

## Screenshots

### Login Page
Modern login interface with demo credentials displayed and dark mode support.

### Dashboard
Interactive dashboard showing:
- Summary statistics cards
- Task status doughnut chart
- Employees by department bar chart
- Recent employees and upcoming deadlines

### Employees Page
Full employee management with:
- Search and filter functionality
- Add/Edit modal forms
- Pagination
- Status badges
- Link to detailed employee profiles

### Employee Profile
Detailed employee view featuring:
- Employee information card
- Statistics overview
- Assigned tasks list
- Performance metrics

### Tasks Page
Task management featuring:
- Quick status update dropdown
- Priority indicators
- Overdue highlighting
- Assignee management

### Task Board (Kanban)
Visual task management with:
- Three columns: Pending, In Progress, Completed
- Drag-and-drop interface
- Priority and due date indicators
- Quick task filtering

### Dark Mode
Toggle between light and dark themes:
- Persisted in localStorage
- Smooth transition animations
- Full UI coverage

## Bonus Features

1. **JWT Authentication** - Secure user authentication with token-based system
2. **Interactive Charts** - Visual data representation using Chart.js
3. **Responsive Design** - Mobile-friendly UI that adapts to all screen sizes
4. **Toast Notifications** - Real-time feedback for user actions
5. **Advanced Filtering** - Multiple filter options with pagination
6. **Database Seeding** - Pre-populated demo data for testing
7. **Input Validation** - Both client-side and server-side validation
8. **Error Handling** - Comprehensive error handling with user-friendly messages
9. **Quick Status Toggle** - Change task status directly from the table
10. **Overdue Detection** - Visual indication of overdue tasks
11. **Dark Mode** - Theme toggle with localStorage persistence
12. **Kanban Board** - Visual task management with drag-and-drop columns
13. **Employee Profiles** - Detailed employee pages with assigned tasks
14. **Deployment Config** - Ready for Render (backend) & Netlify (frontend)

##  Deployment

### Deploy Backend to Render

1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Select **Node** environment
5. Set build command: `npm install`
6. Set start command: `npm run server`
7. Add environment variable: `JWT_SECRET` (generate a random string)
8. Deploy!

Your API will be available at: `https://your-app-name.onrender.com`

### Deploy Frontend to Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set base directory: `client`
4. Set build command: `npm run build`
5. Set publish directory: `client/build`
6. Add environment variable: `REACT_APP_API_URL=https://your-render-api.onrender.com`
7. Update `netlify.toml` with your Render API URL
8. Deploy!

Your app will be available at: `https://your-app-name.netlify.app`

### One-Click Deploy Options

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

##  Assumptions

1. **Single User Focus** - While authentication is implemented, the app is designed for single-organization use
2. **SQLite Database** - Chosen for simplicity and zero-configuration setup; can be easily swapped for PostgreSQL/MySQL in production
3. **No File Upload** - Avatar images use initials instead of uploaded images
4. **Browser Support** - Modern browsers (Chrome, Firefox, Safari, Edge)
5. **Local Development** - Designed to run locally; deployment instructions would need adjustments for cloud hosting

## 🔧 Development Notes

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME,
  updated_at DATETIME
);

-- Employees table
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  salary REAL,
  hire_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME,
  updated_at DATETIME
);

-- Tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  employee_id INTEGER REFERENCES employees(id),
  created_by INTEGER REFERENCES users(id),
  created_at DATETIME,
  updated_at DATETIME
);
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| JWT_SECRET | Secret for JWT signing | - |
| NODE_ENV | Environment mode | development |
| REACT_APP_API_URL | Backend API URL (frontend) | http://localhost:5000 |

##  Testing the API

You can test the API using curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Get employees
curl http://localhost:5000/api/employees

# Get tasks
curl http://localhost:5000/api/tasks

# Get dashboard stats
curl http://localhost:5000/api/dashboard/stats
```

##  License

MIT License - feel free to use this project for learning or commercial purposes.

##  Author

Created as part of a Full-stack Development Assignment demonstrating proficiency in:
- **Frontend Development** (React, CSS, Responsive Design)
- **Backend Development** (Node.js, Express, REST APIs)
- **Database Design** (SQLite, SQL)
- **Authentication** (JWT)
- **DevOps** (Deployment Configuration)

---
