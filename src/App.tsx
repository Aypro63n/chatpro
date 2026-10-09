import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ChatLayout } from './components/Chat/ChatLayout';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setCurrentView('chat');
      setAuthModalOpen(false);
    }
  }, [currentUser]);

  // If user is logged in and lands, auto switch to chat if requested
  const handleOpenChat = () => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
    } else {
      setCurrentView('chat');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white font-mono">
        <div className="w-10 h-10 rounded-[2px] border border-[#333333] bg-[#111111] text-white flex items-center justify-center font-bold text-sm mb-4">
          C
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#888888]">
          <span>Initializing ChatPro</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col bg-[#000000] text-white font-sans selection:bg-white selection:text-black ${currentView === 'chat' ? 'h-[100dvh] min-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      
      {/* Main View Switching */}
      <div className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (currentUser) {
                setCurrentView('chat');
              } else {
                handleOpenAuth('register');
              }
            }}
            onLogin={() => {
              if (currentUser) {
                setCurrentView('chat');
              } else {
                handleOpenAuth('login');
              }
            }}
          />
        )}

        {currentView === 'chat' && (
          currentUser ? (
            <ChatLayout />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#000000]">
              <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <span className="font-mono font-bold text-lg">C</span>
              </div>
              <h2 className="text-xl font-bold mb-2 uppercase tracking-tight text-white">Sign In Required</h2>
              <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed">
                You must be logged in with a verified ChatPro account to access real-time human conversations.
              </p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-8 py-3 rounded-full btn-mono-primary text-xs font-bold tracking-wider uppercase cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Sign In to ChatPro
              </button>
            </div>
          )
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentView('chat');
        }}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
