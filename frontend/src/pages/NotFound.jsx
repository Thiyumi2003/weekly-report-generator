import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative">
      <div className="absolute inset-0 bg-radial from-indigo-950/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="text-center max-w-sm space-y-5 z-10">
        <h1 className="text-8xl font-black text-indigo-500 tracking-widest font-serif drop-shadow-md">
          404
        </h1>
        
        <div>
          <h2 className="text-xl font-bold text-slate-200">Lost in the grid</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The workspace panel or page you are requesting doesn't exist, has been archived, or you lack authentication roles.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/">
            <Button variant="primary" className="cursor-pointer px-6">
              Return to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
