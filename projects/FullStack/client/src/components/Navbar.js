import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiCheckSquare, 
  FiLogOut,
  FiBriefcase,
  FiUser,
  FiLayout,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <FiBriefcase />
          <span>TaskFlow</span>
        </NavLink>

        <ul className="navbar-nav">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              <FiHome />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/employees" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FiUsers />
              <span>Employees</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/tasks" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FiCheckSquare />
              <span>Tasks</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/board" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FiLayout />
              <span>Board</span>
            </NavLink>
          </li>
        </ul>

        <div className="navbar-user">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
          <div className="user-info">
            <div className="user-avatar">
              <FiUser />
            </div>
            <span>{user?.username || 'User'}</span>
          </div>
          <button className="btn btn-sm" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
