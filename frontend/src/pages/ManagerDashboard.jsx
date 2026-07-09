import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Modal from '../components/Modal';
import { FiCheck, FiEye, FiTrash2, FiFileText, FiCalendar, FiUser, FiBriefcase, FiAlertTriangle } from 'react-icons/fi';

const ManagerDashboard = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    week: '',
    project: '',
    member: '',
    status: ''
  });

  // Selected report details modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query string based on filters and search
      const params = new URLSearchParams();
      if (filters.week) params.append('week', filters.week);
      if (filters.project) params.append('project', filters.project);
      if (filters.member) params.append('member', filters.member);
      if (filters.status) params.append('status', filters.status);
      if (search) params.append('search', search);

      const [reportsRes, projRes, membersRes] = await Promise.all([
        api.get(`/reports?${params.toString()}`),
        api.get('/projects'),
        api.get('/auth/members')
      ]);

      setReports(reportsRes.data.reports);
      setProjects(projRes.data.projects);
      setMembers(membersRes.data.members);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard reports data.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch reports whenever filters or search parameters change
  useEffect(() => {
    loadData();
    setCurrentPage(1); // Reset page on filter adjustment
  }, [filters, search]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await api.put(`/reports/${id}`, { status: 'Approved' });
      
      // Update reports state
      setReports(reports.map(r => r._id === id ? { ...r, status: 'Approved' } : r));
      
      // Sync modal if active
      if (selectedReport?._id === id) {
        setSelectedReport(res.data.report);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve report.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? This action is permanent.')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports(reports.filter(r => r._id !== id));
      if (selectedReport?._id === id) {
        setDetailsModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report.');
    }
  };

  const handleResetFilters = () => {
    setFilters({ week: '', project: '', member: '', status: '' });
    setSearch('');
  };

  // Dynamically compile a list of week values present in reports for selector dropdown
  const uniqueWeeks = Array.from(new Set(reports.map(r => r.week))).sort((a, b) => b.localeCompare(a));

  // Paginated calculations
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginatedReports = reports.slice(
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes[status] || 'bg-slate-850 text-slate-350'}`}>
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
      {/* Header text */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Manager Control Panel</h2>
        <p className="text-xs text-slate-400 mt-1">Review team progress submissions, audit hours, and authorize reports</p>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Reusable Filters Panel component */}
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tasks, blockers..."
            onClear={() => setSearch('')}
          />
        </div>
        
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          projects={projects}
          members={members}
          weeks={uniqueWeeks.length > 0 ? uniqueWeeks : ['2026-W27', '2026-W26', '2026-W25']}
          showMemberFilter={true}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Reports Table */}
      <Card>
        {loading ? (
          <Loader size="md" />
        ) : paginatedReports.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FiFileText className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="font-semibold text-slate-400">No reports matched filters</p>
            <p className="text-xs text-slate-500 mt-1">
              Adjust search query or filter options to review other team submissions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-350">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Member</th>
                    <th className="py-3 px-3">Week</th>
                    <th className="py-3 px-3">Project</th>
                    <th className="py-3 px-3">Worked Hours</th>
                    <th className="py-3 px-3">Tasks Completed</th>
                    <th className="py-3 px-3">Blockers</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {paginatedReports.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-900/10">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={report.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${report.user?.name}`}
                            alt={report.user?.name}
                            className="w-7 h-7 rounded-full border border-slate-850 bg-slate-900 object-cover"
                          />
                          <span className="font-semibold text-slate-200">{report.user?.name || 'Deleted User'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-100">{report.week}</td>
                      <td className="py-4 px-3 font-medium text-slate-200 max-w-[120px] truncate">
                        {report.project?.name || 'N/A'}
                      </td>
                      <td className="py-4 px-3 text-slate-200">{report.hoursWorked} hrs</td>
                      <td className="py-4 px-3">
                        <span className="text-xs text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded font-medium border border-indigo-900/30">
                          {report.tasksCompleted?.length || 0} completed
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
                            title="Review Details"
                          >
                            <FiEye className="h-4.5 w-4.5" />
                          </button>
                          
                          {report.status !== 'Approved' && report.status !== 'Draft' && (
                            <button
                              onClick={() => handleApprove(report._id)}
                              disabled={approvingId === report._id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-450 hover:bg-emerald-950/20 disabled:opacity-40 cursor-pointer"
                              title="Approve Report"
                            >
                              <FiCheck className="h-4.5 w-4.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(report._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-450 hover:bg-rose-950/20 cursor-pointer"
                            title="Delete Report"
                          >
                            <FiTrash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
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

      {/* Details Viewer Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Review Report: ${selectedReport?.week}`}
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-3">
                <img
                  src={selectedReport.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedReport.user?.name}`}
                  alt={selectedReport.user?.name}
                  className="w-10 h-10 rounded-full border border-slate-850 bg-slate-900 object-cover"
                />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Submitted By</p>
                  <p className="text-base font-bold text-white">{selectedReport.user?.name || 'Deleted User'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase text-right">Submission Status</p>
                <div className="mt-1 text-right">{getStatusBadge(selectedReport.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-900/20 border border-slate-850 rounded-xl p-4 flex items-center gap-3">
                <FiBriefcase className="text-indigo-400 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Project Name</p>
                  <p className="text-sm font-semibold text-slate-200">{selectedReport.project?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-850 rounded-xl p-4 flex items-center gap-3">
                <FiCalendar className="text-emerald-400 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Date range & Hours</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedReport.hoursWorked} hrs | {new Date(selectedReport.startDate).toLocaleDateString()} - {new Date(selectedReport.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-indigo-400 border-l-2 border-indigo-500 pl-2 uppercase tracking-wide">
                Completed Tasks
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

            {/* Planned */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-emerald-400 border-l-2 border-emerald-500 pl-2 uppercase tracking-wide">
                Planned Tasks Next Week
              </h4>
              <ul className="space-y-1.5 pl-3 list-disc text-sm text-slate-300">
                {selectedReport.tasksPlanned?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
                {selectedReport.tasksPlanned?.length === 0 && (
                  <li className="text-slate-550 list-none">No tasks planned.</li>
                )}
              </ul>
            </div>

            {/* Blockers */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-rose-455 border-l-2 border-rose-500 pl-2 uppercase tracking-wide">
                Impediments & Blockers
              </h4>
              <ul className="space-y-1.5 pl-3 text-sm text-slate-300">
                {selectedReport.blockers?.map((b, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-rose-350 font-medium">
                    <span className="shrink-0 mt-1">⚠️</span>
                    <span>{b}</span>
                  </li>
                ))}
                {selectedReport.blockers?.length === 0 && (
                  <li className="text-slate-500 pl-3">No blockers reported.</li>
                )}
              </ul>
            </div>

            {/* Notes */}
            {selectedReport.notes && (
              <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-xl space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase">Additional Comments</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{selectedReport.notes}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
              <Button variant="secondary" onClick={() => setDetailsModalOpen(false)} className="cursor-pointer">
                Close
              </Button>
              
              {selectedReport.status !== 'Approved' && selectedReport.status !== 'Draft' && (
                <Button
                  variant="success"
                  onClick={() => handleApprove(selectedReport._id)}
                  loading={approvingId === selectedReport._id}
                  className="gap-1 cursor-pointer"
                >
                  <FiCheck />
                  <span>Approve Report</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
