import React, { useState } from 'react';
import { ArrowRight, LogOut, Menu, Moon, Shield, Sun, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps { onOpenAuth: (mode?: 'login' | 'register') => void; onOpenChat: () => void; onOpenAdmin?: () => void; currentView?: 'landing' | 'chat'; }

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenChat, onOpenAdmin, currentView = 'landing' }) => {
  const { currentUser, isOwner, isAdmin, isMaintainer, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const hasModRole = isOwner || isAdmin || isMaintainer;
  const go = (id: string) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <header className="site-nav" aria-label="Primary navigation">
      <a className="brand" href="/" onClick={() => setOpen(false)} aria-label="ChatPro home"><span className="brand-mark" aria-hidden="true">C</span><span>ChatPro</span></a>
      {currentView === 'landing' && <nav className="desktop-nav"><button type="button" onClick={() => go('product')}>Product</button><button type="button" onClick={() => go('features')}>Features</button><button type="button" onClick={() => go('security')}>Security</button></nav>}
      <div className="nav-actions">
        {currentUser ? <><button type="button" className="cta cta-primary" onClick={onOpenChat}>Open inbox <ArrowRight size={15} aria-hidden="true" /></button>{hasModRole && onOpenAdmin && <button type="button" className="icon-button" onClick={onOpenAdmin} aria-label="Open administration"><Shield size={17} /></button>}<button type="button" className="icon-button" onClick={() => void logout()} aria-label="Sign out"><LogOut size={17} /></button></> : <><button type="button" className="cta cta-secondary" onClick={() => onOpenAuth('login')}>Sign in</button><button type="button" className="cta cta-primary" onClick={() => onOpenAuth('register')}>Create account</button></>}
        <button type="button" className="icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
        {currentView === 'landing' && <button type="button" className="icon-button mobile-menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={19} /> : <Menu size={19} />}</button>}
      </div>
      {open && currentView === 'landing' && <nav className="mobile-nav"><button type="button" onClick={() => go('product')}>Product</button><button type="button" onClick={() => go('features')}>Features</button><button type="button" onClick={() => go('security')}>Security</button><a href="mailto:hello@chatpro.app" onClick={() => setOpen(false)}>Email ChatPro</a></nav>}
    </header>
  );
};
