import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiCheckSquare, 
  FiClock, 
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>;
  }

  // Chart data for task status
  const taskStatusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      data: [stats.tasks.pending, stats.tasks.inProgress, stats.tasks.completed],
      backgroundColor: ['#ed8936', '#4299e1', '#48bb78'],
      borderWidth: 0
    }]
  };

  // Chart data for employees by department
  const departmentData = {
    labels: stats.employees.byDepartment.map(d => d.department),
    datasets: [{
      label: 'Employees',
      data: stats.employees.byDepartment.map(d => d.count),
      backgroundColor: '#667eea',
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2d3748' }}>Dashboard</h1>
        <p style={{ color: '#718096' }}>Welcome to your Employee & Task Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.employees.total}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiCheckSquare />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks.overdue}</h3>
            <p>Overdue Tasks</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Task Status Overview</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '280px' }}>
              <Doughnut data={taskStatusData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Employees by Department</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ height: '280px' }}>
              <Bar data={departmentData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-2">
        {/* Recent Employees */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FiUsers style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Recent Employees
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.recentEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="employee-card">
                          <div className="employee-avatar">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div className="employee-info">
                            <h4>{emp.first_name} {emp.last_name}</h4>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FiCalendar style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Upcoming Deadlines
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.upcomingDeadlines.length > 0 ? (
                    stats.recentActivity.upcomingDeadlines.map(task => (
                      <tr key={task.id}>
                        <td style={{ fontWeight: '500' }}>{task.title}</td>
                        <td>
                          {task.employee_first_name 
                            ? `${task.employee_first_name} ${task.employee_last_name}`
                            : <span style={{ color: '#a0aec0' }}>Unassigned</span>
                          }
                        </td>
                        <td>{new Date(task.due_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                            {task.priority}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#a0aec0' }}>
                        No upcoming deadlines
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <FiTrendingUp style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Quick Summary
          </h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#48bb78' }}>{stats.tasks.completed}</p>
              <p style={{ color: '#718096', fontSize: '0.875rem' }}>Completed Tasks</p>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#4299e1' }}>{stats.tasks.inProgress}</p>
              <p style={{ color: '#718096', fontSize: '0.875rem' }}>In Progress</p>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ed8936' }}>{stats.tasks.pending}</p>
              <p style={{ color: '#718096', fontSize: '0.875rem' }}>Pending Tasks</p>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{stats.employees.active}</p>
              <p style={{ color: '#718096', fontSize: '0.875rem' }}>Active Employees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
