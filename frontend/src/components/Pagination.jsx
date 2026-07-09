import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-800/40 px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/80 disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/80 disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Showing page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Previous page */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2.5 py-2 text-slate-400 bg-slate-950/40 border border-slate-800/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950/40 cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-4.5 w-4.5" />
            </button>
            
            {/* Pages list */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative inline-flex items-center px-3.5 py-2 text-sm font-medium border ${
                  currentPage === page
                    ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800'
                } cursor-pointer`}
              >
                {page}
              </button>
            ))}

            {/* Next page */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2.5 py-2 text-slate-400 bg-slate-950/40 border border-slate-800/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950/40 cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-4.5 w-4.5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
