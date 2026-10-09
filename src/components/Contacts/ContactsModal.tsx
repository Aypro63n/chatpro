import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  MessageSquare, 
  UserCheck, 
  Loader2, 
  Clock, 
  ShieldCheck, 
  UserPlus,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { searchRegisteredUsers, subscribeToAllRegisteredUsers } from '../../services/chatService';
import { UserProfile, getPresenceStatus, getPresenceDotClass } from '../../types';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  isOpen,
  onClose,
  onSelectUser
}) => {
  const { currentUser, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    if (!searchTerm.trim()) {
      setLoading(true);
      const unsub = subscribeToAllRegisteredUsers(currentUser.uid, (results) => {
        setUsers(results);
        setLoading(false);
      });
      return () => unsub();
    } else {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const results = await searchRegisteredUsers(searchTerm, currentUser.uid);
          setUsers(results);
        } catch (err) {
          console.error('Failed to search users:', err);
        } finally {
          setLoading(false);
        }
      };

      const debounce = setTimeout(fetchUsers, 250);
      return () => clearTimeout(debounce);
    }
  }, [isOpen, searchTerm, currentUser]);

  if (!isOpen) return null;

  const formatLastSeen = (isoString?: string) => {
    if (!isoString) return 'Recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Find Registered Users
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search verified ChatPro accounts to start a private chat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by @username or display name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              autoFocus
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs">Searching real Firebase users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <UserCheck className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {searchTerm ? 'No users matching that search' : 'No other users registered yet'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Invite colleagues or open another browser tab/incognito window to register a second account and test real person-to-person messaging!
              </p>
            </div>
          ) : (
            users.map((user) => {
              const presenceStatus = getPresenceStatus(user);
              const dotClass = getPresenceDotClass(presenceStatus);

              return (
                <div
                  key={user.uid}
                  className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.displayName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${dotClass}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user.displayName}
                        </span>
                        {user.role === 'admin' || user.role === 'owner' ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                            {user.role.toUpperCase()}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          @{user.username}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          {presenceStatus === 'online' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                          ) : presenceStatus === 'away' ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Away</span>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Offline ({formatLastSeen(user.lastSeen)})</span>
                            </>
                          )}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message button */}
                  <button
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className="ml-3 shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20 group-hover:scale-102"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real registered user directory • Guaranteed human-to-human
          </p>
        </div>

      </div>
    </div>
  );
};
