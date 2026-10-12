import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { ChatLayout } from './components/Chat/ChatLayout';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { NotFound } from './components/NotFound';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'chat'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  React.useEffect(() => {
    document.title = currentView === 'chat' ? 'ChatPro — inbox' : 'ChatPro — conversations with clarity';
  }, [currentView]);

  React.useEffect(() => {
    if (currentUser) {
      setCurrentView('chat');
      setAuthModalOpen(false);
    }
  }, [currentUser]);

  const handleOpenChat = () => {
    if (!currentUser) { setAuthModalMode('login'); setAuthModalOpen(true); }
    else setCurrentView('chat');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    return <NotFound onHome={() => { window.history.pushState({}, '', '/'); window.location.reload(); }} />;
  }

  if (loading) {
    return <main className="not-found-page" aria-live="polite"><p className="eyebrow">CHATPRO</p><h1>Preparing your workspace.</h1><p className="page-lede">Connecting your account securely.</p></main>;
  }

  return (
    <div className={`w-full flex flex-col ${currentView === 'chat' ? 'h-[100dvh] min-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <div className="flex-1 flex flex-col">
        {currentView === 'landing' && <LandingPage onGetStarted={() => currentUser ? setCurrentView('chat') : handleOpenAuth('register')} onLogin={() => currentUser ? setCurrentView('chat') : handleOpenAuth('login')} />}
        {currentView === 'chat' && (currentUser ? <ChatLayout /> : <main className="not-found-page"><p className="eyebrow">CHATPRO / ACCESS</p><h1>Sign in to continue.</h1><p className="page-lede">Your conversations are private and available only to authenticated ChatPro users.</p><button type="button" className="cta cta-primary" onClick={() => handleOpenAuth('login')}>Sign in to ChatPro</button></main>)}
      </div>
      <AuthModal isOpen={authModalOpen} initialMode={authModalMode} onClose={() => setAuthModalOpen(false)} onSuccess={() => setCurrentView('chat')} />
      <AdminPanelModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return <ThemeProvider><AuthProvider><AppContent /></AuthProvider></ThemeProvider>;
}
