import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiDollarSign,
  FiBriefcase,
  FiArrowLeft,
  FiEdit2,
  FiCheckSquare,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data);
    } catch (error) {
      toast.error('Failed to fetch employee');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="empty-state">
        <h3>Employee not found</h3>
        <Link to="/employees" className="btn btn-primary">Back to Employees</Link>
      </div>
    );
  }

  const tasks = employee.tasks || [];
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length;

  const taskChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [completedTasks, inProgressTasks, pendingTasks],
      backgroundColor: ['#48bb78', '#4299e1', '#ed8936'],
      borderWidth: 0
    }]
  };

  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  return (
    <div className="profile-page">
      {/* Back Button */}
      <button 
        className="btn btn-outline" 
        onClick={() => navigate('/employees')}
        style={{ marginBottom: '1.5rem' }}
      >
        <FiArrowLeft /> Back to Employees
      </button>

      {/* Profile Header */}
      <div className="profile-header card">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar-large">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div className="profile-details">
            <h1>{employee.first_name} {employee.last_name}</h1>
            <p className="profile-position">{employee.position}</p>
            <span className={`badge ${employee.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
              {employee.status}
            </span>
          </div>
          <Link to="/employees" className="btn btn-primary profile-edit-btn">
            <FiEdit2 /> Edit Profile
          </Link>
        </div>
      </div>

      <div className="profile-content">
        {/* Contact & Info */}
        <div className="profile-sidebar">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Contact Information</h3>
            </div>
            <div className="card-body">
              <div className="info-item">
                <FiMail className="info-icon" />
                <div>
                  <span className="info-label">Email</span>
                  <a href={`mailto:${employee.email}`}>{employee.email}</a>
                </div>
              </div>
              {employee.phone && (
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <div>
                    <span className="info-label">Phone</span>
                    <span>{employee.phone}</span>
                  </div>
                </div>
              )}
              <div className="info-item">
                <FiBriefcase className="info-icon" />
                <div>
                  <span className="info-label">Department</span>
                  <span>{employee.department}</span>
                </div>
              </div>
              <div className="info-item">
                <FiCalendar className="info-icon" />
                <div>
                  <span className="info-label">Hire Date</span>
                  <span>{new Date(employee.hire_date).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}</span>
                </div>
              </div>
              {employee.salary && (
                <div className="info-item">
                  <FiDollarSign className="info-icon" />
                  <div>
                    <span className="info-label">Salary</span>
                    <span>${employee.salary.toLocaleString()}/year</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Distribution Chart */}
          {tasks.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title">Task Distribution</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '200px' }}>
                  <Doughnut 
                    data={taskChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } }
                    }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats & Tasks */}
        <div className="profile-main">
          {/* Stats Cards */}
          <div className="profile-stats">
            <div className="stat-card-mini">
              <FiCheckSquare className="stat-icon-mini green" />
              <div>
                <h4>{completedTasks}</h4>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <FiClock className="stat-icon-mini blue" />
              <div>
                <h4>{inProgressTasks}</h4>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <FiAlertCircle className="stat-icon-mini orange" />
              <div>
                <h4>{pendingTasks}</h4>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <FiAlertCircle className="stat-icon-mini red" />
              <div>
                <h4>{overdueTasks}</h4>
                <p>Overdue</p>
              </div>
            </div>
            <div className="stat-card-mini">
              <div className="completion-ring">
                <svg viewBox="0 0 36 36">
                  <path
                    className="ring-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="ring-progress"
                    strokeDasharray={`${completionRate}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="ring-text">{completionRate}%</span>
              </div>
              <div>
                <h4>Rate</h4>
                <p>Completion</p>
              </div>
            </div>
          </div>

          {/* Assigned Tasks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Assigned Tasks ({tasks.length})</h3>
              <Link to="/tasks" className="btn btn-sm btn-outline">View All</Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {tasks.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <FiCheckSquare style={{ fontSize: '2.5rem', color: 'var(--gray-300)' }} />
                  <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>No tasks assigned</p>
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map(task => (
                    <div key={task.id} className="task-list-item">
                      <div className="task-list-content">
                        <span className={`priority-dot ${task.priority}`}></span>
                        <div>
                          <h4>{task.title}</h4>
                          {task.due_date && (
                            <span className={`task-due ${
                              new Date(task.due_date) < new Date() && task.status !== 'completed' 
                                ? 'overdue' : ''
                            }`}>
                              <FiCalendar size={12} />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`badge badge-${
                        task.status === 'completed' ? 'success' : 
                        task.status === 'in_progress' ? 'info' : 'warning'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
