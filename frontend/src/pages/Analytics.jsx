import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Loader from '../components/Loader';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { FiPieChart, FiTrendingUp, FiCheckCircle, FiClock, FiAlertTriangle, FiFileText } from 'react-icons/fi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const STATUS_COLORS = {
  Draft: '#64748b',       // slate-500
  Submitted: '#6366f1',   // indigo-500
  Late: '#f59e0b',        // amber-500
  Approved: '#10b981'     // emerald-500
};

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const [summaryRes, chartsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/charts')
        ]);

        setMetrics(summaryRes.data.summary);
        setChartsData(chartsRes.data.charts);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve analytics data metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-slate-200">
            {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Summary Cards metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card border border-slate-850 p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/50 border border-indigo-900/20 text-indigo-400 flex items-center justify-center shrink-0">
            <FiFileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Total Reports</p>
            <p className="text-xl font-bold text-white mt-0.5">{metrics?.totalReports || 0}</p>
          </div>
        </div>

        <div className="glass-card border border-slate-850 p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/50 border border-emerald-900/20 text-emerald-400 flex items-center justify-center shrink-0">
            <FiCheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Reports Submitted</p>
            <p className="text-xl font-bold text-white mt-0.5">{metrics?.reportsSubmitted || 0}</p>
          </div>
        </div>

        <div className="glass-card border border-slate-850 p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center shrink-0">
            <FiClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Draft Reports</p>
            <p className="text-xl font-bold text-white mt-0.5">{metrics?.pendingReports || 0}</p>
          </div>
        </div>

        <div className="glass-card border border-slate-850 p-5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-950/50 border border-rose-900/20 text-rose-455 flex items-center justify-center shrink-0">
            <FiAlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Open Blockers</p>
            <p className="text-xl font-bold text-white mt-0.5">{metrics?.openBlockers || 0}</p>
          </div>
        </div>
      </div>

      {/* Grid of chart graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Tasks Completed by Week */}
        <Card title="Tasks Completed by Week" subtitle="Comparison of tasks completed versus tasks planned">
          <div className="h-72 mt-4 text-xs font-semibold">
            {chartsData?.tasksByWeek?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">No report metrics available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData?.tasksByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar name="Tasks Completed" dataKey="tasksCompleted" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar name="Tasks Planned" dataKey="tasksPlanned" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Reports Trend */}
        <Card title="Weekly Submissions Trend" subtitle="Volume of submitted reports across work weeks">
          <div className="h-72 mt-4 text-xs font-semibold">
            {chartsData?.reportsTrend?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">No trend metrics available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData?.reportsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line name="Submitted Reports" type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 3: Workload by Project */}
        <Card title="Hours Worked by Project" subtitle="Logged hours distribution across workspaces">
          <div className="h-72 mt-4 flex items-center justify-center">
            {chartsData?.workloadByProject?.length === 0 ? (
              <div className="text-slate-500 text-sm">No project metrics recorded.</div>
            ) : (
              <div className="w-full h-full flex flex-col md:flex-row items-center justify-around gap-4">
                <div className="w-full md:w-3/5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData?.workloadByProject}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartsData?.workloadByProject.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Labels legend */}
                <div className="text-xs space-y-2 shrink-0 md:max-w-[150px]">
                  {chartsData?.workloadByProject.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-300 truncate max-w-[100px]">{entry.name}</span>
                      <span className="text-slate-500 font-bold">({entry.value} hrs)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Chart 4: Submission status */}
        <Card title="Audited Submission Status" subtitle="Classification of report status counts">
          <div className="h-72 mt-4 flex items-center justify-center">
            {chartsData?.submissionStatus?.every(item => item.value === 0) ? (
              <div className="text-slate-500 text-sm">No report data found.</div>
            ) : (
              <div className="w-full h-full flex flex-col md:flex-row items-center justify-around gap-4">
                <div className="w-full md:w-3/5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData?.submissionStatus.filter(i => i.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        dataKey="value"
                        labelLine={false}
                      >
                        {chartsData?.submissionStatus.filter(i => i.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Labels legend */}
                <div className="text-xs space-y-2 shrink-0">
                  {chartsData?.submissionStatus.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || '#64748b' }} />
                      <span className="text-slate-350">{entry.name}</span>
                      <span className="text-slate-500 font-bold">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Analytics;
