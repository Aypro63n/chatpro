import React from 'react';
import { Home } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#000000] text-white font-sans h-full min-h-[50vh]">
      <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
        <span className="font-mono font-black text-2xl">404</span>
      </div>
      <h2 className="text-3xl font-black mb-3 uppercase tracking-tight text-white">Page Not Found</h2>
      <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        The requested path or view doesn't exist. Let's get you back to real-time conversations.
      </p>
      <button
        onClick={onGoHome}
        className="px-8 py-4 rounded-full btn-mono-primary text-xs font-bold tracking-wider uppercase cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </button>
    </div>
  );
};
