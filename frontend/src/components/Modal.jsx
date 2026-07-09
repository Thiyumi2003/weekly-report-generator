import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-200">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div
        className={`relative w-full bg-slate-900 border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 flex flex-col ${
          sizeClasses[size] || sizeClasses.md
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/60">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
