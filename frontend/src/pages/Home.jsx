import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiCheckCircle, FiTrendingUp, FiCpu, FiArrowRight } from 'react-icons/fi';
import logoImage from '../images/logo.png';

const Home = () => {
  const { user } = useAuth();

  // If already authenticated, bypass the landing page
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative">
      {/* Background radial gradients for styling */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Row */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <img
            src={logoImage}
            alt="TeamPulse logo"
            className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-indigo-500/20"
          />
          <span className="text-xl font-bold tracking-tight font-serif bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            TeamPulse
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-350 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/60 rounded-full px-3 py-1 text-xs text-indigo-300 font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>New: AI Report Assistant Powered by OpenAI</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-serif max-w-4xl leading-tight">
          Keep Your Team in Sync with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            TeamPulse
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mt-6 leading-relaxed">
          The ultimate MERN weekly report generator and manager analytic dashboard. Collect clean structured logs, monitor team progress, map task completion, and resolve project blockers.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Create Free Account</span>
            <FiArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link 
            to="/login" 
            className="px-6 py-3 font-semibold text-slate-200 bg-slate-900 border border-slate-800/80 hover:bg-slate-850 rounded-lg transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          <div className="glass-card border border-slate-900 p-8 rounded-2xl text-left hover:border-slate-800 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-850 flex items-center justify-center text-indigo-400 mb-6">
              <FiCheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Clean Report Builder</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Submit reports with distinct lists for completed items, future plans, blockers, and worked hours. Save drafts or submit directly.
            </p>
          </div>

          <div className="glass-card border border-slate-900 p-8 rounded-2xl text-left hover:border-slate-800 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-905 flex items-center justify-center text-emerald-400 mb-6">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Executive Dashboards</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Visualize performance with interactive Recharts. Track report submit rates, project hour distribution, and tasks counts.
            </p>
          </div>

          <div className="glass-card border border-slate-900 p-8 rounded-2xl text-left hover:border-slate-800 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-850 flex items-center justify-center text-purple-400 mb-6">
              <FiCpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">AI Report Summaries</h3>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Ask queries like "Summarize John's progress" or "List recurring blockers". Uses LLMs to crawl records and synthesize answers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Row */}
      <footer className="h-16 flex items-center justify-center px-6 border-t border-slate-900/60 bg-slate-950 text-slate-500 text-xs z-10">
        <p>&copy; {new Date().getFullYear()} TeamPulse. Designed for modern corporate productivity dashboard architectures.</p>
      </footer>
    </div>
  );
};

export default Home;
