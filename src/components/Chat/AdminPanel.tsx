import React from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminPanelProps {
  me: UserProfile;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ me, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Admin Console</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Welcome, {me.displayName}. You have administrative access to manage users and roles.</p>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold opacity-50 cursor-not-allowed">Purge Cache</button>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold opacity-50 cursor-not-allowed">Global Mute</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
