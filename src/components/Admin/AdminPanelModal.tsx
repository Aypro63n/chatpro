import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Users, 
  Flag, 
  Megaphone, 
  FileText, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Check, 
  UserCheck, 
  UserX, 
  VolumeX, 
  Volume2, 
  ChevronRight,
  Send,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  changeUserRole, 
  suspendUser, 
  restoreUser, 
  muteUser, 
  unmuteUser, 
  removeUserAccount, 
  fetchAuditLogs,
  createAnnouncement 
} from '../../services/chatService';
import { UserProfile, Report, Announcement, AuditLog, UserRole, ROLE_HIERARCHY } from '../../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  actionText: string;
  onConfirm: () => Promise<void>;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, currentUser, isOwner, isAdmin, isMaintainer, roleLevel } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'audit' | 'reports' | 'broadcasts'>('roles');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [submittingAnn, setSubmittingAnn] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    actionText: 'Confirm',
    onConfirm: async () => {}
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      if (activeTab === 'roles') {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(100)));
        const userList: UserProfile[] = [];
        usersSnap.forEach(d => userList.push(d.data() as UserProfile));
        // Sort by role hierarchy then username
        userList.sort((a, b) => {
          const lA = ROLE_HIERARCHY[a.role || 'member'] || 1;
          const lB = ROLE_HIERARCHY[b.role || 'member'] || 1;
          return lB - lA;
        });
        setUsers(userList);
      } else if (activeTab === 'audit') {
        const logs = await fetchAuditLogs();
        setAuditLogs(logs || []);
      } else if (activeTab === 'reports') {
        const repSnap = await getDocs(query(collection(db, 'reports'), limit(50)));
        const repList: Report[] = [];
        repSnap.forEach(d => repList.push(d.data() as Report));
        setReports(repList);
      } else if (activeTab === 'broadcasts') {
        const annSnap = await getDocs(query(collection(db, 'announcements'), limit(20)));
        const aList: Announcement[] = [];
        annSnap.forEach(d => aList.push(d.data() as Announcement));
        setAnnouncements(aList);
      }
    } catch (err: any) {
      console.error('Failed to load control panel data:', err);
      setActionError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const triggerConfirm = (title: string, message: string, actionText: string, onConfirm: () => Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      actionText,
      onConfirm
    });
  };

  const executeConfirmedAction = async () => {
    setConfirmLoading(true);
    setActionError(null);
    try {
      await confirmModal.onConfirm();
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      await loadData();
    } catch (err: any) {
      console.error('Action failed:', err);
      setActionError(err.message || 'Operation failed');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRoleChange = (target: UserProfile, newRole: UserRole) => {
    if (!userProfile) return;
    triggerConfirm(
      `Change Role to ${newRole.toUpperCase()}?`,
      `Assign ${target.displayName} (@${target.username}) the role of ${newRole.toUpperCase()}. This directly alters their system authority.`,
      `Set as ${newRole.toUpperCase()}`,
      async () => {
        await changeUserRole(userProfile, target, newRole, `Role updated to ${newRole}`);
      }
    );
  };

  const handleSuspendToggle = (target: UserProfile) => {
    if (!userProfile) return;
    const isCurrentlySuspended = !!target.isSuspended;
    if (isCurrentlySuspended) {
      triggerConfirm(
        `Restore Account Access?`,
        `Restore ChatPro messaging and login access for ${target.displayName} (@${target.username}).`,
        `Restore User`,
        async () => {
          await restoreUser(userProfile, target, 'Administrative restoration');
        }
      );
    } else {
      triggerConfirm(
        `Suspend User Account?`,
        `Immediately suspend ${target.displayName} (@${target.username}). They will be unable to send messages.`,
        `Suspend User`,
        async () => {
          await suspendUser(userProfile, target, 'Administrative suspension');
        }
      );
    }
  };

  const handleMuteToggle = (target: UserProfile) => {
    if (!userProfile) return;
    const isCurrentlyMuted = !!(target.isMuted && (!target.muteUntil || target.muteUntil > Date.now()));
    if (isCurrentlyMuted) {
      triggerConfirm(
        `Unmute User?`,
        `Unmute ${target.displayName} (@${target.username}) and allow messaging in Global Chat.`,
        `Unmute`,
        async () => {
          await unmuteUser(userProfile, target);
        }
      );
    } else {
      triggerConfirm(
        `Mute User for 1 Hour?`,
        `Temporarily mute ${target.displayName} (@${target.username}) from public messaging for 60 minutes.`,
        `Mute for 1h`,
        async () => {
          await muteUser(userProfile, target, 60, '1-hour administrative mute');
        }
      );
    }
  };

  const handleRemoveUser = (target: UserProfile) => {
    if (!userProfile) return;
    triggerConfirm(
      `Permanently Remove User?`,
      `This will delete the user account profile of ${target.displayName} (@${target.username}). This action is irreversible.`,
      `Delete User`,
      async () => {
        await removeUserAccount(userProfile, target, 'Administrative account removal');
      }
    );
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim() || !currentUser) return;
    setSubmittingAnn(true);
    setActionError(null);
    try {
      await createAnnouncement(annTitle, annContent, currentUser.uid);
      setAnnTitle('');
      setAnnContent('');
      setAnnSuccess(true);
      setTimeout(() => setAnnSuccess(false), 3000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to post announcement');
    } finally {
      setSubmittingAnn(false);
    }
  };

  const handleUpdateReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    } catch (err: any) {
      setActionError(err.message || 'Failed to update report');
    }
  };

  if (!isOpen) return null;

  const currentRole = userProfile?.role || 'member';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in-fast font-sans text-white">
      <div className="relative w-full max-w-4xl bg-[#000000] border border-[#333333] shadow-2xl rounded-[2px] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#222222] flex items-center justify-between bg-[#000000]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] border border-[#333333] bg-[#111111] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                  ChatPro Role & Control Console
                </h3>
                <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase bg-[#222222] border border-[#333333] text-white">
                  {currentRole.toUpperCase()} (LVL {roleLevel})
                </span>
              </div>
              <p className="text-[11px] text-[#888888]">
                Strict downward hierarchy enforcement • Backend Firestore security rules active
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] border border-transparent hover:border-[#333333] text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="px-4 py-2 bg-[#111111] border-b border-[#333333] flex items-center gap-2 text-xs text-[#FFFFFF]">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span className="font-mono">{actionError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222222] px-4 sm:px-6 bg-[#000000] overflow-x-auto">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-3 sm:px-4 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'roles' 
                ? 'border-white text-white font-bold' 
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Role Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 sm:px-4 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'audit' 
                ? 'border-white text-white font-bold' 
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-3 sm:px-4 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reports' 
                ? 'border-white text-white font-bold' 
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reports ({reports.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('broadcasts')}
              className={`py-3 px-3 sm:px-4 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'broadcasts' 
                  ? 'border-white text-white font-bold' 
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Broadcasts</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#000000]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#888888]">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span className="text-xs font-mono">Syncing Firestore backend records...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: ROLE MANAGEMENT */}
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  {/* Hierarchy Info Box */}
                  <div className="p-3 border border-[#222222] bg-[#0a0a0a] rounded-[2px] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#888888]">
                      HIERARCHY: <strong className="text-white">OWNER (4)</strong> → <strong className="text-white">ADMIN (3)</strong> → <strong className="text-white">MAINTAINER (2)</strong> → <strong className="text-white">MEMBER (1)</strong>
                    </span>
                    <span className="text-[11px] text-[#666666]">Downward-only control</span>
                  </div>

                  <div className="overflow-x-auto border border-[#333333] rounded-[2px]">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#111111] text-[#888888] border-b border-[#333333] uppercase text-[11px]">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Current Role</th>
                          <th className="p-3">Account Status</th>
                          <th className="p-3 text-right">Permitted Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222] bg-[#000000]">
                        {users.map((target) => {
                          const targetRole = target.role || 'member';
                          const targetLevel = ROLE_HIERARCHY[targetRole] || 1;
                          const isSelf = target.uid === currentUser?.uid;
                          const canManageTarget = !isSelf && roleLevel > targetLevel;

                          return (
                            <tr key={target.uid} className="hover:bg-[#0a0a0a] transition-colors">
                              {/* User Info */}
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={target.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${target.username}`}
                                    alt={target.displayName}
                                    className="w-7 h-7 rounded-[2px] border border-[#333333] object-cover"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                                      {target.displayName} {isSelf && <span className="text-[#888888] font-normal">(You)</span>}
                                    </div>
                                    <div className="text-[10px] text-[#888888]">
                                      @{target.username} • {target.email || 'guest'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Role Badge */}
                              <td className="p-3">
                                <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-mono uppercase border ${
                                  targetRole === 'owner' ? 'border-white bg-white text-black font-bold' :
                                  targetRole === 'admin' ? 'border-white text-white font-semibold' :
                                  targetRole === 'maintainer' ? 'border-[#666666] text-[#cccccc]' :
                                  'border-[#333333] text-[#888888]'
                                }`}>
                                  {targetRole}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="p-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono ${
                                    target.status === 'online' ? 'text-white' : 'text-[#666666]'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${target.status === 'online' ? 'bg-white' : 'bg-[#444444]'}`} />
                                    {target.status || 'offline'}
                                  </span>

                                  {target.isSuspended && (
                                    <span className="text-[10px] text-white font-bold tracking-tight">
                                      [SUSPENDED]
                                    </span>
                                  )}
                                  {target.isMuted && target.muteUntil && target.muteUntil > Date.now() && (
                                    <span className="text-[10px] text-[#888888]">
                                      [MUTED]
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Downward Actions */}
                              <td className="p-3 text-right">
                                {canManageTarget ? (
                                  <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                    {/* Owner-Only Promotions & Demotions */}
                                    {isOwner && (
                                      <>
                                        {targetRole === 'admin' ? (
                                          <button
                                            onClick={() => handleRoleChange(target, 'member')}
                                            className="px-2 py-1 text-[10px] font-mono border border-[#333333] hover:border-white text-white transition-colors rounded-[2px]"
                                            title="Demote Admin to Member"
                                          >
                                            Demote Admin
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleRoleChange(target, 'admin')}
                                            className="px-2 py-1 text-[10px] font-mono border border-white bg-white text-black hover:bg-black hover:text-white transition-colors rounded-[2px] font-bold"
                                            title="Promote to Admin"
                                          >
                                            Make Admin
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {/* Owner or Admin managing Maintainer */}
                                    {(isOwner || isAdmin) && targetLevel < 3 && (
                                      <>
                                        {targetRole === 'maintainer' ? (
                                          <button
                                            onClick={() => handleRoleChange(target, 'member')}
                                            className="px-2 py-1 text-[10px] font-mono border border-[#333333] hover:border-white text-white transition-colors rounded-[2px]"
                                          >
                                            Remove Maintainer
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleRoleChange(target, 'maintainer')}
                                            className="px-2 py-1 text-[10px] font-mono border border-[#333333] hover:border-white text-white transition-colors rounded-[2px]"
                                          >
                                            Make Maintainer
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {/* Mute Button (Maintainers and above for Members) */}
                                    {targetLevel === 1 && (
                                      <button
                                        onClick={() => handleMuteToggle(target)}
                                        className="px-2 py-1 text-[10px] font-mono border border-[#333333] hover:border-white text-white transition-colors rounded-[2px]"
                                      >
                                        {target.isMuted && target.muteUntil && target.muteUntil > Date.now() ? 'Unmute' : 'Mute'}
                                      </button>
                                    )}

                                    {/* Suspend / Restore Button (Admins and Owner) */}
                                    {(isOwner || isAdmin) && (
                                      <button
                                        onClick={() => handleSuspendToggle(target)}
                                        className="px-2 py-1 text-[10px] font-mono border border-[#333333] hover:border-white text-white transition-colors rounded-[2px]"
                                      >
                                        {target.isSuspended ? 'Restore' : 'Suspend'}
                                      </button>
                                    )}

                                    {/* Delete Account Button */}
                                    {(isOwner || (isAdmin && targetLevel <= 2)) && (
                                      <button
                                        onClick={() => handleRemoveUser(target)}
                                        className="p-1 text-[10px] font-mono border border-[#333333] hover:border-white text-white transition-colors rounded-[2px]"
                                        title="Permanently Delete User Account"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono text-[#555555]">
                                    {isSelf ? 'Own Profile' : 'Protected (Equal/Higher Role)'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-3 font-mono">
                  <div className="p-3 border border-[#222222] bg-[#0a0a0a] rounded-[2px] text-xs text-[#888888]">
                    AUDIT LOG: Immutable record of administrative promotions, suspensions, mutes, and removals.
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#666666]">
                      No audit events recorded yet.
                    </div>
                  ) : (
                    <div className="border border-[#333333] rounded-[2px] overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#111111] text-[#888888] border-b border-[#333333] uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Actor</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Target</th>
                            <th className="p-3">Reason / Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222222] bg-[#000000]">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#0a0a0a] text-[11px]">
                              <td className="p-3 text-[#666666] whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-3 text-white">
                                {log.actorName} <span className="text-[10px] text-[#888888]">({log.actorRole})</span>
                              </td>
                              <td className="p-3">
                                <span className="px-1.5 py-0.5 rounded-[2px] bg-[#1a1a1a] border border-[#333333] text-white uppercase text-[10px]">
                                  {log.action.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-white">
                                {log.targetName}
                              </td>
                              <td className="p-3 text-[#888888]">
                                {log.reason || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-3 font-mono">
                  {reports.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#666666]">
                      No moderation tickets pending review.
                    </div>
                  ) : (
                    reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 border border-[#333333] bg-[#000000] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase">Report #{rep.id.slice(0, 6)}</span>
                            <span className="text-[10px] text-[#666666]">
                              {new Date(rep.createdAt).toLocaleString()}
                            </span>
                            <span className="px-1.5 py-0.2 border border-[#333333] text-[10px] text-white uppercase">
                              {rep.status}
                            </span>
                          </div>
                          <p className="text-[#cccccc]">
                            Reported: <strong className="text-white">{rep.reportedUserName || rep.reportedUser}</strong> by {rep.reportedByName || rep.reportedBy}
                          </p>
                          <p className="text-[#888888] italic bg-[#0a0a0a] p-2 border border-[#222222]">
                            "{rep.reason}"
                          </p>
                        </div>

                        {rep.status === 'pending' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'resolved')}
                              className="px-3 py-1.5 text-xs font-mono btn-mono-primary rounded-[2px]"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'dismissed')}
                              className="px-3 py-1.5 text-xs font-mono btn-mono-secondary rounded-[2px]"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: BROADCASTS */}
              {activeTab === 'broadcasts' && isAdmin && (
                <div className="space-y-6 font-mono">
                  <form onSubmit={handleCreateAnnouncement} className="p-4 border border-[#333333] bg-[#0a0a0a] rounded-[2px] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Publish System Broadcast
                    </h4>

                    {annSuccess && (
                      <p className="text-xs text-white flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Broadcast published successfully.
                      </p>
                    )}

                    <input
                      type="text"
                      required
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Title (e.g. System Performance Maintenance)"
                      className="w-full px-3 py-2 bg-[#000000] border border-[#333333] rounded-[2px] text-xs text-white focus:outline-none focus:border-white"
                    />

                    <textarea
                      rows={3}
                      required
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Message content..."
                      className="w-full px-3 py-2 bg-[#000000] border border-[#333333] rounded-[2px] text-xs text-white focus:outline-none focus:border-white resize-none"
                    />

                    <button
                      type="submit"
                      disabled={submittingAnn}
                      className="px-4 py-2 text-xs font-mono btn-mono-primary rounded-[2px] flex items-center gap-1.5"
                    >
                      {submittingAnn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Broadcast to ChatPro</span>
                    </button>
                  </form>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                      Broadcast Archive
                    </h5>
                    {announcements.length === 0 ? (
                      <p className="text-xs text-[#666666]">No broadcasts recorded.</p>
                    ) : (
                      announcements.map((a) => (
                        <div key={a.id} className="p-3 border border-[#222222] bg-[#000000] rounded-[2px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-white">{a.title}</span>
                            <span className="text-[10px] text-[#666666]">{new Date(a.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-[#888888]">{a.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Monochrome Confirmation Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-fast font-sans">
          <div className="w-full max-w-md bg-[#000000] border border-[#333333] p-6 rounded-[2px] shadow-2xl space-y-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-mono uppercase tracking-tight">
                {confirmModal.title}
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222222]">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-mono btn-mono-secondary rounded-[2px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmLoading}
                onClick={executeConfirmedAction}
                className="px-4 py-2 text-xs font-mono btn-mono-primary rounded-[2px] flex items-center gap-1.5"
              >
                {confirmLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{confirmModal.actionText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
