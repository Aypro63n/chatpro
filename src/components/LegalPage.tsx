import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

export type LegalPageKind = 'privacy' | 'terms';

export const LegalPage: React.FC<{ kind: LegalPageKind; onHome: () => void }> = ({ kind, onHome }) => {
  const privacy = kind === 'privacy';
  return (
    <main className="min-h-screen bg-white text-zinc-900 py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <button 
          type="button" 
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[#CB0E31] mb-8 transition-colors" 
          onClick={onHome} 
          aria-label="Return to ChatPro home"
        >
          <ArrowLeft size={16} aria-hidden="true" /> ChatPro Home
        </button>
        <p className="text-xs font-bold tracking-widest text-[#CB0E31] uppercase mb-2">CHATPRO / {privacy ? 'PRIVACY POLICY' : 'TERMS AND CONDITIONS'}</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-zinc-900">{privacy ? 'Privacy Policy' : 'Terms and Conditions'}</h1>
        <p className="text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-200">Last updated: October 14, 2026</p>
        
        {privacy ? (
          <div className="space-y-6 text-zinc-700 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">1. Information We Collect</h2>
              <p>ChatPro uses account credentials, profile information, messages, and uploaded media to provide the real-time messaging workspace. We collect only what is necessary for authentication, delivery, safety, and service operation.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">2. Data Security & Protection</h2>
              <p>Access to private conversations and media is strictly controlled by authenticated Firebase access rules. Your data is transmitted over secure channels and stored securely.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">3. User Controls</h2>
              <p>You can update profile preferences, manage conversation states, and control visibility settings anytime through your account settings.</p>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <h2 className="text-lg font-bold text-zinc-900 mb-2">4. Contact Us</h2>
              <p className="flex items-center gap-2"><Mail size={16} className="text-[#CB0E31]" /> <a href="mailto:hello@chatpro.app" className="text-[#CB0E31] hover:underline font-semibold">hello@chatpro.app</a></p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-zinc-700 leading-relaxed text-sm md:text-base">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">1. Acceptable Use</h2>
              <p>Use ChatPro lawfully and respectfully. Do not attempt unauthorized access, distribute harmful content, or interfere with system availability.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">2. User Content</h2>
              <p>You retain full responsibility for content you transmit or upload. You must possess the appropriate rights and permissions for shared media.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-2">3. Service Availability</h2>
              <p>ChatPro continuously improves features and performance. We strive for maximum uptime and reliability across all supported platforms.</p>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <h2 className="text-lg font-bold text-zinc-900 mb-2">4. Contact Us</h2>
              <p className="flex items-center gap-2"><Mail size={16} className="text-[#CB0E31]" /> <a href="mailto:hello@chatpro.app" className="text-[#CB0E31] hover:underline font-semibold">hello@chatpro.app</a></p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
