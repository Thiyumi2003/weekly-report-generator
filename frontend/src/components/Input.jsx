import React, { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, type = 'text', error, name, placeholder, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={name} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          placeholder={placeholder}
          className={`px-3.5 py-2 rounded-lg bg-slate-900/60 border ${
            error 
              ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' 
              : 'border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500'
          } text-slate-100 text-sm placeholder-slate-500 transition-all outline-none focus:ring-4 focus:bg-slate-900`}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
