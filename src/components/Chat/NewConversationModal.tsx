import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../../types';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  me: UserProfile;
  directory: Map<string, UserProfile>;
  onCreated: (id: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose, me, directory, onCreated }) => {
  if (!isOpen) return null;
  const [search, setSearch] = useState('');

  const filtered = Array.from(directory.values()).filter(u =>
    u.uid !== me.uid && (u.username.toLowerCase().includes(search.toLowerCase()) || u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">New Conversation</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full p-2 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none"
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filtered.map(user => (
              <div key={user.uid} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                onClick={() => { onCreated(user.uid); onClose(); }}>
                <div className="flex items-center gap-2">
                  <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <span className="text-sm font-medium">{user.displayName}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-xs text-slate-400 py-4">No users found</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
