import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, CheckCircle, Clock, Folder, Pencil, Trash2, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProjectListSkeleton } from '../Skeleton';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });

  // Edit Modal
  const [editingProject, setEditingProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectData.name.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    setIsCreating(true);
    try {
      await api.post('/projects', { ...newProjectData, name: newProjectData.name.trim() });
      setIsModalOpen(false);
      setNewProjectData({ name: '', description: '' });
      toast.success('Project created successfully!');
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/projects/${editingProject.id}`, {
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
      });
      setEditingProject(null);
      toast.success('Project updated successfully!');
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Prevent card click navigating away
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="content-header">
        <h4>Active Projects</h4>
        <button className="primary-btn new-project-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      <div className="projects-grid">
        {isLoading ? (
          <ProjectListSkeleton />
        ) : error ? (
          <p style={{ color: 'var(--danger-text)' }}>{error}</p>
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
            <Folder size={48} style={{ color: 'var(--border-color)', margin: '0 auto 16px auto', display: 'block' }} />
            <h5 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>No projects yet</h5>
            <p style={{ color: 'var(--text-secondary)' }}>Click "New Project" to create your first project.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id} 
              className="project-card glass-panel"
              onClick={() => navigate(`/dashboard/project/${project.id}`)}
            >
              <div className="project-header">
                <h5>{project.name}</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`status-badge ${project.status.toLowerCase()}`}>
                    {project.status === 'ACTIVE' ? 'Active' : project.status === 'COMPLETED' ? 'Completed' : 'Planned'}
                  </span>
                  {/* Edit / Delete Actions */}
                  <button
                    className="card-action-btn edit"
                    onClick={(e) => { e.stopPropagation(); setEditingProject({...project}); }}
                    title="Edit Project"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="card-action-btn delete"
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    title="Delete Project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {project.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
              )}
              
              <div className="project-stats">
                <div className="stat"><CheckCircle size={16} /><span>{project._count?.tasks || 0} Tasks</span></div>
                <div className="stat"><Clock size={16} /><span>Updated {formatDate(project.updatedAt)}</span></div>
              </div>
              
              <div className="project-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: project.status === 'COMPLETED' ? '100%' : project.status === 'ACTIVE' ? '50%' : '0%' }}></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Start a new workflow and organize your tasks.</p>
            
            <form onSubmit={handleCreateProject} className="modal-form">
              <input type="text" placeholder="Project Name" value={newProjectData.name} onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})} required className="modal-input" />
              <textarea placeholder="Project Description (Optional)" value={newProjectData.description} onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})} className="modal-textarea" />
              
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">Cancel</button>
                <button type="submit" className="primary-btn" disabled={isCreating} style={{ marginTop: 0, padding: '10px 24px' }}>
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button className="modal-close-btn" onClick={() => setEditingProject(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEditProject} className="modal-form">
              <input type="text" placeholder="Project Name" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} required className="modal-input" />
              <textarea placeholder="Project Description (Optional)" value={editingProject.description || ''} onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} className="modal-textarea" />
              
              <select value={editingProject.status} onChange={(e) => setEditingProject({...editingProject, status: e.target.value})} className="modal-select" style={{ width: '100%' }}>
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingProject(null)} className="modal-cancel-btn">Cancel</button>
                <button type="submit" className="primary-btn" disabled={isSaving} style={{ marginTop: 0, padding: '10px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectList;
