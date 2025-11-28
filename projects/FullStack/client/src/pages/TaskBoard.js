import React, { useState, useEffect } from 'react';
import { 
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiFlag,
  FiUser,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    employee_id: ''
  });

  const columns = [
    { id: 'pending', title: 'To Do', color: '#ed8936' },
    { id: 'in_progress', title: 'In Progress', color: '#4299e1' },
    { id: 'completed', title: 'Completed', color: '#48bb78' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks?limit=100');
      setTasks(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) return;

    try {
      await api.put(`/tasks/${draggedTask.id}`, { status: newStatus });
      setTasks(tasks.map(t => 
        t.id === draggedTask.id ? { ...t, status: newStatus } : t
      ));
      toast.success('Task moved successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
    setDraggedTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employee_id: formData.employee_id || null
      };
      
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      employee_id: task.employee_id || ''
    });
    setShowModal(true);
  };

  const openAddModal = (status = 'pending') => {
    resetForm();
    setFormData(prev => ({ ...prev, status }));
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: '',
      employee_id: ''
    });
    setEditingTask(null);
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f56565';
      case 'medium': return '#ed8936';
      default: return '#48bb78';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--gray-800)' }}>Task Board</h1>
          <p style={{ color: 'var(--gray-600)' }}>Drag and drop tasks to update status</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAddModal()}>
          <FiPlus /> Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
              <h3>
                <span className="status-dot" style={{ backgroundColor: column.color }}></span>
                {column.title}
              </h3>
              <span className="task-count">{getTasksByStatus(column.id).length}</span>
            </div>
            
            <div className="kanban-column-body">
              {getTasksByStatus(column.id).map(task => (
                <div
                  key={task.id}
                  className={`kanban-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                >
                  <div className="kanban-card-header">
                    <span 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                      title={`${task.priority} priority`}
                    >
                      <FiFlag size={10} />
                    </span>
                    <div className="kanban-card-actions">
                      <button onClick={() => openEditModal(task)} title="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(task.id)} title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="kanban-card-title">{task.title}</h4>
                  
                  {task.description && (
                    <p className="kanban-card-description">{task.description}</p>
                  )}
                  
                  <div className="kanban-card-footer">
                    {task.due_date && (
                      <span className={`due-date ${isOverdue(task.due_date, task.status) ? 'overdue' : ''}`}>
                        <FiCalendar size={12} />
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    
                    {task.employee_first_name ? (
                      <div className="assignee" title={`${task.employee_first_name} ${task.employee_last_name}`}>
                        <span className="assignee-avatar">
                          {task.employee_first_name[0]}{task.employee_last_name[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="unassigned">
                        <FiUser size={12} /> Unassigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              <button className="add-task-btn" onClick={() => openAddModal(column.id)}>
                <FiPlus size={16} /> Add task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter task title"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-control"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
