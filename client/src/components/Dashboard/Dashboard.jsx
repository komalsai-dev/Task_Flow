import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Folder, Calendar, PanelLeftClose, PanelLeftOpen, CheckSquare, BarChart2, Settings } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Projects', icon: <Folder size={20} />, exact: true },
    { path: '/dashboard/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { path: '/dashboard/my-tasks', label: 'My Tasks', icon: <CheckSquare size={20} /> },
    { path: '/dashboard/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path || location.pathname.startsWith('/dashboard/project/');
    return location.pathname === item.path;
  };

  return (
    <div className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div className="sidebar-brand">
            <div className="brand-dot"></div>
            {!isSidebarCollapsed && <h2>TaskFlow</h2>}
          </div>
          <button 
            className="collapse-toggle-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <a
              key={item.path}
              href="#"
              className={`nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate(item.path); }}
              title={isSidebarCollapsed ? item.label : ''}
            >
              {item.icon}
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn sidebar-logout" onClick={logout}>
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header glass-panel">
          <div className="header-greeting">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3>Welcome back, <span>{user?.name?.split(' ')[0] || 'User'}</span></h3>
              {user?.role === 'ADMIN' && (
                <span className="role-badge admin-badge" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  ADMINISTRATOR
                </span>
              )}
            </div>
            <p>{user?.role === 'ADMIN' ? "Here's a system-wide overview of all projects today." : "Here's what's happening with your projects today."}</p>
          </div>
          
          <div className="header-actions">
            <ThemeToggle />
            <button className="logout-btn header-logout" onClick={logout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
