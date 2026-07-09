import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import { FiUser, FiMail, FiShield, FiCalendar, FiClock } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header text */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Account Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Review your user profile details and settings parameters</p>
      </div>

      <Card>
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 py-4">
          {/* Large Avatar */}
          <div className="relative group shrink-0">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-xl bg-slate-900"
            />
            <span className="absolute bottom-0 right-0 block h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-slate-900 border border-slate-950" title="Active Session" />
          </div>

          {/* User parameters details list */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h3 className="text-xl font-bold text-slate-100 text-center sm:text-left">{user?.name}</h3>
              <p className="text-xs text-slate-500 text-center sm:text-left mt-0.5">{user?.role}</p>
            </div>

            <div className="border-t border-slate-850/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Email */}
              <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-850 p-3 rounded-lg">
                <FiMail className="text-indigo-400 h-5 w-5 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-slate-200 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Field 2: Role */}
              <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-850 p-3 rounded-lg">
                <FiShield className="text-emerald-400 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">User Authorization</p>
                  <p className="text-sm font-semibold text-slate-200">{user?.role}</p>
                </div>
              </div>

              {/* Field 3: Registered */}
              <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-850 p-3 rounded-lg">
                <FiCalendar className="text-purple-400 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Date Registered</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Field 4: Status */}
              <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-850 p-3 rounded-lg">
                <FiClock className="text-amber-400 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Session Status</p>
                  <p className="text-sm font-semibold text-slate-200">Active (JWT Valid)</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
