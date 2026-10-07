import React, { useState } from 'react';
import { 
  LogOut, 
  Shield, 
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenChat: () => void;
  onOpenAdmin?: () => void;
  currentView?: 'landing' | 'chat';
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  onOpenChat, 
  onOpenAdmin,
  currentView = 'landing' 
}) => {
  const { currentUser, isOwner, isAdmin, isMaintainer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasModRole = isOwner || isAdmin || isMaintainer;

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 max-w-5xl mx-auto font-sans">
      {/* Floating Pill Container with Glassmorphism */}
      <div className="rounded-full border border-white/15 bg-black/70 backdrop-blur-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)] px-4 sm:px-6 h-13 flex items-center justify-between transition-all duration-300">
        
        {/* Left: Brand Wordmark & Pill Badge */}
        <div 
          onClick={onOpenChat} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            C
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase font-mono">
            CHATPRO
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono text-neutral-400">
            FLUID_V2
          </span>
        </div>

        {/* Center: Navigation Links */}
        {currentView === 'landing' && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <button 
              onClick={() => scrollToSection('product')} 
              className="hover:text-white transition-colors cursor-pointer tracking-wide"
            >
              Product
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-white transition-colors cursor-pointer tracking-wide"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('security')} 
              className="hover:text-white transition-colors cursor-pointer tracking-wide"
            >
              Security
            </button>
            <button 
              onClick={() => scrollToSection('roles')} 
              className="hover:text-white transition-colors cursor-pointer tracking-wide"
            >
              Roles
            </button>
          </nav>
        )}

        {/* Right: Pill Actions */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {hasModRole && onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 hover:border-white text-white bg-white/5 transition-colors flex items-center gap-1.5"
                  title="Control Panel"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Console</span>
                </button>
              )}

              <button
                onClick={onOpenChat}
                className="px-4 py-1.5 text-xs font-semibold rounded-full btn-mono-primary flex items-center gap-1 shadow-sm"
              >
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-xs font-semibold rounded-full btn-mono-primary shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {currentView === 'landing' && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>

      </div>

      {/* Floating Mobile Drawer */}
      {mobileMenuOpen && currentView === 'landing' && (
        <div className="md:hidden mt-2 rounded-2xl border border-white/15 bg-black/85 backdrop-blur-2xl p-4 space-y-2 text-xs font-medium text-neutral-300 shadow-2xl">
          <button 
            onClick={() => scrollToSection('product')}
            className="block w-full text-left py-2 hover:text-white"
          >
            Product
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-2 hover:text-white"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('security')}
            className="block w-full text-left py-2 hover:text-white"
          >
            Security
          </button>
          <button 
            onClick={() => scrollToSection('roles')}
            className="block w-full text-left py-2 hover:text-white"
          >
            Roles
          </button>
        </div>
      )}
    </header>
  );
};
