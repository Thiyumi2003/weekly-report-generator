import React from 'react';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';

const FilterPanel = ({
  filters,
  setFilters,
  projects = [],
  members = [],
  weeks = [],
  showMemberFilter = false,
  onReset
}) => {
  const handleChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-wrap gap-4 items-end">
      {/* Label and Icon */}
      <div className="flex items-center gap-2 text-slate-300 text-sm font-medium h-9 mb-0.5">
        <FiFilter className="text-indigo-500 h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Week Selector */}
      <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
        <label className="text-xs font-semibold text-slate-400">Week</label>
        <select
          value={filters.week || ''}
          onChange={(e) => handleChange('week', e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Weeks</option>
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* Project Selector */}
      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-slate-400">Project</label>
        <select
          value={filters.project || ''}
          onChange={(e) => handleChange('project', e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Member Selector (Managers Only) */}
      {showMemberFilter && (
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-slate-400">Team Member</label>
          <select
            value={filters.member || ''}
            onChange={(e) => handleChange('member', e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Members</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Selector */}
      <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
        <label className="text-xs font-semibold text-slate-400">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Late">Late</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      {/* Reset Filter Button */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer h-9"
        >
          <FiRefreshCw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
