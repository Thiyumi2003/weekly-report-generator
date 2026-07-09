import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Loader from '../components/Loader';
import { FiPlus, FiTrash2, FiSave, FiSend, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const CreateReport = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: Get YYYY-WXX identifier for current week
  const getWeekIdentifier = (d = new Date()) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-W${pad(weekNum)}`;
  };

  // Helper: Get Mon-Sun date ranges for current week
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0]
    };
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      week: getWeekIdentifier(),
      startDate: getWeekRange().startDate,
      endDate: getWeekRange().endDate,
      project: '',
      hoursWorked: 40,
      notes: '',
      tasksCompleted: [{ value: '' }],
      tasksPlanned: [{ value: '' }],
      blockers: []
    }
  });

  // Dynamic Array Fields for tasksCompleted, tasksPlanned, blockers
  const { 
    fields: completedFields, 
    append: appendCompleted, 
    remove: removeCompleted 
  } = useFieldArray({ control, name: 'tasksCompleted' });

  const { 
    fields: plannedFields, 
    append: appendPlanned, 
    remove: removePlanned 
  } = useFieldArray({ control, name: 'tasksPlanned' });

  const { 
    fields: blockerFields, 
    append: appendBlocker, 
    remove: removeBlocker 
  } = useFieldArray({ control, name: 'blockers' });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.projects.filter(p => p.status === 'Active'));
      } catch (err) {
        console.error(err);
        setFormError('Failed to load active projects list.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const onSubmit = async (data, statusType) => {
    setFormError('');
    setIsSubmitting(true);

    // Format fields (convert array of objects {value: ''} to simple array of strings)
    const tasksCompleted = data.tasksCompleted.map(item => item.value.trim()).filter(Boolean);
    const tasksPlanned = data.tasksPlanned.map(item => item.value.trim()).filter(Boolean);
    const blockers = data.blockers.map(item => item.value.trim()).filter(Boolean);

    if (tasksCompleted.length === 0 && statusType === 'Submitted') {
      setFormError('Please add at least one completed task before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      // If statusType is Submitted, check if it is submitted after Sunday (late submission check)
      let finalStatus = statusType;
      if (statusType === 'Submitted') {
        const sunday = new Date(data.endDate);
        sunday.setHours(23, 59, 59, 999);
        if (new Date() > sunday) {
          finalStatus = 'Late';
        }
      }

      await api.post('/reports', {
        ...data,
        tasksCompleted,
        tasksPlanned,
        blockers,
        status: finalStatus
      });

      navigate('/my-reports');
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error occurred while creating the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Back Nav */}
      <div className="flex items-center gap-3">
        <Link to="/my-reports" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
          <FiArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create Weekly Report</h2>
          <p className="text-xs text-slate-400 mt-1">Submit your tasks, planned objectives, and blockers</p>
        </div>
      </div>

      {formError && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300 flex items-start gap-2.5">
          <FiAlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-amber-950/40 border border-amber-900/60 p-5 rounded-xl text-center text-sm text-amber-300">
          No active projects are currently set up. Please contact your manager to create a project before writing reports.
        </div>
      ) : (
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details Input Block */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Task Achievements & Blocks">
              
              {/* Tasks Completed section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">Tasks Completed</h3>
                  <button
                    type="button"
                    onClick={() => appendCompleted({ value: '' })}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add Task
                  </button>
                </div>
                
                {completedFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      placeholder="e.g. Implemented auth login screen validators"
                      {...register(`tasksCompleted.${index}.value`, { required: 'Task text is required' })}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-200 text-sm outline-none transition-all"
                    />
                    {completedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCompleted(index)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tasks Planned next week */}
              <div className="space-y-4 mt-8">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Tasks Planned (Next Week)</h3>
                  <button
                    type="button"
                    onClick={() => appendPlanned({ value: '' })}
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add Task
                  </button>
                </div>
                
                {plannedFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      placeholder="e.g. Integrate Recharts library onto analytics dashboard"
                      {...register(`tasksPlanned.${index}.value`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-200 text-sm outline-none transition-all"
                    />
                    {plannedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlanned(index)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Blockers */}
              <div className="space-y-4 mt-8">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h3 className="text-sm font-bold text-rose-455 uppercase tracking-wide">Impediments & Blockers</h3>
                  <button
                    type="button"
                    onClick={() => appendBlocker({ value: '' })}
                    className="inline-flex items-center gap-1 text-xs text-rose-455 hover:text-rose-350 font-semibold cursor-pointer"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> Add Blocker
                  </button>
                </div>
                
                {blockerFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      placeholder="e.g. Keychain access certificate blocking iOS simulator local testing"
                      {...register(`blockers.${index}.value`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-250 text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeBlocker(index)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                    >
                      <FiTrash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
                {blockerFields.length === 0 && (
                  <p className="text-xs text-slate-500 italic pl-1">No blockers listed. Smooth sailing!</p>
                )}
              </div>
            </Card>

            <Textarea
              label="Additional Notes / Comments"
              name="notes"
              placeholder="Provide any comments or links regarding report work..."
              {...register('notes')}
            />
          </div>

          {/* Right sidebar configuration fields */}
          <div className="space-y-6">
            <Card title="Report Information" subtitle="Work session parameters">
              <div className="space-y-4">
                {/* Project Selector dropdown */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-slate-300">Project Name</label>
                  <select
                    {...register('project', { required: 'Please select a project' })}
                    className="px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 text-sm outline-none transition-all cursor-pointer focus:bg-slate-900"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.project && (
                    <span className="text-xs text-rose-500 mt-0.5">{errors.project.message}</span>
                  )}
                </div>

                <Input
                  label="Report Week Identifier"
                  name="week"
                  placeholder="YYYY-WXX"
                  error={errors.week?.message}
                  {...register('week', {
                    required: 'Week is required',
                    pattern: {
                      value: /^\d{4}-W\d{2}$/,
                      message: 'Must follow format: YYYY-WXX (e.g. 2026-W28)'
                    }
                  })}
                />

                <Input
                  label="Start Date"
                  type="date"
                  name="startDate"
                  error={errors.startDate?.message}
                  {...register('startDate', { required: 'Start date is required' })}
                />

                <Input
                  label="End Date"
                  type="date"
                  name="endDate"
                  error={errors.endDate?.message}
                  {...register('endDate', { required: 'End date is required' })}
                />

                <Input
                  label="Hours Logged"
                  type="number"
                  step="0.5"
                  name="hoursWorked"
                  error={errors.hoursWorked?.message}
                  {...register('hoursWorked', {
                    required: 'Hours worked is required',
                    min: { value: 0, message: 'Hours cannot be negative' }
                  })}
                />
              </div>
            </Card>

            {/* Submission triggers */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl space-y-3">
              <Button
                variant="primary"
                onClick={handleSubmit((data) => onSubmit(data, 'Submitted'))}
                className="w-full justify-center gap-2 py-2.5 cursor-pointer"
                loading={isSubmitting}
              >
                <FiSend className="h-4 w-4" />
                <span>Submit Weekly Report</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleSubmit((data) => onSubmit(data, 'Draft'))}
                className="w-full justify-center gap-2 py-2.5 cursor-pointer"
                loading={isSubmitting}
              >
                <FiSave className="h-4 w-4" />
                <span>Save as Draft</span>
              </Button>
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                Saving as draft allows you to update content later. Submitting locking report details except status review.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateReport;
