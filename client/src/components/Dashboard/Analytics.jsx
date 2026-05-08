import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { Folder, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { AnalyticsSkeleton } from '../Skeleton';
import './Analytics.css';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/users/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) return <div className="analytics-page"><div style={{ marginBottom: '8px' }}><h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>Analytics</h2><p style={{ color: 'var(--text-secondary)' }}>Overview of your project and task performance</p></div><AnalyticsSkeleton /></div>;
  if (!data) return <p style={{ color: 'var(--danger-text)' }}>Failed to load analytics.</p>;

  const completionRate = data.totalTasks > 0
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0;

  const stats = [
    { label: 'Total Projects', value: data.totalProjects, icon: <Folder size={24} />, color: 'var(--accent-color)', bg: 'rgba(37,99,235,0.1)' },
    { label: 'Total Tasks', value: data.totalTasks, icon: <Clock size={24} />, color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
    { label: 'Completed Tasks', value: data.completedTasks, icon: <CheckCircle size={24} />, color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { label: 'Due This Week', value: data.upcomingTasksCount, icon: <AlertCircle size={24} />, color: 'var(--danger-text)', bg: 'var(--danger-bg)' },
  ];

  return (
    <div className="analytics-page">
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>{data.isAdmin ? 'System Analytics' : 'Analytics'}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{data.isAdmin ? 'Global overview of system-wide performance' : 'Overview of your project and task performance'}</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card glass-panel">
            <div className="stat-icon" style={{ backgroundColor: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <p className="stat-label">{s.label}</p>
              <h3 className="stat-value">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate + Charts */}
      <div className="analytics-grid">
        {/* Completion Rate */}
        <div className="chart-card glass-panel">
          <h4>Overall Task Completion</h4>
          <div className="completion-ring-wrapper">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="64" fill="none" stroke="var(--border-color)" strokeWidth="14" />
              <circle
                cx="80" cy="80" r="64" fill="none"
                stroke="var(--accent-color)" strokeWidth="14"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="ring-center">
              <span className="ring-percent">{completionRate}%</span>
              <span className="ring-label">Done</span>
            </div>
          </div>
          <div className="completion-legend">
            <div className="legend-row"><span style={{ backgroundColor: 'var(--accent-color)' }}></span> Completed ({data.completedTasks})</div>
            <div className="legend-row"><span style={{ backgroundColor: 'var(--border-color)' }}></span> Remaining ({data.totalTasks - data.completedTasks})</div>
          </div>
        </div>

        {/* Task Status Bar Chart */}
        <div className="chart-card glass-panel">
          <h4>Tasks by Status</h4>
          <div className="bar-chart">
            {Object.entries(data.taskStatusCounts).map(([key, count]) => {
              const max = Math.max(...Object.values(data.taskStatusCounts), 1);
              const label = key === 'TODO' ? 'To Do' : key === 'IN_PROGRESS' ? 'In Progress' : 'Done';
              const color = key === 'DONE' ? 'var(--success-text)' : key === 'IN_PROGRESS' ? 'var(--warning-text)' : 'var(--accent-color)';
              return (
                <div key={key} className="bar-row">
                  <span className="bar-label">{label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}></div>
                  </div>
                  <span className="bar-value">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="chart-card glass-panel">
          <h4>Tasks by Priority</h4>
          <div className="priority-dist">
            {Object.entries(data.taskPriorityCounts).map(([key, count]) => {
              const total = data.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              const color = key === 'HIGH' ? 'var(--danger-text)' : key === 'MEDIUM' ? 'var(--warning-text)' : 'var(--success-text)';
              const bg = key === 'HIGH' ? 'var(--danger-bg)' : key === 'MEDIUM' ? 'var(--warning-bg)' : 'var(--success-bg)';
              return (
                <div key={key} className="priority-row">
                  <div className="priority-info">
                    <span className="priority-dot" style={{ backgroundColor: color }}></span>
                    <span className="priority-name">{key}</span>
                    <span className="priority-pct" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                  </div>
                  <span className="bar-value">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="chart-card glass-panel">
          <h4>Projects by Status</h4>
          <div className="project-status-dist">
            {Object.entries(data.projectStatusCounts).map(([key, count]) => {
              const color = key === 'COMPLETED' ? 'var(--success-text)' : key === 'ACTIVE' ? 'var(--accent-color)' : 'var(--text-secondary)';
              const bg = key === 'COMPLETED' ? 'var(--success-bg)' : key === 'ACTIVE' ? 'rgba(37,99,235,0.1)' : 'var(--border-color)';
              return (
                <div key={key} className="project-status-card" style={{ borderLeft: `3px solid ${color}` }}>
                  <h3 style={{ color }}>{count}</h3>
                  <p>{key === 'PLANNED' ? 'Planned' : key === 'ACTIVE' ? 'Active' : 'Completed'}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
