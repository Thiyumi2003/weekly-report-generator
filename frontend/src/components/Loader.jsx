import React from 'react';

const Loader = ({ size = 'md', color = 'indigo' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  };

  const colorClasses = {
    indigo: 'border-indigo-500 border-t-transparent',
    emerald: 'border-emerald-500 border-t-transparent',
    slate: 'border-slate-500 border-t-transparent',
    rose: 'border-rose-500 border-t-transparent'
  };

  return (
    <div className="flex justify-center items-center py-2">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
          colorClasses[color] || colorClasses.indigo
        }`}
      />
    </div>
  );
};

export default Loader;
