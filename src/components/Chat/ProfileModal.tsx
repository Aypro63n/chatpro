import React from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileModalProps {
  me: UserProfile;
  directory: Map<string, UserProfile>;
  onClose: () => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ me, directory, onClose, onSignOut }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">User Profile</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 text-center">
          <img src={me.photoURL} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-500" alt="" />
          <h4 className="text-lg font-bold">{me.displayName}</h4>
          <p className="text-sm text-slate-500 mb-4">@{me.username}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">{me.bio || 'No bio provided.'}</p>
          <button onClick={onSignOut} className="w-full py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
