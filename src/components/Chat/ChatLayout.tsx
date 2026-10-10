import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Users, 
  Settings as SettingsIcon, 
  Shield, 
  LogOut, 
  Send, 
  Paperclip, 
  Mic, 
  Smile, 
  Globe, 
  Info, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Clock, 
  Pin, 
  CornerDownRight, 
  Edit3, 
  Trash2, 
  X, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  AlertCircle, 
  Loader2, 
  Flag, 
  Wifi, 
  WifiOff,
  Sparkles,
  ChevronRight,
  Phone,
  Video,
  PhoneOff,
  MicOff,
  Camera,
  CameraOff,
  Image as ImageIcon,
  Sun,
  Moon,
  Share2,
  Copy
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  limit,
  limitToLast
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Conversation, 
  Message, 
  UserProfile, 
  MessageType, 
  ReplyReference,
  GLOBAL_CHAT_ID,
  getPresenceStatus,
  getPresenceDotClass
} from '../../types';
import { 
  getGlobalChatConversation,
  sendMessage, 
  editMessage, 
  deleteMessage, 
  reactToMessage, 
  togglePinMessage, 
  updateTypingStatus, 
  markConversationRead, 
  uploadMediaFile,
  submitReport,
  getOrCreateDirectConversation,
  blockUser,
  unblockUser,
  deleteConversation
} from '../../services/chatService';
import { VoiceRecorder } from './VoiceRecorder';
import { MediaViewerModal } from './MediaViewerModal';
import { CreateGroupModal } from './CreateGroupModal';
import { ContactsModal } from '../Contacts/ContactsModal';
import { SettingsModal } from '../Settings/SettingsModal';
import { AdminPanelModal } from '../Admin/AdminPanelModal';

const ConversationSkeleton = () => (
  <div className="p-3 flex items-start gap-3 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
    </div>
  </div>
);

const MessageSkeleton = () => (
  <div className="space-y-4 py-4 animate-pulse px-2">
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 w-48 h-12 rounded-bl-xs" />
    </div>
    <div className="flex items-start justify-end gap-3">
      <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 w-64 h-16 rounded-br-xs" />
    </div>
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 w-36 h-10 rounded-bl-xs" />
    </div>
  </div>
);

export const ChatLayout: React.FC = () => {
  const { currentUser, userProfile, isOwner, isAdmin, isMaintainer, isOnline } = useAuth();
  const { theme, toggleTheme, wallpaper } = useTheme();

  // Active conversation defaults to Global Chat
  const [activeConversation, setActiveConversation] = useState<Conversation>(getGlobalChatConversation());
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Global chat latest message preview
  const [globalLastMessage, setGlobalLastMessage] = useState<Message | null>(null);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}); // uid -> displayName
  
  // Modals
  const [showContacts, setShowContacts] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [searchQueryInChat, setSearchQueryInChat] = useState('');

  // Media preview modal
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: 'image' | 'video'; fileName: string } | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [isDeletingConv, setIsDeletingConv] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  // Message composer states
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyReference | null>(null);
  const [editingMessageState, setEditingMessageState] = useState<Message | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);

  // Other participant profile for 1-on-1 (real-time presence)
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);

  // Filters & Sidebar search
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [conversationFilter, setConversationFilter] = useState<'all' | 'direct' | 'group' | 'unread'>('all');

  // Report modal
  const [reportingUser, setReportingUser] = useState<{ uid: string; name: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Forwarding message state
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

  const handleForwardMessage = async (targetConv: Conversation) => {
    if (!forwardingMessage || !userProfile) return;
    try {
      await sendMessage(
        targetConv,
        userProfile,
        forwardingMessage.text || forwardingMessage.content || 'Forwarded message',
        forwardingMessage.type || 'text',
        {
          mediaUrl: forwardingMessage.mediaUrl,
          fileName: forwardingMessage.fileName,
          fileSize: forwardingMessage.fileSize,
          duration: forwardingMessage.duration
        }
      );
      setForwardingMessage(null);
    } catch (err) {
      console.error('Failed to forward message:', err);
    }
  };

  // Call feature state
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    partnerName: string;
    partnerAvatar: string;
    startTime: number;
  } | null>(null);
  const [callMuted, setCallMuted] = useState(false);
  const [callVideoOff, setCallVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (activeCall) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const formatCallDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async (type: 'audio' | 'video') => {
    setActiveCall({ type, partnerName: activeInfo.title, partnerAvatar: activeInfo.avatar || userProfile?.photoURL || '', startTime: Date.now() });
    if (userProfile && activeConversation.id !== GLOBAL_CHAT_ID) {
      try {
        await sendMessage(activeConversation, userProfile, `Started a ${type} call 📞`, 'text');
      } catch (err) {
        console.error('Failed to broadcast call signal:', err);
      }
    }
  };

  const playNotificationChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context restricted or unsupported
    }
  };

  const lastMessageCountRef = useRef<number>(0);
  const prevConvIdRef = useRef<string>(activeConversation.id);

  // Draft system: save draft on switch and load draft on conversation change
  useEffect(() => {
    const prevId = prevConvIdRef.current;
    const currId = activeConversation.id;

    if (prevId !== currId) {
      if (prevId) {
        if (inputText.trim()) {
          localStorage.setItem(`chat_draft_${prevId}`, inputText);
        } else {
          localStorage.removeItem(`chat_draft_${prevId}`);
        }
      }

      const savedDraft = localStorage.getItem(`chat_draft_${currId}`) || '';
      setInputText(savedDraft);
      setReplyingTo(null);

      prevConvIdRef.current = currId;
    }
  }, [activeConversation.id]);

  // Save draft on input change
  useEffect(() => {
    if (activeConversation.id) {
      if (inputText.trim()) {
        localStorage.setItem(`chat_draft_${activeConversation.id}`, inputText);
      } else {
        localStorage.removeItem(`chat_draft_${activeConversation.id}`);
      }
    }
  }, [inputText, activeConversation.id]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const lastSendTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<any>(null);
  const lastGlobalMsgIdRef = useRef<string | null>(null);
  const convUpdatedAtMapRef = useRef<Record<string, number>>({});

  const handleTouchStart = (msgId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setShowEmojiPicker(prev => (prev === msgId ? null : msgId));
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  // 1. Listen to latest message in Global Chat for sidebar preview & notification sound
  useEffect(() => {
    const q = query(
      collection(db, 'globalMessages'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const msg = docSnap.data() as Message;
        setGlobalLastMessage(msg);

        if (
          lastGlobalMsgIdRef.current &&
          lastGlobalMsgIdRef.current !== docSnap.id &&
          currentUser &&
          msg.senderId !== currentUser.uid &&
          (document.visibilityState === 'hidden' || !document.hasFocus() || activeConversation.id !== GLOBAL_CHAT_ID)
        ) {
          playNotificationChime();
        }
        lastGlobalMsgIdRef.current = docSnap.id;
      } else {
        if (!lastGlobalMsgIdRef.current && !snapshot.empty) {
          lastGlobalMsgIdRef.current = snapshot.docs[0].id;
        }
      }
    }, () => {});

    return () => unsubscribe();
  }, [currentUser, activeConversation.id]);

  // 2. Listen to all private & group conversations for current user & notification sound
  useEffect(() => {
    if (!currentUser) return;

    setLoadingConversations(true);
    const convsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(convsQuery, (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const conv = docSnap.data() as Conversation;
        list.push(conv);

        const prevUpdatedAt = convUpdatedAtMapRef.current[conv.id] || 0;
        if (
          prevUpdatedAt > 0 &&
          conv.updatedAt &&
          conv.updatedAt > prevUpdatedAt &&
          conv.lastMessage?.senderId &&
          conv.lastMessage.senderId !== currentUser.uid &&
          (document.visibilityState === 'hidden' || !document.hasFocus() || activeConversation.id !== conv.id)
        ) {
          playNotificationChime();
        }
        if (conv.updatedAt) {
          convUpdatedAtMapRef.current[conv.id] = conv.updatedAt;
        }
      });
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setConversations(list);
      setLoadingConversations(false);

      // Keep activeConversation updated if viewing a private/group chat
      setActiveConversation((prev) => {
        if (!prev || prev.id === GLOBAL_CHAT_ID) return prev;
        const updated = list.find((c) => c.id === prev.id);
        return updated || prev;
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUser, activeConversation.id]);

  // 3. Listen to messages and typing indicator when activeConversation changes
  useEffect(() => {
    if (!currentUser) return;

    setLoadingMessages(true);
    setSendError(null);
    const isGlobal = activeConversation.id === GLOBAL_CHAT_ID;

    // Mark private conversation as read
    if (!isGlobal) {
      markConversationRead(activeConversation.id, currentUser.uid);
    }

    // Set up messages query
    const messagesQuery = isGlobal
      ? query(collection(db, 'globalMessages'), orderBy('createdAt', 'asc'), limitToLast(100))
      : query(collection(db, 'conversations', activeConversation.id, 'messages'), orderBy('createdAt', 'asc'), limitToLast(100));

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((docSnap) => {
        const m = docSnap.data() as Message;
        if (!m.deletedFor?.includes(currentUser.uid)) {
          // Normalize text/content and timestamp/createdAt
          msgList.push({
            ...m,
            text: m.text || m.content || '',
            content: m.content || m.text || '',
            createdAt: m.createdAt || m.timestamp || Date.now(),
            timestamp: m.timestamp || m.createdAt || Date.now()
          });
        }
      });
      setMessages(msgList);
      setLoadingMessages(false);

      if (!isGlobal && currentUser) {
        const hasUnread = msgList.some(
          m => m.senderId !== currentUser.uid && (!m.readBy || !m.readBy.includes(currentUser.uid))
        );
        if (hasUnread) {
          markConversationRead(activeConversation.id, currentUser.uid).catch(() => {});
        }
      }

      if (
        msgList.length > lastMessageCountRef.current &&
        lastMessageCountRef.current > 0 &&
        (document.visibilityState === 'hidden' || !document.hasFocus())
      ) {
        const latest = msgList[msgList.length - 1];
        if (latest && latest.senderId !== currentUser.uid) {
          playNotificationChime();
        }
      }
      lastMessageCountRef.current = msgList.length;
    }, (error) => {
      console.error('Error listening to messages:', error);
      setLoadingMessages(false);
    });

    // Set up typing query
    const typingCol = isGlobal
      ? collection(db, 'globalTyping')
      : collection(db, 'conversations', activeConversation.id, 'typing');

    const unsubscribeTyping = onSnapshot(typingCol, (snapshot) => {
      const typingMap: Record<string, string> = {};
      const now = Date.now();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.uid !== currentUser.uid && data.isTyping && (now - (data.updatedAt || 0)) < 6000) {
          typingMap[data.uid] = data.displayName || 'Someone';
        }
      });
      setTypingUsers(typingMap);
    }, () => {});

    // For 1-on-1 direct conversation, listen to other user's presence
    let unsubscribeOtherUser: (() => void) | null = null;
    if (!isGlobal && activeConversation.type === 'direct') {
      const otherUid = activeConversation.participants.find((p) => p !== currentUser.uid);
      if (otherUid) {
        unsubscribeOtherUser = onSnapshot(doc(db, 'users', otherUid), (snap) => {
          if (snap.exists()) {
            setOtherUserProfile(snap.data() as UserProfile);
          }
        });
      }
    } else {
      setOtherUserProfile(null);
    }

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      if (unsubscribeOtherUser) unsubscribeOtherUser();
      // Clear own typing status
      updateTypingStatus(activeConversation.id, currentUser.uid, userProfile?.displayName || '', false);
    };
  }, [activeConversation.id, currentUser?.uid]);

  // Scroll to bottom on message updates only if near bottom or sent by current user
  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      const lastMsg = messages[messages.length - 1];
      const isMyMessage = lastMsg && lastMsg.senderId === currentUser?.uid;
      
      if (isNearBottom || isMyMessage) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentUser?.uid]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (!currentUser || !userProfile) return;

    updateTypingStatus(activeConversation.id, currentUser.uid, userProfile.displayName, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (currentUser && userProfile) {
        updateTypingStatus(activeConversation.id, currentUser.uid, userProfile.displayName, false);
      }
    }, 2500);
  };

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !userProfile || sendingMessage) return;

    // Rate limiting & character cap protection
    const now = Date.now();
    if (now - lastSendTimeRef.current < 350) return;
    lastSendTimeRef.current = now;

    if (userProfile.isSuspended) {
      setSendError('Your account has been suspended by an administrator.');
      return;
    }

    if (userProfile.isMuted && userProfile.muteUntil && userProfile.muteUntil > now) {
      const remainingMinutes = Math.ceil((userProfile.muteUntil - now) / (1000 * 60));
      setSendError(`You are muted from sending messages for another ${remainingMinutes} minute(s).`);
      return;
    }

    if (inputText.trim().length > 500000) {
      setSendError('Message exceeds 500,000 characters.');
      return;
    }

    setSendError(null);

    // If editing existing message
    if (editingMessageState) {
      try {
        setSendingMessage(true);
        await editMessage(activeConversation.id, editingMessageState.id, inputText.trim());
        setEditingMessageState(null);
        setInputText('');
        localStorage.removeItem(`chat_draft_${activeConversation.id}`);
      } catch (err: any) {
        setSendError(err.message || 'Failed to edit message.');
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    localStorage.removeItem(`chat_draft_${activeConversation.id}`);
    const reply = replyingTo;
    setReplyingTo(null);

    // Clear typing indicator
    updateTypingStatus(activeConversation.id, userProfile.uid, userProfile.displayName, false);

    try {
      setSendingMessage(true);
      await sendMessage(activeConversation, userProfile, textToSend, 'text', {
        replyTo: reply
      });
    } catch (err: any) {
      console.error('Send error:', err);
      setSendError('Message failed to send. Please verify your connection.');
      setInputText(textToSend); // Restore unsent text
    } finally {
      setSendingMessage(false);
    }
  };

  // Send voice note
  const handleSendVoiceNote = async (blob: Blob, durationSeconds: number) => {
    if (!userProfile) return;
    setShowVoiceRecorder(false);
    setUploadingProgress(10);
    setSendError(null);

    try {
      const fileName = `voice_${Date.now()}.webm`;
      const url = await uploadMediaFile(blob, fileName, (progress) => {
        setUploadingProgress(progress);
      });

      await sendMessage(activeConversation, userProfile, 'Voice message', 'audio', {
        mediaUrl: url,
        duration: durationSeconds,
        fileName: 'Voice note'
      });
    } catch (err: any) {
      setSendError('Voice upload failed.');
    } finally {
      setUploadingProgress(null);
    }
  };

  // Send file/image/video attachment
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    let type: MessageType = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    setUploadingProgress(10);
    setSendError(null);

    try {
      const url = await uploadMediaFile(file, file.name, (progress) => {
        setUploadingProgress(progress);
      });

      await sendMessage(activeConversation, userProfile, file.name, type, {
        mediaUrl: url,
        fileName: file.name,
        fileSize: file.size
      });
    } catch (err: any) {
      setSendError('File upload failed.');
    } finally {
      setUploadingProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    setUploadingProgress(10);
    setSendError(null);

    try {
      const url = await uploadMediaFile(file, `camera_${Date.now()}.jpg`, (progress) => {
        setUploadingProgress(progress);
      });

      await sendMessage(activeConversation, userProfile, 'Camera photo', 'image', {
        mediaUrl: url,
        fileName: `Photo_${new Date().toLocaleTimeString()}.jpg`,
        fileSize: file.size
      });
    } catch (err: any) {
      setSendError('Camera capture upload failed.');
    } finally {
      setUploadingProgress(null);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Reactions
  const handleReact = async (message: Message, emoji: string) => {
    if (!currentUser) return;
    setShowEmojiPicker(null);
    try {
      await reactToMessage(activeConversation.id, message.id, emoji, currentUser.uid, message.reactions);
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Pin message
  const handleTogglePin = async (message: Message) => {
    try {
      await togglePinMessage(activeConversation.id, message.id, !!message.pinned);
    } catch (err) {
      console.error('Failed to pin message:', err);
    }
  };

  // Delete message
  const handleDelete = async (message: Message, forEveryone: boolean) => {
    if (!currentUser) return;
    const canModerateDelete = isOwner || isAdmin || isMaintainer;
    try {
      await deleteMessage(activeConversation.id, message.id, forEveryone || canModerateDelete, currentUser.uid);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Report user
  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingUser || !userProfile || !reportReason.trim()) return;
    setSubmittingReport(true);
    try {
      await submitReport(
        userProfile.uid,
        userProfile.displayName,
        reportingUser.uid,
        reportingUser.name,
        reportReason.trim(),
        activeConversation.id
      );
      setReportingUser(null);
      setReportReason('');
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Filter conversations in sidebar
  const filteredConversations = conversations.filter((c) => {
    if (conversationFilter === 'direct' && c.type !== 'direct') return false;
    if (conversationFilter === 'group' && c.type !== 'group') return false;
    if (conversationFilter === 'unread' && (!c.unreadCounts?.[currentUser?.uid || ''] || c.unreadCounts[currentUser?.uid || ''] <= 0)) return false;

    if (sidebarSearch.trim()) {
      const q = sidebarSearch.toLowerCase();
      if (c.type === 'group') {
        return c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      } else {
        const otherParticipant = Object.values(c.participantData || {}).find(p => p.uid !== currentUser?.uid);
        return (
          otherParticipant?.displayName?.toLowerCase().includes(q) ||
          otherParticipant?.username?.toLowerCase().includes(q)
        );
      }
    }
    return true;
  });

  // Filter messages in chat search
  const displayedMessages = searchQueryInChat.trim()
    ? messages.filter((m) => (m.text || m.content).toLowerCase().includes(searchQueryInChat.toLowerCase()))
    : messages;

  const wallpaperClasses: Record<string, string> = {
    default: 'bg-slate-50/60 dark:bg-slate-950/60',
    midnight: 'bg-slate-900 dark:bg-[#070d19]',
    emerald: 'bg-emerald-950/20 dark:bg-[#04140d]',
    cyber: 'bg-purple-950/20 dark:bg-[#11071d]',
    warm: 'bg-amber-950/20 dark:bg-[#180e04]',
    obsidian: 'bg-neutral-950',
    carbon: 'bg-zinc-950',
    aurora: 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-950',
  };

  const getConversationInfo = (conv: Conversation) => {
    if (conv.id === GLOBAL_CHAT_ID) {
      return {
        title: 'Global Chat',
        subtitle: 'Public room • All members',
        avatar: '',
        presenceStatus: 'online' as const,
        lastSeen: ''
      };
    }
    if (conv.type === 'group') {
      return {
        title: conv.name || 'Group Chat',
        subtitle: `${conv.participants.length} members`,
        avatar: conv.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${conv.name}`,
        presenceStatus: 'offline' as const,
        lastSeen: ''
      };
    }

    const otherParticipant = Object.values(conv.participantData || {}).find(p => p.uid !== currentUser?.uid);
    const targetUser = otherUserProfile && otherUserProfile.uid === otherParticipant?.uid ? otherUserProfile : null;
    const presenceStatus = getPresenceStatus(targetUser || { lastSeen: '', status: 'offline' });

    return {
      title: otherParticipant?.displayName || 'User',
      subtitle: presenceStatus === 'online' ? 'Online' : presenceStatus === 'away' ? 'Away' : 'Offline',
      avatar: otherParticipant?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.username || 'avatar'}`,
      presenceStatus,
      lastSeen: targetUser?.lastSeen || ''
    };
  };

  const activeInfo = getConversationInfo(activeConversation);
  const pinnedMessage = messages.find((m) => m.id === activeConversation.pinnedMessageId || m.pinned);

  const directPartner = activeConversation.type === 'direct'
    ? Object.values(activeConversation.participantData || {}).find(p => p.uid !== currentUser?.uid)
    : null;
  const isDirectPartnerBlocked = !!(directPartner && userProfile?.blockedUsers?.includes(directPartner.uid));

  const formatMessageTime = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const renderMessageTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 break-all font-medium text-inherit"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-full flex overflow-hidden bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Network offline banner */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500 text-slate-950 px-4 py-1 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline mode. Reconnecting to Firebase...</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR: Conversations List                           */}
      {/* ------------------------------------------------------------- */}
      <aside className={`w-full md:w-80 lg:w-88 flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-[#F8F9FA] dark:bg-slate-900/90 backdrop-blur-md shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid}`}
                alt={userProfile?.displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-indigo-500/40 transition-all"
                onClick={() => setShowSettings(true)}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[130px]">
                {userProfile?.displayName || 'My Profile'}
              </h2>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                @{userProfile?.username || 'user'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {(isOwner || isAdmin || isMaintainer) && (
              <button
                onClick={() => setShowAdmin(true)}
                title="Roles & Moderation Console"
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowContacts(true)}
              title="Find real users"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              title="Create new group"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="Settings"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter pills */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/60 border border-transparent focus:border-indigo-500/50 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <button
              onClick={() => setConversationFilter('all')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${conversationFilter === 'all' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              All
            </button>
            <button
              onClick={() => setConversationFilter('direct')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${conversationFilter === 'direct' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              DMs
            </button>
            <button
              onClick={() => setConversationFilter('group')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${conversationFilter === 'group' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Groups
            </button>
            <button
              onClick={() => setConversationFilter('unread')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${conversationFilter === 'unread' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-800/40">
          
          {/* ALWAYS PINNED AT THE TOP: GLOBAL CHAT */}
          <div
            onClick={() => { setActiveConversation(getGlobalChatConversation()); setMobileView('chat'); }}
            className={`mx-2 my-1.5 p-3.5 flex items-center gap-3.5 cursor-pointer transition-all rounded-2xl border ${
              activeConversation.id === GLOBAL_CHAT_ID 
                ? 'bg-indigo-600/15 border-indigo-500/30 shadow-sm ring-1 ring-indigo-500/20 text-white' 
                : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/40 dark:border-indigo-900/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <Globe className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Global Chat
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 uppercase tracking-wider">
                    Public
                  </span>
                </div>
                {globalLastMessage && (
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatMessageTime(globalLastMessage.createdAt)}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {globalLastMessage ? (
                  <>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {globalLastMessage.senderId === currentUser?.uid ? 'You' : globalLastMessage.senderName}:
                    </span>{' '}
                    {globalLastMessage.text || globalLastMessage.content}
                  </>
                ) : (
                  <span className="italic text-slate-400">Open community chat room</span>
                )}
              </p>
            </div>
          </div>

          {/* User's DMs & Group Chats */}
          {loadingConversations ? (
            <div className="py-2 space-y-1">
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {sidebarSearch ? 'No private chats found' : 'No 1-on-1 chats yet'}
              </p>
              <button
                onClick={() => setShowContacts(true)}
                className="mt-2.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                Find Real Users to Message
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const info = getConversationInfo(conv);
              const isSelected = activeConversation.id === conv.id;
              const unread = conv.unreadCounts?.[currentUser?.uid || ''] || 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => { setActiveConversation(conv); setMobileView('chat'); }}
                  className={`mx-2 my-1.5 p-3.5 flex items-center gap-3.5 cursor-pointer transition-all rounded-2xl group relative ${
                    isSelected 
                      ? 'bg-indigo-600/15 border border-indigo-500/30 shadow-sm ring-1 ring-indigo-500/20 text-white' 
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={info.avatar}
                      alt={info.title}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    {conv.type === 'direct' && (
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        getPresenceDotClass(info.presenceStatus)
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {info.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatMessageTime(conv.lastMessage.createdAt || conv.lastMessage.timestamp)}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conv);
                          }}
                          title="Delete Conversation"
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-2">
                        {conv.lastMessage ? (
                          <>
                            {conv.lastMessage.senderId === currentUser?.uid && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-medium">You: </span>
                            )}
                            {conv.lastMessage.text || conv.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic text-slate-400">Conversation started</span>
                        )}
                      </p>

                      {unread > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. CENTER AREA: Active Conversation View                      */}
      {/* ------------------------------------------------------------- */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 ${mobileView === 'sidebar' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Chat Top Header */}
        <div className="h-14 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 z-10">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Back button on mobile */}
            <button
              onClick={() => setMobileView('sidebar')}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div 
              className="relative shrink-0 cursor-pointer" 
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              {activeConversation.id === GLOBAL_CHAT_ID ? (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
              ) : (
                <img
                  src={activeInfo.avatar}
                  alt={activeInfo.title}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              )}
              {activeConversation.type === 'direct' && (
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  getPresenceDotClass(activeInfo.presenceStatus)
                }`} />
              )}
            </div>

            <div 
              className="min-w-0 cursor-pointer" 
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeInfo.title}
                </h3>
                {activeConversation.id === GLOBAL_CHAT_ID && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Live Room
                  </span>
                )}
              </div>
              
              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                {Object.keys(typingUsers).length > 0 ? (
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <span>{Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing...</span>
                  </div>
                ) : activeConversation.id === GLOBAL_CHAT_ID ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Messages broadcast in real-time to all users
                  </span>
                ) : activeConversation.type === 'direct' ? (
                  activeInfo.presenceStatus === 'online' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
                  ) : activeInfo.presenceStatus === 'away' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Away</span>
                  ) : (
                    <span>Offline</span>
                  )
                ) : (
                  <span>{activeInfo.subtitle}</span>
                )}
              </div>
            </div>
          </div>

          {/* Chat Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => startCall('audio')}
              title="Start Audio Call"
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              onClick={() => startCall('video')}
              title="Start Video Call"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={() => setShowSearchInChat(!showSearchInChat)}
              title="Search inside this conversation"
              className={`p-1.5 rounded-lg transition-colors ${showSearchInChat ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              title="Conversation details"
              className={`p-1.5 rounded-lg transition-colors ${showInfoPanel ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* In-chat Search Bar */}
        {showSearchInChat && (
          <div className="p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <input
              type="text"
              value={searchQueryInChat}
              onChange={(e) => setSearchQueryInChat(e.target.value)}
              placeholder="Find message in this conversation..."
              className="flex-1 bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => { setSearchQueryInChat(''); setShowSearchInChat(false); }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div className="px-4 py-2 bg-indigo-50/80 dark:bg-indigo-950/50 border-b border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-200">
            <div className="flex items-center gap-2 truncate">
              <Pin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 shrink-0">Pinned:</span>
              <span className="truncate">{pinnedMessage.text || pinnedMessage.content}</span>
            </div>
            <button
              onClick={() => handleTogglePin(pinnedMessage)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2 shrink-0 cursor-pointer"
            >
              Unpin
            </button>
          </div>
        )}

        {/* Sending error banner */}
        {sendError && (
          <div className="px-4 py-1.5 bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span>{sendError}</span>
            </div>
            <button onClick={() => setSendError(null)} className="text-[10px] text-red-500 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Uploading progress notification */}
        {uploadingProgress !== null && (
          <div className="px-4 py-1 bg-indigo-600 text-white text-xs font-semibold flex items-center justify-between">
            <span>Uploading attachment... {Math.round(uploadingProgress)}%</span>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        )}

        {/* Messages Scroll Area */}
        <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 ${wallpaperClasses[wallpaper] || wallpaperClasses.default}`}>
          {loadingMessages ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Connecting to real-time conversation stream...</span>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                {activeConversation.id === GLOBAL_CHAT_ID ? <Globe className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
              </div>
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {activeConversation.id === GLOBAL_CHAT_ID ? 'Welcome to Global Chat' : 'No messages yet'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {activeConversation.id === GLOBAL_CHAT_ID 
                  ? 'This is the shared public space for all registered ChatPro members. Say hello to start!' 
                  : 'Start this private 1-on-1 thread. Messages reach your contact instantly.'}
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.uid;
              const isDeleted = msg.deleted;
              const isGlobal = activeConversation.id === GLOBAL_CHAT_ID;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                >
                  {/* Sender Name in group or global chat */}
                  {(isGlobal || activeConversation.type === 'group') && !isMe && (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-9">
                      {msg.senderName}
                    </span>
                  )}

                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    {!isMe && (
                      <img
                        src={msg.senderPhoto || msg.senderPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                      />
                    )}

                    {/* Bubble Container */}
                    <div 
                      className="relative select-none"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id);
                      }}
                      onTouchStart={() => handleTouchStart(msg.id)}
                      onTouchEnd={handleTouchEnd}
                    >
                      
                      {/* Reply Reference Header */}
                      {msg.replyTo && !isDeleted && (
                        <div className={`p-2 rounded-t-xl text-[10px] border-b mb-0.5 ${
                          isMe 
                            ? 'bg-indigo-700 text-indigo-100 border-indigo-600' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                        }`}>
                          <div className="flex items-center gap-1 font-semibold">
                            <CornerDownRight className="w-3 h-3" />
                            <span>{msg.replyTo.senderName}</span>
                          </div>
                          <p className="truncate opacity-80">{msg.replyTo.text || msg.replyTo.content}</p>
                        </div>
                      )}

                      {/* Message Content Bubble */}
                      <div className={`p-3 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-xs' 
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                      } ${isDeleted ? 'italic opacity-60' : ''}`}>
                        
                        {isDeleted ? (
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            🚫 This message was deleted
                          </span>
                        ) : (
                          <>
                            {/* Image Type */}
                            {msg.type === 'image' && msg.mediaUrl && (
                              <div 
                                className="mb-2 rounded-xl overflow-hidden cursor-pointer" 
                                onClick={() => setMediaViewer({ url: msg.mediaUrl!, type: 'image', fileName: msg.fileName || 'image' })}
                              >
                                <img
                                  src={msg.mediaUrl}
                                  alt={msg.fileName || 'Photo'}
                                  className="max-w-[260px] sm:max-w-xs max-h-56 w-full h-auto rounded-xl object-cover hover:scale-102 transition-transform"
                                />
                              </div>
                            )}

                            {/* Video Type */}
                            {msg.type === 'video' && msg.mediaUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden">
                                <video
                                  src={msg.mediaUrl}
                                  controls
                                  className="max-h-60 w-auto rounded-xl"
                                />
                              </div>
                            )}

                            {/* Audio / Voice Note */}
                            {msg.type === 'audio' && msg.mediaUrl && (
                              <div className="mb-2 p-2 rounded-xl bg-black/10 dark:bg-white/10 flex items-center gap-3">
                                <audio controls src={msg.mediaUrl} className="h-8 max-w-xs" />
                                {msg.duration ? (
                                  <span className="text-[10px] font-mono opacity-80 shrink-0">
                                    {Math.floor(msg.duration / 60)}:{(msg.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                ) : null}
                              </div>
                            )}

                            {/* Document / File */}
                            {msg.type === 'file' && msg.mediaUrl && (
                              <div className="mb-2 p-2.5 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <div className="truncate text-left">
                                    <p className="font-semibold text-xs truncate">{msg.fileName || 'Document'}</p>
                                    <p className="text-[9px] opacity-75">{msg.fileSize ? `${Math.round(msg.fileSize / 1024)} KB` : ''}</p>
                                  </div>
                                </div>
                                <a
                                  href={msg.mediaUrl}
                                  download={msg.fileName || 'download'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}

                            {/* Text Body */}
                            {msg.type === 'text' && (
                              <p className="whitespace-pre-wrap break-words">{renderMessageTextWithLinks(msg.text || msg.content)}</p>
                            )}
                          </>
                        )}

                        {/* Timestamp & Status Info */}
                        <div className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.edited && !isDeleted && <span>(edited)</span>}
                          <span>{formatMessageTime(msg.createdAt || msg.timestamp)}</span>
                          
                          {/* Read / Delivered Checkmarks */}
                          {isMe && !isDeleted && (
                            <span className="flex items-center gap-0.5">
                              {activeConversation.id === GLOBAL_CHAT_ID ? (
                                <span title="Sent"><CheckCheck className="w-3 h-3 text-indigo-300" /></span>
                              ) : msg.readBy && msg.readBy.length > 1 ? (
                                <span title="Seen by recipient" className="flex items-center gap-0.5 text-cyan-200 font-medium">
                                  <CheckCheck className="w-3 h-3 text-cyan-300 animate-in fade-in" />
                                  <span className="text-[8px] uppercase tracking-wider">Seen</span>
                                </span>
                              ) : (
                                <span title="Delivered" className="flex items-center gap-0.5 text-indigo-200 opacity-80">
                                  <CheckCheck className="w-3 h-3 text-indigo-300" />
                                  <span className="text-[8px] uppercase tracking-wider">Delivered</span>
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Reactions Display */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && !isDeleted && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(msg.reactions).map(([emoji, uids]) => {
                            if (!uids.length) return null;
                            const hasReacted = uids.includes(currentUser?.uid || '');
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg, emoji)}
                                className={`px-1.5 py-0.2 rounded-full text-xs flex items-center gap-1 border transition-colors ${
                                  hasReacted 
                                    ? 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[9px]">{uids.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Action Toolbar on Hover & Touch */}
                      {!isDeleted && (
                        <div className="absolute top-0 right-0 -translate-y-1/2 flex items-center gap-0.5 p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          
                          {/* Quick Emojis */}
                          <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
                            {['❤️', '👍', '🔥', '😂'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg, emoji)}
                                title={`React with ${emoji}`}
                                className="p-1 hover:scale-125 transition-transform text-xs cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          {/* Reply */}
                          <button
                            onClick={() => setReplyingTo({
                              messageId: msg.id,
                              senderName: msg.senderName,
                              content: msg.text || msg.content,
                              text: msg.text || msg.content,
                              type: msg.type
                            })}
                            title="Reply"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <CornerDownRight className="w-3 h-3" />
                          </button>

                          {/* React Picker */}
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                            title="React"
                            className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Smile className="w-3 h-3" />
                          </button>

                          {/* Pin */}
                          <button
                            onClick={() => handleTogglePin(msg)}
                            title={msg.pinned ? 'Unpin' : 'Pin'}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Pin className="w-3 h-3" />
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text || msg.content || '');
                            }}
                            title="Copy text"
                            className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* Edit (if own message and text) */}
                          {isMe && msg.type === 'text' && (
                            <button
                              onClick={() => {
                                setEditingMessageState(msg);
                                setInputText(msg.text || msg.content);
                              }}
                              title="Edit"
                              className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}

                          {/* Delete (own message or admin/owner/maintainer) */}
                          {(isMe || isOwner || isAdmin || isMaintainer) && (
                            <button
                              onClick={() => handleDelete(msg, true)}
                              title="Delete message"
                              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                        </div>
                      )}

                      {/* Quick Emoji Reaction Popup */}
                      {showEmojiPicker === msg.id && (
                        <div className="absolute bottom-full right-0 mb-2 p-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-1 z-20 animate-in fade-in">
                          {['❤️', '👍', '🔥', '😂', '🎉', '😮', '🙏'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg, emoji)}
                              className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                  {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Replying Banner */}
        {replyingTo && (
          <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <CornerDownRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Replying to {replyingTo.senderName}:</span>
              <span className="text-slate-500 dark:text-slate-400 truncate">{replyingTo.text || replyingTo.content}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editing Banner */}
        {editingMessageState && (
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 truncate">
              <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold">Editing message</span>
            </div>
            <button onClick={() => { setEditingMessageState(null); setInputText(''); }} className="p-1 text-amber-600 hover:text-amber-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Input Composer */}
        <div className="sticky bottom-0 left-0 right-0 z-20 p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0 pb-safe pb-4">
          
          {isDirectPartnerBlocked ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You have blocked this contact. Unblock them to continue chatting.</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (userProfile && directPartner) {
                    await unblockUser(userProfile.uid, directPartner.uid);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                Unblock Contact
              </button>
            </div>
          ) : showVoiceRecorder ? (
            <VoiceRecorder
              onSendAudio={handleSendVoiceNote}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80">
              
              {/* File Attachment Input (hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Camera Capture Input (hidden) */}
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleCameraCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {/* Visually distinct attachment buttons container */}
              <div className="flex items-center gap-0.5 sm:gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (cameraInputRef.current) {
                      cameraInputRef.current.click();
                    }
                  }}
                  title="Take photo with camera"
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*,video/*';
                      fileInputRef.current.click();
                    }
                  }}
                  title="Send photo or video"
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '*/*';
                      fileInputRef.current.click();
                    }
                  }}
                  title="Attach document or file"
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-2xs"
                >
                  <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(true)}
                  title="Record voice message"
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-2xs"
                >
                  <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Textarea: Enter to send, Shift+Enter for newline */}
              <div className="flex-1 min-w-0 relative">
                <textarea
                  rows={1}
                  maxLength={500000}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={activeConversation.id === GLOBAL_CHAT_ID ? "Broadcast..." : "Type message..."}
                  className="w-full max-h-32 py-2 sm:py-2.5 px-3 sm:px-4 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 focus:border-indigo-500 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none transition-all shadow-inner"
                />
              </div>

              {/* Send CTA Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || sendingMessage}
                className="p-2.5 sm:p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                title="Send message"
              >
                {sendingMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>

            </form>
          )}

        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. RIGHT INFO PANEL: Conversation / Member Details           */}
      {/* ------------------------------------------------------------- */}
      {showInfoPanel && (
        <aside className="w-72 lg:w-80 border-l border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
          
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Conversation Info</h4>
            <button onClick={() => setShowInfoPanel(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            
            {/* Avatar & Header */}
            <div className="text-center">
              {activeConversation.id === GLOBAL_CHAT_ID ? (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-3">
                  <Globe className="w-8 h-8" />
                </div>
              ) : (
                <img
                  src={activeInfo.avatar}
                  alt={activeInfo.title}
                  className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 mb-3"
                />
              )}
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {activeInfo.title}
              </h5>
              <p className="text-xs text-slate-500 font-mono">
                {activeInfo.subtitle}
              </p>
            </div>

            {/* Global Chat Description */}
            {activeConversation.id === GLOBAL_CHAT_ID && (
              <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Public Community Room</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every verified user on ChatPro can read and reply to messages in Global Chat. Use contacts to initiate private 1-on-1 chats.
                </p>
              </div>
            )}

            {/* Direct User Info */}
            {activeConversation.type === 'direct' && otherUserProfile && (
              <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {otherUserProfile.status === 'online' ? '🟢 Currently Online' : '⚪ Offline'}
                  </p>
                </div>
                {otherUserProfile.bio && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Bio</span>
                    <p className="text-slate-700 dark:text-slate-300">{otherUserProfile.bio}</p>
                  </div>
                )}
                {otherUserProfile.email && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                    <p className="font-mono text-slate-600 dark:text-slate-400 truncate">{otherUserProfile.email}</p>
                  </div>
                )}
              </div>
            )}

            {/* Group Members List */}
            {activeConversation.type === 'group' && (
              <div>
                <h6 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Members ({activeConversation.participants.length})
                </h6>
                <div className="space-y-1.5">
                  {Object.values(activeConversation.participantData || {}).map((member) => (
                    <div key={member.uid} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                          alt={member.displayName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{member.displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">@{member.username}</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {member.role || 'member'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Block / Unblock direct contact */}
            {activeConversation.type === 'direct' && directPartner && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={async () => {
                    if (!userProfile) return;
                    if (isDirectPartnerBlocked) {
                      await unblockUser(userProfile.uid, directPartner.uid);
                    } else {
                      await blockUser(userProfile.uid, directPartner.uid);
                    }
                  }}
                  className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDirectPartnerBlocked
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isDirectPartnerBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
                </button>
              </div>
            )}

            {/* Report user button */}
            {activeConversation.id !== GLOBAL_CHAT_ID && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setReportingUser({
                    uid: activeInfo.subtitle,
                    name: activeInfo.title
                  })}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report User or Message</span>
                </button>
              </div>
            )}

          </div>

        </aside>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & POPUPS                                            */}
      {/* ------------------------------------------------------------- */}

      {/* Contacts / Real User Search */}
      <ContactsModal
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
        onSelectUser={async (selected) => {
          if (!userProfile) return;
          const conv = await getOrCreateDirectConversation(userProfile, selected);
          setActiveConversation(conv);
        }}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={(group) => {
          setActiveConversation(group);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
      />

      {/* Media Fullscreen Viewer */}
      <MediaViewerModal
        mediaUrl={mediaViewer?.url || null}
        type={mediaViewer?.type}
        fileName={mediaViewer?.fileName}
        onClose={() => setMediaViewer(null)}
      />

      {/* Report User Modal */}
      {reportingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Report {reportingUser.name}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Submit a moderation ticket to the ChatPro administration team.
            </p>
            <form onSubmit={handleReportUser} className="space-y-3">
              <textarea
                rows={3}
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for report (e.g. harassment, spam, inappropriate content)..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportingUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Call Modal Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-white shadow-2xl relative overflow-hidden">
            
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

            {/* Call type badge */}
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6 uppercase tracking-wider">
              {activeCall.type === 'video' ? 'Secure Video Call' : 'Secure Audio Call'}
            </span>

            {/* Avatar or Video feed box */}
            {activeCall.type === 'video' && !callVideoOff ? (
              <div className="w-full h-64 rounded-2xl bg-slate-950 border border-slate-800 mb-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Video className="w-16 h-16 text-indigo-400 animate-pulse" />
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-mono text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live HD Stream</span>
                </div>
              </div>
            ) : (
              <div className="relative mb-6">
                <img
                  src={activeCall.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeCall.partnerName}`}
                  alt={activeCall.partnerName}
                  className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500/50 shadow-2xl animate-pulse"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
            )}

            <h3 className="font-extrabold text-xl text-white mb-1">
              {activeCall.partnerName}
            </h3>
            <p className="text-sm font-mono text-indigo-400 mb-6">
              {formatCallDuration(callDuration)}
            </p>

            {/* Call Controls Bar */}
            <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 px-6 py-3 rounded-full backdrop-blur-md">
              <button
                onClick={() => setCallMuted(!callMuted)}
                className={`p-3 rounded-full transition-colors ${callMuted ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                title={callMuted ? 'Unmute' : 'Mute'}
              >
                {callMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {activeCall.type === 'video' && (
                <button
                  onClick={() => setCallVideoOff(!callVideoOff)}
                  className={`p-3 rounded-full transition-colors ${callVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                  title={callVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {callVideoOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={() => setActiveCall(null)}
                className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Media Viewer Modal Lightbox */}
      {mediaViewer && (
        <MediaViewerModal
          mediaUrl={mediaViewer.url}
          type={mediaViewer.type}
          fileName={mediaViewer.fileName}
          onClose={() => setMediaViewer(null)}
        />
      )}

      {/* Delete Conversation Confirmation Modal */}
      {conversationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Delete Conversation?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to delete this conversation with <span className="font-semibold text-slate-200">{getConversationInfo(conversationToDelete).title}</span>? This action cannot be undone.
            </p>
            {deleteFeedback && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-medium">
                {deleteFeedback}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setConversationToDelete(null); setDeleteFeedback(null); }}
                disabled={isDeletingConv}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingConv}
                onClick={async () => {
                  try {
                    setIsDeletingConv(true);
                    setDeleteFeedback(null);
                    await deleteConversation(conversationToDelete.id, currentUser!.uid);
                    
                    setConversations(prev => prev.filter(c => c.id !== conversationToDelete.id));
                    if (activeConversation.id === conversationToDelete.id) {
                      setActiveConversation(getGlobalChatConversation());
                    }
                    setConversationToDelete(null);
                  } catch (err: any) {
                    setDeleteFeedback(err.message || 'Failed to delete conversation.');
                  } finally {
                    setIsDeletingConv(false);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                {isDeletingConv && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
