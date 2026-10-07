import React, { useState } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Key, 
  LogOut, 
  Check, 
  Loader2, 
  AlertCircle,
  Eye,
  CheckCheck,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, WallpaperStyle } from '../../context/ThemeContext';
import { unblockUser } from '../../services/chatService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfileData, resetPassword, logout, currentUser } = useAuth();
  const { theme, toggleTheme, wallpaper, setWallpaper } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'privacy' | 'security'>('account');
  
  // Account Form
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');

  // Privacy Form
  const [showOnlineStatus, setShowOnlineStatus] = useState(userProfile?.showOnlineStatus !== false);
  const [readReceipts, setReadReceipts] = useState(userProfile?.readReceipts !== false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateProfileData({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        photoURL: photoURL.trim(),
        showOnlineStatus,
        readReceipts
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setError(null);
    try {
      await resetPassword(currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset');
    }
  };

  const wallpapers: { id: WallpaperStyle; name: string; bgClass: string }[] = [
    { id: 'default', name: 'Slate Default', bgClass: 'bg-slate-100 dark:bg-slate-950' },
    { id: 'midnight', name: 'Midnight Blue', bgClass: 'bg-blue-950' },
    { id: 'emerald', name: 'Emerald Forest', bgClass: 'bg-emerald-950' },
    { id: 'cyber', name: 'Cyber Purple', bgClass: 'bg-purple-950' },
    { id: 'warm', name: 'Warm Amber', bgClass: 'bg-amber-950' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-56 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between md:justify-start gap-2 mb-4 px-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Settings
              </h3>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'account' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
              >
                <User className="w-4 h-4" />
                <span>Account</span>
              </button>

              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'appearance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
              >
                <Palette className="w-4 h-4" />
                <span>Appearance</span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'privacy' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
              >
                <Shield className="w-4 h-4" />
                <span>Privacy</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
              >
                <Key className="w-4 h-4" />
                <span>Security</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 hidden md:block">
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="hidden md:flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Changes saved successfully!</span>
              </div>
            )}

            {/* TAB: ACCOUNT */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 pb-2">
                  <img
                    src={photoURL || userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.username}`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Profile Avatar
                    </h4>
                    <p className="text-xs text-slate-500">
                      Enter any image URL or leave blank for auto-generated avatar
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username handle
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio / Status Line
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your contacts about yourself..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Account Details</span>
                </button>
              </form>
            )}

            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Color Theme
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Choose between dark or light appearance
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={toggleTheme}
                      className={`flex-1 p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${theme === 'dark' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark Theme</span>
                    </button>
                    <button
                      onClick={toggleTheme}
                      className={`flex-1 p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Theme</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Chat Wallpaper Backdrop
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Personalize your chat background atmosphere
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {wallpapers.map((wp) => (
                      <button
                        key={wp.id}
                        onClick={() => setWallpaper(wp.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${wallpaper === wp.id ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        <div className={`w-full h-12 rounded-xl mb-2 border border-slate-700/30 ${wp.bgClass}`} />
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          {wp.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRIVACY */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Online Presence Status</p>
                      <p className="text-xs text-slate-500">Allow contacts to see when you are actively online</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showOnlineStatus}
                    onChange={(e) => {
                      setShowOnlineStatus(e.target.checked);
                      updateProfileData({ showOnlineStatus: e.target.checked });
                    }}
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Read Receipts</p>
                      <p className="text-xs text-slate-500">Show double-check status when you read messages</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => {
                      setReadReceipts(e.target.checked);
                      updateProfileData({ readReceipts: e.target.checked });
                    }}
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Blocked Users Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Blocked Contacts
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Blocked users cannot start direct conversations or message you
                  </p>
                  {userProfile?.blockedUsers && userProfile.blockedUsers.length > 0 ? (
                    <div className="space-y-2">
                      {userProfile.blockedUsers.map((uid) => (
                        <div key={uid} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[180px]">UID: {uid}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (userProfile) {
                                await unblockUser(userProfile.uid, uid);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No contacts blocked.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Password Management
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Send a verified password reset email to {currentUser?.email}
                  </p>
                  <button
                    onClick={handlePasswordReset}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Send Password Reset Link
                  </button>
                  {resetSent && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4" /> Reset instructions dispatched to your email!
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60">
                  <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                    Sign Out
                  </h4>
                  <p className="text-xs text-red-600/80 dark:text-red-300/80 mb-3">
                    Disconnect this device and clear current session tokens
                  </p>
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Log Out of ChatPro
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
