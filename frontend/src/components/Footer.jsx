import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t border-slate-900/60 bg-slate-950/20 text-center text-xs text-slate-500 mt-auto">
      <p>
        &copy; {new Date().getFullYear()} TeamPulse. All rights reserved. Professional Weekly Report Generator & Team Dashboard.
      </p>
    </footer>
  );
};

export default Footer;
