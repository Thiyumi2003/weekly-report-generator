import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to determine the header title based on current route path
  const getHeaderTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Overview Dashboard';
    if (pathname === '/my-reports') return 'My Weekly Reports';
    if (pathname === '/create-report') return 'Submit Weekly Report';
    if (pathname.startsWith('/edit-report')) return 'Modify Weekly Report';
    if (pathname === '/projects') return 'Project Workspaces';
    if (pathname === '/manager-dashboard') return 'Manager Control Panel';
    if (pathname === '/analytics') return 'Analytics & Trends';
    if (pathname === '/ai-assistant') return 'AI Assistant';
    if (pathname === '/profile') return 'Account Profile';
    return 'TeamPulse';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Navigation drawer sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar 
          onMenuToggle={() => setSidebarOpen(true)} 
          title={getHeaderTitle(location.pathname)} 
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
