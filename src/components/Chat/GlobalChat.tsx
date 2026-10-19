import React from 'react';
import { MessageSquare } from 'lucide-react';
import { UserProfile } from '../../types';

interface GlobalChatProps {
  me: UserProfile;
}

export const GlobalChat: React.FC<GlobalChatProps> = ({ me }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Global Chat</h2>
          <p className="text-xs text-slate-500">Welcome to the community room!</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
        Global messages will appear here.
      </div>
    </div>
  );
};

export default GlobalChat;
