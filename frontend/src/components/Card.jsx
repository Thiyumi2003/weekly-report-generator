import React from 'react';

const Card = ({ children, title, subtitle, extra, className = '', footer }) => {
  return (
    <div className={`glass-card rounded-xl border border-slate-800/80 shadow-lg overflow-hidden ${className}`}>
      {(title || subtitle || extra) && (
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {extra && <div className="flex items-center gap-2">{extra}</div>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && <div className="px-6 py-4 bg-slate-950/20 border-t border-slate-800/60">{footer}</div>}
    </div>
  );
};

export default Card;
