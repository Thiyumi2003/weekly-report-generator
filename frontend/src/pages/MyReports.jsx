import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiCalendar, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selected report details modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await api.get('/reports');
      setReports(res.data.reports);

      const projRes = await api.get('/projects');
      setProjects(projRes.data.projects);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your reports list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? This action is permanent.')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports(reports.filter(r => r._id !== id));
      if (selectedReport?._id === id) {
        setDetailsModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting report.');
    }
  };

  // Filter logic
  const filteredReports = reports.filter((report) => {
    const matchesProject = projectFilter ? report.project?._id === projectFilter : true;
    const matchesStatus = statusFilter ? report.status === statusFilter : true;
    
    let matchesSearch = true;
    if (search) {
      const query = search.toLowerCase();
      const notesMatch = report.notes?.toLowerCase().includes(query);
      const weekMatch = report.week?.toLowerCase().includes(query);
      const tasksCompletedMatch = report.tasksCompleted?.some(t => t.toLowerCase().includes(query));
      const tasksPlannedMatch = report.tasksPlanned?.some(t => t.toLowerCase().includes(query));
      const blockersMatch = report.blockers?.some(b => b.toLowerCase().includes(query));
      
      matchesSearch = notesMatch || weekMatch || tasksCompletedMatch || tasksPlannedMatch || blockersMatch;
    }
    
    return matchesProject && matchesStatus && matchesSearch;
  });

  // Paginate reports
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const classes = {
      Draft: 'bg-slate-800 text-slate-400 border-slate-700/60',
      Submitted: 'bg-indigo-950/60 text-indigo-400 border-indigo-900/40',
      Late: 'bg-amber-950/60 text-amber-400 border-amber-900/40',
      Approved: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes[status] || 'bg-slate-800 text-slate-350'}`}>
        {status}
      </span>
    );
  };

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and CTA button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Report History</h2>
          <p className="text-xs text-slate-400 mt-1">Submit new logs, manage drafts, and view approvals</p>
        </div>
        <Link to="/create-report">
          <Button variant="primary" className="gap-2 cursor-pointer">
            <FiPlus className="h-4.5 w-4.5" />
            <span>Create Weekly Report</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Filter and Search Row */}
      <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <SearchBar 
          value={search} 
          onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
          placeholder="Search within tasks/notes..."
          onClear={() => setSearch('')}
        />
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Project filter selector */}
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-350 outline-none focus:border-indigo-500 cursor-pointer flex-1 md:flex-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          {/* Status filter selector */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-350 outline-none focus:border-indigo-500 cursor-pointer flex-1 md:flex-none"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Late">Late</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Reports Grid/Table Panel */}
      <Card>
        {loading ? (
          <Loader size="md" />
        ) : paginatedReports.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FiCalendar className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="font-semibold text-slate-400">No reports found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't submitted any reports matching the selected filters. Submit a new report to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-350">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Week</th>
                    <th className="py-3 px-3">Project</th>
                    <th className="py-3 px-3">Date Range</th>
                    <th className="py-3 px-3">Hours</th>
                    <th className="py-3 px-3">Tasks</th>
                    <th className="py-3 px-3">Blockers</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {paginatedReports.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-900/10">
                      <td className="py-4 px-3 font-semibold text-slate-100">{report.week}</td>
                      <td className="py-4 px-3 font-medium text-slate-200 truncate max-w-[140px]">
                        {report.project?.name || 'N/A'}
                      </td>
                      <td className="py-4 px-3 text-xs text-slate-400">
                        {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-3 text-slate-200">{report.hoursWorked} hrs</td>
                      <td className="py-4 px-3">
                        <span className="text-xs text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded font-medium border border-indigo-900/30">
                          {report.tasksCompleted?.length || 0} done
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        {report.blockers && report.blockers.length > 0 ? (
                          <span className="text-xs text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded font-medium border border-rose-900/30 inline-flex items-center gap-1">
                            <FiAlertTriangle className="h-3 w-3" />
                            <span>{report.blockers.length} issues</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-4 px-3">{getStatusBadge(report.status)}</td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openDetailsModal(report)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 cursor-pointer"
                            title="View Report Details"
                          >
                            <FiEye className="h-4.5 w-4.5" />
                          </button>
                          
                          {report.status !== 'Approved' && (
                            <Link to={`/edit-report/${report._id}`}>
                              <button
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/20 cursor-pointer"
                                title="Edit Report"
                              >
                                <FiEdit2 className="h-4.5 w-4.5" />
                              </button>
                            </Link>
                          )}

                          {report.status === 'Draft' && (
                            <button
                              onClick={() => handleDelete(report._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-450 hover:bg-rose-950/20 cursor-pointer"
                              title="Delete Draft"
                            >
                              <FiTrash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-900 text-slate-400 rounded disabled:opacity-50 text-xs cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-900 text-slate-400 rounded disabled:opacity-50 text-xs cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Weekly Report: ${selectedReport?.week}`}
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-lg text-slate-350">
                  <FiBriefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Project Workspace</p>
                  <p className="text-base font-bold text-white">{selectedReport.project?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase text-right">Submission Status</p>
                <div className="mt-1 text-right">{getStatusBadge(selectedReport.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-900/20 border border-slate-850 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Duration Period</p>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <FiCalendar className="text-indigo-400" />
                  <span>
                    {new Date(selectedReport.startDate).toLocaleDateString()} - {new Date(selectedReport.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-850 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Hours Logged</p>
                <div className="text-sm font-bold text-slate-200">{selectedReport.hoursWorked} hours logged</div>
              </div>
            </div>

            {/* Tasks Completed */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-indigo-400 border-l-2 border-indigo-500 pl-2 uppercase tracking-wide">
                Tasks Completed
              </h4>
              <ul className="space-y-1.5 pl-3 list-disc text-sm text-slate-300">
                {selectedReport.tasksCompleted?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
                {selectedReport.tasksCompleted?.length === 0 && (
                  <li className="text-slate-550 list-none">No tasks marked as completed.</li>
                )}
              </ul>
            </div>

            {/* Tasks Planned */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-emerald-400 border-l-2 border-emerald-500 pl-2 uppercase tracking-wide">
                Tasks Planned Next Week
              </h4>
              <ul className="space-y-1.5 pl-3 list-disc text-sm text-slate-300">
                {selectedReport.tasksPlanned?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
                {selectedReport.tasksPlanned?.length === 0 && (
                  <li className="text-slate-550 list-none">No tasks planned for next week.</li>
                )}
              </ul>
            </div>

            {/* Blockers */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-rose-450 border-l-2 border-rose-500 pl-2 uppercase tracking-wide">
                Impediments & Blockers
              </h4>
              <ul className="space-y-1.5 pl-3 text-sm text-slate-300">
                {selectedReport.blockers?.map((b, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-rose-300">
                    <span className="shrink-0 mt-1">⚠️</span>
                    <span>{b}</span>
                  </li>
                ))}
                {selectedReport.blockers?.length === 0 && (
                  <li className="text-slate-500 pl-3">No blockers reported (clean sprint!).</li>
                )}
              </ul>
            </div>

            {/* Notes */}
            {selectedReport.notes && (
              <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-xl space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase">Additional Notes</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{selectedReport.notes}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
              <Button variant="secondary" onClick={() => setDetailsModalOpen(false)} className="cursor-pointer">
                Close
              </Button>
              {selectedReport.status !== 'Approved' && (
                <Link to={`/edit-report/${selectedReport._id}`}>
                  <Button variant="primary" className="cursor-pointer">
                    Edit Report
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyReports;
