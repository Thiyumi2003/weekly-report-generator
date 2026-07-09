import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logoImage from '../images/logo.png';
import { 
  FiHome, 
  FiFileText, 
  FiFolder, 
  FiPieChart, 
  FiCpu, 
  FiUser, 
  FiLogOut,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Overview', path: '/dashboard', icon: FiHome, roles: ['Manager', 'Team Member'] },
    { name: 'My Reports', path: '/my-reports', icon: FiFileText, roles: ['Team Member'] },
    { name: 'Manager Panel', path: '/manager-dashboard', icon: FiFileText, roles: ['Manager'] },
    { name: 'Projects', path: '/projects', icon: FiFolder, roles: ['Manager', 'Team Member'] },
    { name: 'Analytics', path: '/analytics', icon: FiPieChart, roles: ['Manager', 'Team Member'] },
    { name: 'AI Assistant', path: '/ai-assistant', icon: FiCpu, roles: ['Manager'] },
    { name: 'My Profile', path: '/profile', icon: FiUser, roles: ['Manager', 'Team Member'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user?.role));

  const activeClass = 'bg-indigo-600/90 text-white font-medium shadow-md shadow-indigo-600/10';
  const inactiveClass = 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200';

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-45 w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImage}
                alt="TeamPulse logo"
                className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-indigo-500/20"
              />
              <span className="text-xl font-bold tracking-tight text-white font-serif bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                TeamPulse
              </span>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-10rem)]">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile / Logout card */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
              alt={user?.name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-800 bg-slate-900"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-850 hover:bg-rose-950/20 hover:border-rose-900/30 hover:text-rose-400 text-slate-400 transition-colors duration-150 cursor-pointer"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
