import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Loader from '../components/Loader';
import { FiPlus, FiTrash2, FiSave, FiSend, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialReport, setInitialReport] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      week: '',
      startDate: '',
      endDate: '',
      project: '',
      hoursWorked: 40,
      notes: '',
      tasksCompleted: [],
      tasksPlanned: [],
      blockers: []
    }
  });

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
    const loadReportDetails = async () => {
      try {
        setLoading(true);
        setFormError('');

        // Fetch project lists
        const projRes = await api.get('/projects');
        setProjects(projRes.data.projects.filter(p => p.status === 'Active' || p._id === initialReport?.project?._id));

        // Fetch report detail
        const reportRes = await api.get(`/reports/${id}`);
        const r = reportRes.data.report;
        
        if (r.status === 'Approved') {
          setFormError('Approved reports cannot be modified by team members.');
          setInitialReport(r);
          setLoading(false);
          return;
        }

        setInitialReport(r);

        // Pre-fill form fields
        setValue('week', r.week);
        setValue('startDate', r.startDate ? r.startDate.split('T')[0] : '');
        setValue('endDate', r.endDate ? r.endDate.split('T')[0] : '');
        setValue('project', r.project?._id || '');
        setValue('hoursWorked', r.hoursWorked);
        setValue('notes', r.notes || '');

        // Mapping arrays of strings to array of objects
        setValue('tasksCompleted', r.tasksCompleted.map(val => ({ value: val })));
        setValue('tasksPlanned', r.tasksPlanned.map(val => ({ value: val })));
        setValue('blockers', r.blockers.map(val => ({ value: val })));

      } catch (err) {
        console.error(err);
        setFormError('Failed to fetch the requested report details.');
      } finally {
        setLoading(false);
      }
    };

    loadReportDetails();
  }, [id, setValue]);

  const onSubmit = async (data, statusType) => {
    setFormError('');
    setIsSubmitting(true);

    const tasksCompleted = data.tasksCompleted.map(item => item.value.trim()).filter(Boolean);
    const tasksPlanned = data.tasksPlanned.map(item => item.value.trim()).filter(Boolean);
    const blockers = data.blockers.map(item => item.value.trim()).filter(Boolean);

    if (tasksCompleted.length === 0 && statusType === 'Submitted') {
      setFormError('Please add at least one completed task before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      let finalStatus = statusType;
      // If updating status to submitted, check late conditions
      if (statusType === 'Submitted') {
        const sunday = new Date(data.endDate);
        sunday.setHours(23, 59, 59, 999);
        if (new Date() > sunday) {
          finalStatus = 'Late';
        }
      }

      await api.put(`/reports/${id}`, {
        ...data,
        tasksCompleted,
        tasksPlanned,
        blockers,
        status: finalStatus
      });

      navigate('/my-reports');
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error occurred while saving report changes.');
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

  const isApproved = initialReport?.status === 'Approved';

  return (
    <div className="space-y-6">
      {/* Navigation Headers */}
      <div className="flex items-center gap-3">
        <Link to="/my-reports" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
          <FiArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Modify Weekly Report</h2>
          <p className="text-xs text-slate-400 mt-1">Edit draft details or submit pending report reviews</p>
        </div>
      </div>

      {formError && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300 flex items-start gap-2.5">
          <FiAlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {isApproved ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 max-w-lg mx-auto">
          <p className="font-semibold text-slate-200 text-base mb-2">Locked Report</p>
          <p className="text-xs text-slate-500 mb-6">
            This weekly report has already been reviewed and approved by your manager. Approved reports cannot be modified.
          </p>
          <Link to="/my-reports">
            <Button variant="secondary">Back to Reports</Button>
          </Link>
        </div>
      ) : (
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form items */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Task Achievements & Blocks">
              
              {/* Tasks completed */}
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
                      placeholder="e.g. Added form validations"
                      {...register(`tasksCompleted.${index}.value`, { required: 'Task text is required' })}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-205 text-sm outline-none transition-all"
                    />
                    {completedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCompleted(index)}
                        className="p-2 text-slate-500 hover:text-rose-450 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Tasks planned */}
              <div className="space-y-4 mt-8">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Tasks Planned</h3>
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
                      placeholder="e.g. Integrate Recharts"
                      {...register(`tasksPlanned.${index}.value`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-205 text-sm outline-none transition-all"
                    />
                    {plannedFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlanned(index)}
                        className="p-2 text-slate-500 hover:text-rose-450 hover:bg-rose-950/20 rounded-lg cursor-pointer"
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
                  <h3 className="text-sm font-bold text-rose-455 uppercase tracking-wide">Blockers</h3>
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
                      placeholder="e.g. API down"
                      {...register(`blockers.${index}.value`)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-205 text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeBlocker(index)}
                      className="p-2 text-slate-500 hover:text-rose-450 hover:bg-rose-950/20 rounded-lg cursor-pointer"
                    >
                      <FiTrash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Textarea
              label="Additional Notes / Comments"
              name="notes"
              placeholder="Add final review notes..."
              {...register('notes')}
            />
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card title="Report Information" subtitle="Work session parameters">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-medium text-slate-350">Project Name</label>
                  <select
                    {...register('project', { required: 'Please select a project' })}
                    className="px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-100 text-sm outline-none transition-all cursor-pointer focus:bg-slate-900"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Report Week"
                  name="week"
                  placeholder="YYYY-WXX"
                  error={errors.week?.message}
                  {...register('week', {
                    required: 'Week identifier is required',
                    pattern: {
                      value: /^\d{4}-W\d{2}$/,
                      message: 'Must follow format: YYYY-WXX'
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
                  label="Hours Worked"
                  type="number"
                  step="0.5"
                  name="hoursWorked"
                  error={errors.hoursWorked?.message}
                  {...register('hoursWorked', {
                    required: 'Hours is required',
                    min: { value: 0, message: 'Hours cannot be negative' }
                  })}
                />
              </div>
            </Card>

            {/* Submission Triggers */}
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
                <span>Save changes as Draft</span>
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditReport;
