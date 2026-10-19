import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Mic, Loader2 } from 'lucide-react';
import { Message, Conversation, UserProfile } from '../../types';
import { sendMessage } from '../../services/chatService';

interface ChatWindowProps {
  conversation: Conversation;
  me: UserProfile;
  directory: Map<string, UserProfile>;
  onBack: () => void;
  onChanged: (conv: Conversation) => void;
  onDeleted: (id: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  me,
  directory,
  onBack,
  onChanged,
  onDeleted
}) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversation, me, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between">
        <button onClick={onBack} className="text-xs font-bold text-indigo-600">← Back</button>
        <h3 className="text-sm font-bold">{conversation.name || 'Chat'}</h3>
        <div className="w-10" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-xs text-slate-400 my-4">
          Conversation started
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          disabled={!inputText.trim() || sending}
          className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
