import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiPlus, 
  FiArrowRight, 
  FiPieChart, 
  FiCpu, 
  FiLayers 
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isManager = user?.role === 'Manager';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch cards summary
        const summaryRes = await api.get('/dashboard/summary');
        setMetrics(summaryRes.data.summary);

        // Fetch charts activity to list recent reports
        const chartsRes = await api.get('/dashboard/charts');
        setRecentReports(chartsRes.data.charts.recentActivity || []);

      } catch (err) {
        console.error('Error fetching dashboard statistics', err);
        setError('Could not retrieve dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Get status color coding
  const getStatusBadge = (status) => {
    const classes = {
      Draft: 'bg-slate-800 text-slate-400 border-slate-700/60',
      Submitted: 'bg-indigo-950/60 text-indigo-400 border-indigo-900/40',
      Late: 'bg-amber-950/60 text-amber-400 border-amber-900/40',
      Approved: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${classes[status] || 'bg-slate-800 text-slate-350'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900/65 to-slate-900 border border-indigo-950 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            {isManager 
              ? 'Analyze your organization metrics, view submission trends, and converse with the AI team assistant.'
              : 'Keep your team updated. Complete your weekly report logs and details for assigned project milestones.'}
          </p>
        </div>
        <div className="shrink-0 flex gap-3">
          {isManager ? (
            <>
              <Link to="/ai-assistant">
                <Button variant="primary" className="gap-2 cursor-pointer">
                  <FiCpu className="h-4 w-4" />
                  <span>Ask AI Assistant</span>
                </Button>
              </Link>
              <Link to="/manager-dashboard">
                <Button variant="secondary" className="gap-2 cursor-pointer">
                  <span>Manager Panel</span>
                  <FiArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/create-report">
              <Button variant="primary" className="gap-2 cursor-pointer">
                <FiPlus className="h-4 w-4" />
                <span>Submit Weekly Report</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Summary Counts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Reports Total */}
        <div className="glass-card rounded-xl border border-slate-850 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isManager ? 'Total Submissions' : 'My Total Reports'}
            </p>
            <p className="text-2xl font-bold text-white mt-1.5">{metrics?.totalReports || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400">
            <FiFileText className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Submitted / Approved */}
        <div className="glass-card rounded-xl border border-slate-850 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isManager ? 'Approved & Sent' : 'Submitted Reports'}
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-1.5">{metrics?.reportsSubmitted || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400">
            <FiCheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="glass-card rounded-xl border border-slate-850 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isManager ? 'Pending Review' : 'Report Drafts'}
            </p>
            <p className="text-2xl font-bold text-indigo-400 mt-1.5">{metrics?.pendingReports || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
            <FiClock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Blockers */}
        <div className="glass-card rounded-xl border border-slate-850 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Open Blockers
            </p>
            <p className="text-2xl font-bold text-rose-500 mt-1.5">{metrics?.openBlockers || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-950/40 border border-rose-900/30 flex items-center justify-center text-rose-400">
            <FiAlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Submissions table */}
        <div className="lg:col-span-2">
          <Card 
            title={isManager ? 'Recent Team Submissions' : 'Recent Submissions'}
            subtitle="The latest reports submitted by members"
            extra={
              <Link to={isManager ? '/manager-dashboard' : '/my-reports'} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>View All</span>
                <FiArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            {recentReports.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No recent submitted reports found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-350">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-850">
                    <tr>
                      {isManager && <th className="py-3 px-2">Member</th>}
                      <th className="py-3 px-2">Week</th>
                      <th className="py-3 px-2">Project</th>
                      <th className="py-3 px-2">Submitted</th>
                      <th className="py-3 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {recentReports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-900/20">
                        {isManager && (
                          <td className="py-3 px-2 font-medium text-slate-200">
                            {report.user}
                          </td>
                        )}
                        <td className="py-3 px-2">{report.week}</td>
                        <td className="py-3 px-2 truncate max-w-[120px]">{report.project}</td>
                        <td className="py-3 px-2 text-xs">
                          {new Date(report.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {getStatusBadge(report.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Quick Features Links list */}
        <div>
          <Card title="Quick Options" subtitle="Speed links to features">
            <div className="space-y-4">
              <Link 
                to="/analytics" 
                className="flex items-center gap-3.5 p-3 rounded-lg border border-slate-850 hover:border-slate-800 hover:bg-slate-900/20 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 bg-slate-900 flex items-center justify-center rounded-lg text-indigo-400 shrink-0">
                  <FiPieChart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">View Charts & Analytics</p>
                  <p className="text-xs text-slate-500 mt-0.5">Explore reports trend, projects workloads</p>
                </div>
              </Link>

              <Link 
                to="/projects" 
                className="flex items-center gap-3.5 p-3 rounded-lg border border-slate-850 hover:border-slate-800 hover:bg-slate-900/20 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 bg-slate-900 flex items-center justify-center rounded-lg text-emerald-400 shrink-0">
                  <FiLayers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Projects Directory</p>
                  <p className="text-xs text-slate-500 mt-0.5">{isManager ? 'Manage active & completed projects' : 'View active project list'}</p>
                </div>
              </Link>

              {isManager && (
                <Link 
                  to="/ai-assistant" 
                  className="flex items-center gap-3.5 p-3 rounded-lg border border-slate-850 hover:border-slate-800 hover:bg-slate-900/20 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 bg-slate-900 flex items-center justify-center rounded-lg text-purple-400 shrink-0">
                    <FiCpu className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">AI Report Summarizer</p>
                    <p className="text-xs text-slate-500 mt-0.5">Ask questions about employee weekly progress</p>
                  </div>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
