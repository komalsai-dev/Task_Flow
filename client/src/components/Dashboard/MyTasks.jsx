import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, Folder, X, Calendar, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { MyTasksSkeleton } from '../Skeleton';
import './MyTasks.css';

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await api.get('/users/my-tasks');
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const filteredTasks = tasks
    .filter(t => filter === 'ALL' || t.status === filter)
    .filter(t => priorityFilter === 'ALL' || t.priority === priorityFilter);

  const counts = {
    ALL: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
  };

  const priorityIcon = (p) => p === 'HIGH' ? <AlertCircle size={14} /> : p === 'MEDIUM' ? <Clock size={14} /> : <CheckCircle size={14} />;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';

  return (
    <div className="my-tasks-page">
      <div className="content-header">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>My Tasks</h2>
          <p style={{ color: 'var(--text-secondary)' }}>All tasks across all your projects — filter, track, and update statuses in one place</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs">
        {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(s => (
          <button
            key={s}
            className={`filter-tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
            <span className="filter-count">{counts[s]}</span>
          </button>
        ))}

        <select className="priority-filter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Task Table */}
      {isLoading ? (
        <MyTasksSkeleton />
      ) : filteredTasks.length === 0 ? (
        <div className="empty-tasks glass-panel">
          <CheckCircle size={48} style={{ color: 'var(--border-color)', marginBottom: '16px' }} />
          <h3>No tasks found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="tasks-table glass-panel">
          <div className="tasks-table-header">
            <span>Task</span>
            <span>Project</span>
            <span>Priority</span>
            <span>Due Date</span>
            <span>Status</span>
          </div>
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`tasks-table-row clickable ${isOverdue(task) ? 'overdue' : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              <div className="task-name-cell">
                <span className={task.status === 'DONE' ? 'done-task' : ''}>{task.title}</span>
                {isOverdue(task) && <span className="overdue-badge">Overdue</span>}
                {task.description && <p className="task-row-desc">{task.description}</p>}
              </div>
              <div className="task-project-cell">
                <Folder size={14} style={{ color: 'var(--accent-color)' }} />
                <span>{task.project?.name || '—'}</span>
              </div>
              <div>
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                  {priorityIcon(task.priority)} {task.priority}
                </span>
              </div>
              <div className="task-due-cell" style={{ color: isOverdue(task) ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
                {formatDate(task.dueDate)}
              </div>
              <div onClick={e => e.stopPropagation()}>
                <select
                  className="status-dropdown"
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content glass-panel animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className={`priority-badge ${selectedTask.priority.toLowerCase()}`}>
                {priorityIcon(selectedTask.priority)} {selectedTask.priority} Priority
              </span>
              <button className="modal-close-btn" onClick={() => setSelectedTask(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>{selectedTask.title}</h2>
              <div className="task-meta-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div className="task-meta-item">
                  <Folder size={16} />
                  <span>{selectedTask.project?.name || 'No Project'}</span>
                </div>
                <div className="task-meta-item">
                  <Calendar size={16} />
                  <span>Due: {formatDate(selectedTask.dueDate)}</span>
                </div>
                <div className="task-meta-item">
                  <Clock size={16} />
                  <span>Status: {selectedTask.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</h4>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '1.05rem', backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              <div className="modal-actions" style={{ marginTop: '32px' }}>
                <button 
                  className="primary-btn" 
                  style={{ width: '100%' }} 
                  onClick={() => {
                    const pid = selectedTask.projectId;
                    const tid = selectedTask.id;
                    setSelectedTask(null);
                    navigate(`/dashboard/project/${pid}?editTask=${tid}`);
                  }}
                >
                  <Pencil size={18} />
                  Edit Task
                </button>
                <button className="modal-cancel-btn" style={{ width: '100%', marginTop: '12px' }} onClick={() => setSelectedTask(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
