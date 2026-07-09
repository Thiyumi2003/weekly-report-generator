import React from 'react';
import { FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ onMenuToggle, title }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
        >
          <FiMenu className="h-5.5 w-5.5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification panel shortcut */}
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 relative cursor-pointer">
          <FiBell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-850" />

        {/* Profile indicator */}
        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 object-cover"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-350">{user?.name}</span>
            <span className="text-[10px] text-slate-500 -mt-0.5">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
