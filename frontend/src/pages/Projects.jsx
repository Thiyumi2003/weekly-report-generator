import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiAlertTriangle } from 'react-icons/fi';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingProjectId, setEditingProjectId] = useState(null);

  const isManager = user?.role === 'Manager';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'Active'
    }
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch the list of projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    reset({ name: '', description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setModalMode('edit');
    setEditingProjectId(proj._id);
    setValue('name', proj.name);
    setValue('description', proj.description);
    setValue('status', proj.status);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        const res = await api.post('/projects', data);
        setProjects([...projects, res.data.project]);
      } else {
        const res = await api.put(`/projects/${editingProjectId}`, data);
        setProjects(projects.map(p => p._id === editingProjectId ? res.data.project : p));
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving project.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? Report logs bound to this project might fail.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting project.');
    }
  };

  const getStatusColor = (status) => {
    const classes = {
      Active: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/30',
      Completed: 'bg-indigo-950/60 text-indigo-400 border-indigo-900/30',
      'On Hold': 'bg-amber-950/60 text-amber-400 border-amber-900/30'
    };
    return classes[status] || 'bg-slate-850 text-slate-400 border-slate-700/30';
  };

  return (
    <div className="space-y-6">
      {/* Header section with Create Project CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Project Workspaces</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isManager 
              ? 'Create, edit, and archive projects tracked across weekly logs' 
              : 'Browse active workspaces and projects currently tracked'}
          </p>
        </div>
        
        {isManager && (
          <Button variant="primary" onClick={openCreateModal} className="gap-2 cursor-pointer">
            <FiPlus className="h-4.5 w-4.5" />
            <span>Create Project</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center">
          <Loader size="md" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="py-16 text-center text-slate-500">
          <FiLayers className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <p className="font-semibold text-slate-400">No projects recorded</p>
          <p className="text-xs text-slate-500 mt-1">
            {isManager ? 'Get started by creating your first project milestone!' : 'No projects have been configured yet by your managers.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card 
              key={proj._id} 
              title={proj.name}
              extra={
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(proj.status)}`}>
                  {proj.status}
                </span>
              }
              footer={
                isManager && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-1 px-2 hover:bg-indigo-950/40 rounded transition-all cursor-pointer"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(proj._id)}
                      className="inline-flex items-center gap-1 text-xs text-rose-455 hover:text-rose-350 font-semibold py-1 px-2 hover:bg-rose-950/40 rounded transition-all cursor-pointer"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )
              }
            >
              <p className="text-slate-400 text-sm leading-relaxed min-h-[60px] line-clamp-3">
                {proj.description}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                <span>Created by: {proj.createdBy?.name || 'Manager'}</span>
                <span>{new Date(proj.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Creation/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Project Workspace' : 'Edit Project Settings'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Project Epsilon"
            error={errors.name?.message}
            {...register('name', {
              required: 'Project name is required',
              maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
            })}
          />

          <Textarea
            label="Project Description"
            placeholder="Detail the scope and goals of this project workspace..."
            error={errors.description?.message}
            {...register('description', {
              required: 'Description is required',
              maxLength: { value: 500, message: 'Description cannot exceed 500 characters' }
            })}
          />

          {/* Status selector */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-350">Project Status</label>
            <select
              {...register('status', { required: 'Please specify status' })}
              className="px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 text-sm outline-none transition-all cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="cursor-pointer">
              {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
