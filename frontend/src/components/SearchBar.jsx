import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  return (
    <div className="relative w-full md:max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <FiSearch className="h-4.5 w-4.5 text-slate-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-200 text-sm placeholder-slate-500 outline-none transition-all"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
        >
          <FiX className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
