import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs, 
  limit, 
  arrayUnion, 
  arrayRemove, 
  increment,
  onSnapshot,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Conversation, 
  UserProfile, 
  Message, 
  MessageType, 
  ReplyReference, 
  Report, 
  Announcement,
  UserRole,
  ROLE_HIERARCHY,
  AuditLog,
  GLOBAL_CHAT_ID
} from '../types';

export const getGlobalChatConversation = (): Conversation => ({
  id: GLOBAL_CHAT_ID,
  type: 'global',
  name: 'Global Chat',
  description: 'Public community room for all verified ChatPro users',
  photoURL: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
  participants: [],
  lastMessage: null,
  updatedAt: Date.now(),
  createdAt: 0,
  unreadCounts: {}
});

export const getDirectConversationId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

export const getOrCreateDirectConversation = async (
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<Conversation> => {
  const convId = getDirectConversationId(currentUser.uid, targetUser.uid);
  const convRef = doc(db, 'conversations', convId);

  try {
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
      const existing = convSnap.data() as Conversation;
      const updatedParticipantData = {
        ...existing.participantData,
        [currentUser.uid]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          username: currentUser.username,
          photoURL: currentUser.photoURL || '',
          role: 'member' as const
        },
        [targetUser.uid]: {
          uid: targetUser.uid,
          displayName: targetUser.displayName,
          username: targetUser.username,
          photoURL: targetUser.photoURL || '',
          role: 'member' as const
        }
      };

      await updateDoc(convRef, {
        participantData: updatedParticipantData
      }).catch(() => {});

      return {
        ...existing,
        participantData: updatedParticipantData
      };
    }

    const newConversation: Conversation = {
      id: convId,
      type: 'direct',
      participants: [currentUser.uid, targetUser.uid],
      participantData: {
        [currentUser.uid]: {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          username: currentUser.username,
          photoURL: currentUser.photoURL || '',
          role: 'member'
        },
        [targetUser.uid]: {
          uid: targetUser.uid,
          displayName: targetUser.displayName,
          username: targetUser.username,
          photoURL: targetUser.photoURL || '',
          role: 'member'
        }
      },
      lastMessage: null,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      unreadCounts: {
        [currentUser.uid]: 0,
        [targetUser.uid]: 0
      },
      pinnedMessageId: null
    };

    await setDoc(convRef, newConversation);
    return newConversation;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${convId}`);
  }
};

export const createGroupConversation = async (
  currentUser: UserProfile,
  name: string,
  description: string,
  photoURL: string,
  members: UserProfile[]
): Promise<Conversation> => {
  const convId = `group_${Date.now()}_${currentUser.uid.slice(0, 6)}`;
  const convRef = doc(db, 'conversations', convId);

  const participants = [currentUser.uid, ...members.map(m => m.uid)];
  const participantData: Record<string, any> = {
    [currentUser.uid]: {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      username: currentUser.username,
      photoURL: currentUser.photoURL || '',
      role: 'owner'
    }
  };

  const unreadCounts: Record<string, number> = {
    [currentUser.uid]: 0
  };

  members.forEach(member => {
    participantData[member.uid] = {
      uid: member.uid,
      displayName: member.displayName,
      username: member.username,
      photoURL: member.photoURL || '',
      role: 'member'
    };
    unreadCounts[member.uid] = 0;
  });

  const groupConv: Conversation = {
    id: convId,
    type: 'group',
    name: name.trim(),
    description: description.trim(),
    photoURL: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
    createdBy: currentUser.uid,
    admins: [currentUser.uid],
    participants,
    participantData,
    lastMessage: null,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    unreadCounts,
    pinnedMessageId: null
  };

  try {
    await setDoc(convRef, groupConv);
    return groupConv;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${convId}`);
  }
};

export const sendMessage = async (
  conversation: Conversation,
  sender: UserProfile,
  content: string,
  type: MessageType = 'text',
  options: {
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    replyTo?: ReplyReference | null;
  } = {}
): Promise<Message> => {
  const convId = conversation.id;
  const isGlobal = convId === GLOBAL_CHAT_ID;
  const now = Date.now();

  // Check if sender has blocked this contact in a 1-on-1 direct conversation
  if (!isGlobal && conversation.type === 'direct') {
    const otherUid = conversation.participants.find(uid => uid !== sender.uid);
    if (otherUid && sender.blockedUsers?.includes(otherUid)) {
      throw new Error('You have blocked this user. Unblock them to send messages.');
    }
  }

  const messagesCol = isGlobal
    ? collection(db, 'globalMessages')
    : collection(db, 'conversations', convId, 'messages');

  const messageRef = doc(messagesCol);

  const message: Message = {
    id: messageRef.id,
    conversationId: convId,
    senderId: sender.uid,
    senderName: sender.displayName,
    senderPhoto: sender.photoURL || '',
    senderPhotoURL: sender.photoURL || '',
    type,
    text: content.trim(),
    content: content.trim(),
    mediaUrl: options.mediaUrl || '',
    fileName: options.fileName || '',
    fileSize: options.fileSize || 0,
    duration: options.duration || 0,
    createdAt: now,
    timestamp: now,
    edited: false,
    deleted: false,
    deletedFor: [],
    replyTo: options.replyTo || null,
    reactions: {},
    status: 'delivered',
    readBy: [sender.uid],
    pinned: false
  };

  try {
    await setDoc(messageRef, message);

    // If not global chat, update conversation document metadata & unread counters
    if (!isGlobal) {
      const convRef = doc(db, 'conversations', convId);
      const updates: Record<string, any> = {
        lastMessage: {
          content: type === 'text' ? content.trim() : `[${type.toUpperCase()}] ${content || options.fileName || ''}`,
          text: type === 'text' ? content.trim() : `[${type.toUpperCase()}] ${content || options.fileName || ''}`,
          senderId: sender.uid,
          senderName: sender.displayName,
          timestamp: now,
          createdAt: now,
          type
        },
        updatedAt: now
      };

      if (conversation.participants && conversation.participants.length > 0) {
        conversation.participants.forEach(uid => {
          if (uid !== sender.uid) {
            updates[`unreadCounts.${uid}`] = increment(1);
          }
        });
      }

      await updateDoc(convRef, updates).catch(async () => {
        // Fallback merge write if doc didn't exist yet
        await setDoc(convRef, {
          id: convId,
          type: conversation.type,
          participants: conversation.participants,
          participantData: conversation.participantData || {},
          createdAt: now,
          ...updates
        }, { merge: true });
      });
    }

    return message;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, isGlobal ? `globalMessages/${messageRef.id}` : `conversations/${convId}/messages/${messageRef.id}`);
  }
};

export const editMessage = async (
  conversationId: string,
  messageId: string,
  newContent: string
): Promise<void> => {
  const isGlobal = conversationId === GLOBAL_CHAT_ID;
  const messageRef = isGlobal
    ? doc(db, 'globalMessages', messageId)
    : doc(db, 'conversations', conversationId, 'messages', messageId);

  try {
    await updateDoc(messageRef, {
      content: newContent.trim(),
      text: newContent.trim(),
      edited: true,
      editedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, isGlobal ? `globalMessages/${messageId}` : `conversations/${conversationId}/messages/${messageId}`);
  }
};

export const deleteMessage = async (
  conversationId: string,
  messageId: string,
  forEveryone: boolean,
  currentUid: string
): Promise<void> => {
  const isGlobal = conversationId === GLOBAL_CHAT_ID;
  const messageRef = isGlobal
    ? doc(db, 'globalMessages', messageId)
    : doc(db, 'conversations', conversationId, 'messages', messageId);

  try {
    if (forEveryone) {
      await updateDoc(messageRef, {
        deleted: true,
        content: 'This message was deleted',
        text: 'This message was deleted'
      });
    } else {
      await updateDoc(messageRef, {
        deletedFor: arrayUnion(currentUid)
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, isGlobal ? `globalMessages/${messageId}` : `conversations/${conversationId}/messages/${messageId}`);
  }
};

export const reactToMessage = async (
  conversationId: string,
  messageId: string,
  emoji: string,
  currentUid: string,
  existingReactions?: Record<string, string[]>
): Promise<void> => {
  const isGlobal = conversationId === GLOBAL_CHAT_ID;
  const messageRef = isGlobal
    ? doc(db, 'globalMessages', messageId)
    : doc(db, 'conversations', conversationId, 'messages', messageId);

  const currentList = existingReactions?.[emoji] || [];
  const hasReacted = currentList.includes(currentUid);

  try {
    if (hasReacted) {
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayRemove(currentUid)
      });
    } else {
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(currentUid)
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, isGlobal ? `globalMessages/${messageId}` : `conversations/${conversationId}/messages/${messageId}`);
  }
};

export const togglePinMessage = async (
  conversationId: string,
  messageId: string,
  currentlyPinned: boolean
): Promise<void> => {
  const isGlobal = conversationId === GLOBAL_CHAT_ID;
  const messageRef = isGlobal
    ? doc(db, 'globalMessages', messageId)
    : doc(db, 'conversations', conversationId, 'messages', messageId);

  try {
    await updateDoc(messageRef, {
      pinned: !currentlyPinned
    });

    if (!isGlobal) {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        pinnedMessageId: currentlyPinned ? null : messageId
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, isGlobal ? `globalMessages/${messageId}` : `conversations/${conversationId}`);
  }
};

export const updateTypingStatus = async (
  conversationId: string,
  uid: string,
  displayName: string,
  isTyping: boolean
): Promise<void> => {
  const isGlobal = conversationId === GLOBAL_CHAT_ID;
  const typingRef = isGlobal
    ? doc(db, 'globalTyping', uid)
    : doc(db, 'conversations', conversationId, 'typing', uid);

  try {
    await setDoc(typingRef, {
      uid,
      displayName,
      isTyping,
      updatedAt: Date.now()
    }, { merge: true });
  } catch {
    // Non-critical, ignore typing errors
  }
};

export const markConversationRead = async (
  conversationId: string,
  currentUid: string
): Promise<void> => {
  if (conversationId === GLOBAL_CHAT_ID) return;
  const convRef = doc(db, 'conversations', conversationId);
  try {
    await updateDoc(convRef, {
      [`unreadCounts.${currentUid}`]: 0
    });

    // Mark recent unread messages in conversation as read
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const unreadSnap = await getDocs(
      query(messagesCol, orderBy('createdAt', 'desc'), limit(25))
    );
    
    const updatePromises: Promise<any>[] = [];
    unreadSnap.forEach((mDoc) => {
      const data = mDoc.data() as Message;
      if (data.senderId !== currentUid && (!data.readBy || !data.readBy.includes(currentUid))) {
        updatePromises.push(
          updateDoc(mDoc.ref, {
            status: 'read',
            readBy: arrayUnion(currentUid)
          }).catch(() => {})
        );
      }
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
  } catch {
    // Non-critical
  }
};

export const blockUser = async (currentUid: string, targetUid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', currentUid);
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(targetUid)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${currentUid}`);
  }
};

export const unblockUser = async (currentUid: string, targetUid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', currentUid);
    await updateDoc(userRef, {
      blockedUsers: arrayRemove(targetUid)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${currentUid}`);
  }
};

export const searchRegisteredUsers = async (
  queryText: string,
  currentUid: string
): Promise<UserProfile[]> => {
  try {
    const qTrim = queryText.trim().toLowerCase();
    const usersCol = collection(db, 'users');
    const snap = await getDocs(query(usersCol, limit(50)));
    
    const results: UserProfile[] = [];
    snap.forEach((docSnap) => {
      const u = docSnap.data() as UserProfile;
      if (u.uid !== currentUid) {
        if (!qTrim) {
          results.push(u);
        } else if (
          u.username?.toLowerCase().includes(qTrim) ||
          u.displayName?.toLowerCase().includes(qTrim) ||
          u.email?.toLowerCase().includes(qTrim)
        ) {
          results.push(u);
        }
      }
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
};

export const subscribeToAllRegisteredUsers = (
  currentUid: string,
  callback: (users: UserProfile[]) => void
): Unsubscribe => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const u = docSnap.data() as UserProfile;
        if (u.uid !== currentUid) {
          list.push(u);
        }
      });
      callback(list);
    },
    (err) => {
      console.error('Error listening to registered users:', err);
      callback([]);
    }
  );
};

export const uploadMediaFile = async (
  file: File | Blob,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds the 15MB size limit.');
  }

  if (onProgress) onProgress(25);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file data.'));
    };
    reader.readAsDataURL(file);
  });
};

export const submitReport = async (
  reportedBy: string,
  reportedByName: string,
  reportedUser: string,
  reportedUserName: string,
  reason: string,
  conversationId?: string
): Promise<void> => {
  const reportsCol = collection(db, 'reports');
  const reportRef = doc(reportsCol);
  const report: Report = {
    id: reportRef.id,
    reportedBy,
    reportedByName,
    reportedUser,
    reportedUserName,
    conversationId,
    reason: reason.trim(),
    status: 'pending',
    createdAt: Date.now()
  };

  try {
    await setDoc(reportRef, report);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reports/${reportRef.id}`);
  }
};

export const createAnnouncement = async (
  title: string,
  content: string,
  createdBy: string
): Promise<void> => {
  const announcementsCol = collection(db, 'announcements');
  const annRef = doc(announcementsCol);
  const ann: Announcement = {
    id: annRef.id,
    title: title.trim(),
    content: content.trim(),
    createdBy,
    createdAt: Date.now()
  };

  try {
    await setDoc(annRef, ann);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `announcements/${annRef.id}`);
  }
};

export const logAuditEvent = async (
  actor: UserProfile,
  targetUser: UserProfile,
  action: AuditLog['action'],
  reason?: string
): Promise<void> => {
  try {
    const logsCol = collection(db, 'auditLogs');
    const logRef = doc(logsCol);
    const log: AuditLog = {
      id: logRef.id,
      actorUid: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role || 'member',
      targetUid: targetUser.uid,
      targetName: targetUser.displayName,
      action,
      timestamp: Date.now(),
      reason: reason || ''
    };
    await setDoc(logRef, log);
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
};

export const changeUserRole = async (
  actor: UserProfile,
  target: UserProfile,
  newRole: UserRole,
  reason?: string
): Promise<void> => {
  const actorLevel = ROLE_HIERARCHY[actor.role || 'member'] || 1;
  const targetLevel = ROLE_HIERARCHY[target.role || 'member'] || 1;
  const newRoleLevel = ROLE_HIERARCHY[newRole] || 1;

  if (actorLevel <= targetLevel) {
    throw new Error('Permission denied: You cannot modify a user with equal or higher authority.');
  }

  if (actorLevel <= newRoleLevel) {
    throw new Error('Permission denied: You cannot grant a role equal to or higher than your own.');
  }

  // Only Owner can promote to Admin or demote an Admin
  if (newRole === 'admin' && actor.role !== 'owner') {
    throw new Error('Only the Owner can promote a user to Admin.');
  }
  if (target.role === 'admin' && actor.role !== 'owner') {
    throw new Error('Only the Owner can demote or remove an Admin.');
  }

  const userRef = doc(db, 'users', target.uid);
  try {
    await updateDoc(userRef, { role: newRole });
    const actionName: AuditLog['action'] = 
      newRole === 'admin' ? 'promote_admin' :
      newRole === 'maintainer' ? 'promote_maintainer' :
      target.role === 'admin' ? 'demote_admin' : 'demote_maintainer';
    await logAuditEvent(actor, target, actionName, reason);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${target.uid}`);
  }
};

export const suspendUser = async (
  actor: UserProfile,
  target: UserProfile,
  reason?: string
): Promise<void> => {
  const actorLevel = ROLE_HIERARCHY[actor.role || 'member'] || 1;
  const targetLevel = ROLE_HIERARCHY[target.role || 'member'] || 1;

  if (actorLevel <= targetLevel) {
    throw new Error('Permission denied: You cannot suspend a user with equal or higher authority.');
  }

  const userRef = doc(db, 'users', target.uid);
  try {
    await updateDoc(userRef, { isSuspended: true });
    await logAuditEvent(actor, target, 'suspend', reason);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${target.uid}`);
  }
};

export const restoreUser = async (
  actor: UserProfile,
  target: UserProfile,
  reason?: string
): Promise<void> => {
  const actorLevel = ROLE_HIERARCHY[actor.role || 'member'] || 1;
  const targetLevel = ROLE_HIERARCHY[target.role || 'member'] || 1;

  if (actorLevel <= targetLevel) {
    throw new Error('Permission denied: You cannot restore a user with equal or higher authority.');
  }

  const userRef = doc(db, 'users', target.uid);
  try {
    await updateDoc(userRef, { isSuspended: false });
    await logAuditEvent(actor, target, 'restore', reason);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${target.uid}`);
  }
};

export const muteUser = async (
  actor: UserProfile,
  target: UserProfile,
  durationMinutes: number = 60,
  reason?: string
): Promise<void> => {
  const actorLevel = ROLE_HIERARCHY[actor.role || 'member'] || 1;
  const targetLevel = ROLE_HIERARCHY[target.role || 'member'] || 1;

  if (actorLevel <= targetLevel || actorLevel < 2) {
    throw new Error('Permission denied: You cannot mute this user.');
  }

  const userRef = doc(db, 'users', target.uid);
  try {
    await updateDoc(userRef, {
      isMuted: true,
      muteUntil: Date.now() + (durationMinutes * 60 * 1000)
    });
    await logAuditEvent(actor, target, 'mute', reason || `${durationMinutes}m mute`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${target.uid}`);
  }
};

export const unmuteUser = async (
  actor: UserProfile,
  target: UserProfile
): Promise<void> => {
  const actorLevel = ROLE_HIERARCHY[actor.role || 'member'] || 1;
  const targetLevel = ROLE_HIERARCHY[target.role || 'member'] || 1;

  if (actorLevel <= targetLevel || actorLevel < 2) {
    throw new Error('Permission denied: You cannot unmute this user.');
  }

  const userRef = doc(db, 'users', target.uid);
  try {
    await updateDoc(userRef, {
      isMuted: false,
      muteUntil: 0
    });
    await logAuditEvent(actor, target, 'unmute');
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${target.uid}`);
  }
};

export const removeUserAccount = async (
  actor: UserProfile,
  target: UserProfile,
  reason?: string
): Promise<void> => {
  const actorLevel = ROLE_HIERARCHY[actor.role || 'member'] || 1;
  const targetLevel = ROLE_HIERARCHY[target.role || 'member'] || 1;

  if (actorLevel <= targetLevel) {
    throw new Error('Permission denied: You cannot remove a user with equal or higher authority.');
  }

  // Only Owner can remove an Admin
  if (target.role === 'admin' && actor.role !== 'owner') {
    throw new Error('Only the Owner can remove an Admin account.');
  }

  const userRef = doc(db, 'users', target.uid);
  try {
    await deleteDoc(userRef);
    await logAuditEvent(actor, target, 'remove_user', reason);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${target.uid}`);
  }
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const logsCol = collection(db, 'auditLogs');
    const q = query(logsCol, orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list: AuditLog[] = [];
    snap.forEach(d => list.push(d.data() as AuditLog));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs');
  }
};

