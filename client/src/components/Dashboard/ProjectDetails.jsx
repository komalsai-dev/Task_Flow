import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, useAuth } from '../../context/AuthContext';
import { ArrowLeft, Plus, Clock, AlertCircle, CheckCircle2, Pencil, Trash2, X, Save, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { KanbanSkeleton } from '../Skeleton';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Create Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });

  // Edit Task Modal
  const [editingTask, setEditingTask] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  // View Task Modal
  const [viewingTask, setViewingTask] = useState(null);

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      const currentProject = projRes.data.find(p => p.id === id);
      setProject(currentProject);

      // Fixed route: /tasks/project/:projectId
      const taskRes = await api.get(`/tasks/project/${id}`);
      
      const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
      taskRes.data.forEach(task => {
        if (grouped[task.status]) grouped[task.status].push(task);
        else grouped.TODO.push(task);
      });
      setTasks(grouped);

      // Fetch team members for assignment
      const usersRes = await api.get('/users');
      setTeamMembers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
};

  useEffect(() => { fetchData(); }, [id]);

  // Handle auto-edit from query param
  useEffect(() => {
    if (!isLoading && tasks && tasks.TODO && tasks.IN_PROGRESS && tasks.DONE) {
      const searchParams = new URLSearchParams(location.search);
      const taskIdToEdit = searchParams.get('editTask');
      if (taskIdToEdit) {
        const allTasks = [...tasks.TODO, ...tasks.IN_PROGRESS, ...tasks.DONE];
        const task = allTasks.find(t => t.id === taskIdToEdit);
        if (task) {
          setEditingTask({ ...task });
          navigate(location.pathname, { replace: true });
        }
      }
    }
  }, [isLoading, tasks, location.search, navigate, location.pathname]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    setIsCreatingTask(true);
    try {
      await api.post('/tasks', { ...newTask, title: newTask.title.trim(), projectId: id });
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
      toast.success('Task created successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!editingTask.title.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    setIsSavingTask(true);
    try {
      await api.put(`/tasks/${editingTask.id}`, {
        title: editingTask.title.trim(),
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
        assigneeId: editingTask.assigneeId
      });
      setEditingTask(null);
      toast.success('Task updated!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) return <div className="project-details"><KanbanSkeleton /></div>;
  if (!project) return <div style={{ padding: '40px', color: 'var(--danger-text)' }}>Project not found.</div>;

  return (
    <div className="project-details">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
        
        <div className="details-title">
          <div>
            <h2>{project.name}</h2>
            {project.description && <p>{project.description}</p>}
          </div>
          <button className="primary-btn add-task-btn" onClick={() => setIsTaskModalOpen(true)}>
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {/* TODO Column */}
        <div className="kanban-column">
          <div className="column-header">
            <h3>To Do</h3>
            <span className="task-count">{tasks.TODO.length}</span>
          </div>
          <div className="column-tasks">
            {tasks.TODO.length === 0 ? (
              <div className="empty-column">No To-Do tasks</div>
            ) : (
              tasks.TODO.map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onEdit={setEditingTask} onDelete={handleDeleteTask} onClick={() => setViewingTask(task)} />
              ))
            )}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="kanban-column">
          <div className="column-header">
            <h3>In Progress</h3>
            <span className="task-count">{tasks.IN_PROGRESS.length}</span>
          </div>
          <div className="column-tasks">
            {tasks.IN_PROGRESS.length === 0 ? (
              <div className="empty-column">No In Progress tasks</div>
            ) : (
              tasks.IN_PROGRESS.map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onEdit={setEditingTask} onDelete={handleDeleteTask} onClick={() => setViewingTask(task)} />
              ))
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="kanban-column">
          <div className="column-header">
            <h3>Done</h3>
            <span className="task-count">{tasks.DONE.length}</span>
          </div>
          <div className="column-tasks">
            {tasks.DONE.length === 0 ? (
              <div className="empty-column">No Completed tasks</div>
            ) : (
              tasks.DONE.map(task => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onEdit={setEditingTask} onDelete={handleDeleteTask} onClick={() => setViewingTask(task)} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isTaskModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="modal-close-btn" onClick={() => setIsTaskModalOpen(false)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add a new task to <strong>{project.name}</strong></p>
            
            <form onSubmit={handleCreateTask} className="modal-form">
              <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required className="modal-input" />
              <textarea placeholder="Task Description (Optional)" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="modal-textarea" />
              
              <div className="modal-row">
                <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="modal-select">
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <select value={newTask.status} onChange={(e) => setNewTask({...newTask, status: e.target.value})} className="modal-select">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="modal-row">
                <input 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} 
                  className="modal-input date-input" 
                  title="Due Date"
                />
                <select 
                  value={newTask.assigneeId || ''} 
                  onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})} 
                  className="modal-select"
                >
                  <option value="">No Assignee</option>
                  {teamMembers
                    .filter(member => currentUser?.role === 'ADMIN' || member.role === 'MEMBER')
                    .map(member => (
                      <option key={member.id} value={member.id}>{member.name} {member.role === 'ADMIN' ? '(Admin)' : ''}</option>
                    ))
                  }
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="modal-cancel-btn">Cancel</button>
                <button type="submit" className="primary-btn" disabled={isCreatingTask} style={{ marginTop: 0, padding: '10px 24px' }}>
                  {isCreatingTask ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="modal-close-btn" onClick={() => setEditingTask(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEditTask} className="modal-form">
              <input type="text" placeholder="Task Title" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} required className="modal-input" />
              <textarea placeholder="Task Description (Optional)" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} className="modal-textarea" />
              
              <div className="modal-row">
                <select value={editingTask.priority} onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})} className="modal-select">
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <select value={editingTask.status} onChange={(e) => setEditingTask({...editingTask, status: e.target.value})} className="modal-select">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="modal-row">
                <input 
                  type="date" 
                  value={editingTask.dueDate ? (editingTask.dueDate.includes('T') ? editingTask.dueDate.split('T')[0] : editingTask.dueDate) : ''} 
                  onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})} 
                  className="modal-input date-input" 
                  title="Due Date"
                />
                <select 
                  value={editingTask.assigneeId || ''} 
                  onChange={(e) => setEditingTask({...editingTask, assigneeId: e.target.value})} 
                  className="modal-select"
                >
                  <option value="">No Assignee</option>
                  {teamMembers
                    .filter(member => currentUser?.role === 'ADMIN' || member.role === 'MEMBER')
                    .map(member => (
                      <option key={member.id} value={member.id}>{member.name} {member.role === 'ADMIN' ? '(Admin)' : ''}</option>
                    ))
                  }
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingTask(null)} className="modal-cancel-btn">Cancel</button>
                <button type="submit" className="primary-btn" disabled={isSavingTask} style={{ marginTop: 0, padding: '10px 24px' }}>
                  <Save size={16} />
                  {isSavingTask ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {viewingTask && (
        <div className="modal-overlay animate-fade-in" onClick={() => setViewingTask(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <span className={`priority-badge ${viewingTask.priority.toLowerCase()}`} style={{ margin: 0 }}>
                {viewingTask.priority}
              </span>
              <button className="modal-close-btn" onClick={() => setViewingTask(null)}><X size={20} /></button>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>{viewingTask.title}</h2>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '0.9rem' }}>
                <span className={`status-chip ${viewingTask.status.toLowerCase()}`}>
                   {viewingTask.status.replace('_', ' ')}
                </span>
                {viewingTask.dueDate && (
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Due: {new Date(viewingTask.dueDate).toLocaleDateString()}
                  </span>
                )}
                {viewingTask.assignee && (
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    Assigned: {viewingTask.assignee.name}
                  </span>
                )}
              </div>

              <div className="view-modal-section">
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Description</h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {viewingTask.description || 'No description provided.'}
                </p>
              </div>

              <div className="modal-actions" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button 
                  className="modal-cancel-btn" 
                  onClick={() => {
                    const taskToEdit = {...viewingTask};
                    setViewingTask(null);
                    setEditingTask(taskToEdit);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 24px' }}
                >
                  <Pencil size={16} />
                  Edit Task
                </button>
                <button className="primary-btn" onClick={() => setViewingTask(null)} style={{ marginTop: 0, padding: '10px 24px' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, onClick }) => {
  return (
    <div className="task-card glass-panel" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions">
          <button className="task-action-btn edit" onClick={(e) => { e.stopPropagation(); onEdit(task); }} title="Edit Task">
            <Pencil size={14} />
          </button>
          <button className="task-action-btn delete" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} title="Delete Task">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}
      
      <div className="task-footer" onClick={e => e.stopPropagation()}>
        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
          {task.priority === 'HIGH' ? <AlertCircle size={14} /> : task.priority === 'MEDIUM' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
          {task.priority}
        </span>
        
        {task.assignee && (
          <div className="task-assignee-tiny" title={`Assigned to ${task.assignee.name}`}>
            <User size={12} />
            <span>{task.assignee.name.split(' ')[0]}</span>
          </div>
        )}
        
        <select 
          className="status-dropdown"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
    </div>
  );
};

export default ProjectDetails;
