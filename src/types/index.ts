export type UserRole = 'owner' | 'admin' | 'maintainer' | 'member';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  maintainer: 2,
  member: 1,
};

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  targetUid: string;
  targetName: string;
  action: 
    | 'promote_admin' 
    | 'demote_admin' 
    | 'promote_maintainer' 
    | 'demote_maintainer' 
    | 'suspend' 
    | 'restore' 
    | 'mute' 
    | 'unmute' 
    | 'remove_user' 
    | 'delete_message';
  timestamp: number;
  reason?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string; // unique handle e.g. "alex"
  email: string;
  isAnonymous?: boolean;
  bio?: string;
  photoURL?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string; // ISO string
  createdAt?: string;
  role?: UserRole;
  showOnlineStatus?: boolean;
  readReceipts?: boolean;
  blockedUsers?: string[];
  isSuspended?: boolean;
  isMuted?: boolean;
  muteUntil?: number;
}

export const GLOBAL_CHAT_ID = 'global_chat';

export type ConversationType = 'global' | 'direct' | 'group';

export type GroupMemberRole = 'owner' | 'admin' | 'member';

export interface ConversationParticipant {
  uid: string;
  displayName: string;
  username: string;
  photoURL?: string;
  role?: GroupMemberRole;
}

export interface Conversation {
  id: string; // 'global_chat' or [uidA, uidB].sort().join('_') or group_${timestamp}_${uid}
  type: ConversationType;
  participants: string[]; // array of UIDs (empty for global chat)
  participantData?: Record<string, ConversationParticipant>;
  name?: string; // For group chats or Global Chat
  description?: string;
  photoURL?: string;
  createdBy?: string;
  admins?: string[]; // UIDs of group admins
  lastMessage?: {
    content: string;
    text?: string;
    senderId: string;
    senderName: string;
    timestamp: number;
    createdAt?: number;
    type: MessageType;
  } | null;
  updatedAt: number; // timestamp ms
  createdAt: number;
  unreadCounts?: Record<string, number>; // uid -> count
  pinnedMessageId?: string | null;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface MessageReaction {
  emoji: string;
  uids: string[];
}

export interface ReplyReference {
  messageId: string;
  senderName: string;
  content: string;
  text?: string;
  type: MessageType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  senderPhotoURL?: string;
  type: MessageType;
  text?: string;
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // duration in seconds for voice audio
  createdAt?: number; // timestamp ms
  timestamp: number; // timestamp ms alias
  edited?: boolean;
  editedAt?: number;
  deleted?: boolean;
  deletedFor?: string[]; // UIDs who deleted for themselves
  replyTo?: ReplyReference | null;
  reactions?: Record<string, string[]>; // emoji -> array of uids
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[]; // array of uids
  pinned?: boolean;
}

export interface TypingStatus {
  uid: string;
  displayName: string;
  isTyping: boolean;
  updatedAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: number;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedByName?: string;
  reportedUser: string;
  reportedUserName?: string;
  conversationId?: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: number;
}

export const getPresenceStatus = (user?: { status?: string; lastSeen?: string }): 'online' | 'away' | 'offline' => {
  if (!user) return 'offline';
  if (user.status === 'offline') return 'offline';
  if (user.status === 'away') return 'away';

  if (user.lastSeen) {
    const diffMs = Date.now() - new Date(user.lastSeen).getTime();
    if (diffMs > 15 * 60 * 1000) return 'offline';
    if (diffMs > 2 * 60 * 1000) return 'away';
  }

  return user.status === 'online' ? 'online' : 'offline';
};

export const getPresenceDotClass = (status: 'online' | 'away' | 'offline'): string => {
  switch (status) {
    case 'online': return 'bg-emerald-500';
    case 'away': return 'bg-amber-500';
    case 'offline': return 'bg-slate-400';
  }
};

