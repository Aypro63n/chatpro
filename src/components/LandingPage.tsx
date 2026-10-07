import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  MessageSquare, 
  Shield, 
  Users, 
  Lock, 
  Zap, 
  Check, 
  ChevronDown, 
  Mail, 
  Key, 
  User, 
  AtSign, 
  Loader2, 
  Globe, 
  Activity, 
  Terminal,
  Sparkles,
  CheckCheck,
  Radio,
  Sliders,
  ShieldCheck,
  Send,
  Eye,
  Bell,
  Camera,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const { currentUser, loginWithGoogle, loginAnonymously, loginWithEmail, registerWithEmail } = useAuth();

  // Auth Section state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Cinematic scroll parallax offset
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for snappy scroll reveal
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.08,
    });

    const elements = document.querySelectorAll('.scroll-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authTab === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName, username);
      }
      onGetStarted();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      onGetStarted();
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginAnonymously();
      onGetStarted();
    } catch (err: any) {
      setAuthError(err.message || 'Guest sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skylineOpacity = Math.max(0.05, 1 - scrollY * 0.001);

  return (
    <div ref={containerRef} className="w-full bg-[#FFFFFF] text-neutral-900 font-sans selection:bg-black selection:text-white overflow-x-hidden relative">
      
      {/* Minimal Premium Navbar */}
      <header className="sticky top-4 z-50 w-full px-4 sm:px-6 max-w-6xl mx-auto font-sans">
        <div className="rounded-full border border-neutral-200 bg-white/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] px-5 sm:px-8 h-14 flex items-center justify-between transition-all">
          
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
              C
            </div>
            <span className="font-extrabold text-sm tracking-tight text-black uppercase font-mono">
              CHATPRO
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-600">
            <button onClick={() => scrollTo('interface-preview')} className="hover:text-black transition-colors cursor-pointer">Preview</button>
            <button onClick={() => scrollTo('features')} className="hover:text-black transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollTo('showcase')} className="hover:text-black transition-colors cursor-pointer">Showcase</button>
            <button onClick={() => scrollTo('security')} className="hover:text-black transition-colors cursor-pointer">Security</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-black transition-colors cursor-pointer">How It Works</button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => scrollTo('register-login-section')}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-black transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => scrollTo('register-login-section')}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-black text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 z-10 flex flex-col justify-center items-center text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 bg-[#F8F9FA] text-xs font-mono tracking-wide text-neutral-600 mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>Real-Time Encrypted Messaging Architecture</span>
          </div>

          <div className="overflow-hidden mb-2">
            <h1 className="animate-line-up text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-black uppercase leading-[0.95]">
              Real people.
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h1 className="animate-line-up-delayed text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-neutral-400 uppercase leading-[0.95]">
              Real conversations.
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 font-normal leading-relaxed mb-10">
            A fast, private, and distraction-free communication environment. Designed with Apple-grade minimalism, sub-100ms synchronization, and server-enforced role permissions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => scrollTo('register-login-section')}
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold tracking-wider uppercase bg-black text-white hover:bg-neutral-800 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('interface-preview')}
              className="w-full sm:w-auto px-8 py-4 text-xs font-semibold tracking-wider uppercase bg-[#F8F9FA] hover:bg-neutral-200 text-neutral-900 border border-neutral-200 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Explore Preview</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* CINEMATIC INTERFACE PREVIEW WITH FLOATING WIDGETS */}
          <div id="interface-preview" className="relative mt-8 scroll-item">
            
            {/* Floating UI Widget 1: Online Status */}
            <div className="absolute -top-6 -left-6 sm:left-4 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-neutral-200 shadow-xl text-xs font-medium text-neutral-800 animate-bounce">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>alex_chen is online</span>
            </div>

            {/* Floating UI Widget 2: Typing Indicator */}
            <div className="absolute -bottom-6 -right-6 sm:right-6 z-20 hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-neutral-200 shadow-xl text-xs font-medium text-neutral-800">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-neutral-500 font-mono text-[11px]">elena is typing...</span>
            </div>

            {/* Main Mockup Container */}
            <div className="relative z-10 max-w-5xl mx-auto bg-white border border-neutral-200 rounded-[32px] p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.08)] text-left">
              
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    #
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-black">global_chat</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F8F9FA] text-neutral-600 border border-neutral-200">
                        Live Room
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">All verified ChatPro community members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FA] border border-neutral-200 text-[11px] font-mono text-neutral-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span>Real-time onSnapshot</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center text-xs font-bold shrink-0">
                    E
                  </div>
                  <div className="p-4 rounded-3xl rounded-tl-sm bg-[#F8F9FA] border border-neutral-200 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-black">elena_rostova</span>
                      <span className="text-[10px] text-neutral-400">10:24 AM</span>
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      The pure white minimalist aesthetic and soft diffused shadows feel exceptionally premium.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="p-4 rounded-3xl rounded-tr-sm bg-black text-white max-w-md shadow-md">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="font-bold text-xs text-white">alex_chen</span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        Just now <CheckCheck className="w-3.5 h-3.5 text-white" />
                      </span>
                    </div>
                    <p className="text-xs text-neutral-100 leading-relaxed">
                      Completely smooth. Zero unnecessary clutter, pure pill buttons, and robust Firestore security rules.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                    A
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-full bg-[#F8F9FA] border border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
                  <span>Message #global_chat...</span>
                  <Radio className="w-3.5 h-3.5 text-neutral-400" />
                </div>
                <button 
                  onClick={() => scrollTo('register-login-section')}
                  className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                >
                  Send ↵
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 bg-[#F8F9FA] border-t border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-white text-xs font-mono uppercase tracking-wider text-neutral-600 mb-4 inline-block shadow-xs">
              Architectural Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase mt-2">
              Designed for focus.
            </h2>
            <p className="text-sm text-neutral-600 mt-3 font-normal">
              Built with precision, speed, and real-time synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            <div 
              className="md:col-span-7 bg-white border border-neutral-200 rounded-[28px] p-8 sm:p-10 flex flex-col justify-between scroll-item shadow-sm hover:shadow-md transition-all"
              style={{ transitionDelay: '50ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">01 // REAL-TIME MESSAGING</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-black mt-1 mb-3">
                  Messages that arrive instantly.
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
                  Firestore onSnapshot streams ensure messages synchronize in sub-100ms intervals across global devices.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>Continuous Stream</span>
                <span>Zero Latency Gap</span>
              </div>
            </div>

            <div 
              className="md:col-span-5 bg-white border border-neutral-200 rounded-[28px] p-8 flex flex-col justify-between scroll-item shadow-sm hover:shadow-md transition-all"
              style={{ transitionDelay: '100ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#F8F9FA] border border-neutral-200 flex items-center justify-center mb-6 text-black">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">02 // GLOBAL CHAT</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-black mt-1 mb-3">
                  One shared room for everyone.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  A persistent public town hall loaded instantly upon signing in.
                </p>
              </div>
              <div className="mt-6">
                <span className="px-3 py-1 rounded-full bg-[#F8F9FA] border border-neutral-200 text-xs font-mono text-neutral-600">
                  Public Channel
                </span>
              </div>
            </div>

            <div 
              className="md:col-span-5 bg-white border border-neutral-200 rounded-[28px] p-8 flex flex-col justify-between scroll-item shadow-sm hover:shadow-md transition-all"
              style={{ transitionDelay: '150ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-[#F8F9FA] border border-neutral-200 flex items-center justify-center mb-6 text-black">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">03 // PRIVATE CONVERSATIONS</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-black mt-1 mb-3">
                  Direct chats with real people.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Deterministic direct threads using sorted participant IDs.
                </p>
              </div>
              <div className="mt-6 font-mono text-xs text-neutral-400">
                <span>[uidA, uidB].sort().join('_')</span>
              </div>
            </div>

            <div 
              className="md:col-span-7 bg-white border border-neutral-200 rounded-[28px] p-8 sm:p-10 flex flex-col justify-between scroll-item shadow-sm hover:shadow-md transition-all"
              style={{ transitionDelay: '200ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6 shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">04 // SECURE BACKEND</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-black mt-1 mb-3">
                  Protected conversations and permissions.
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
                  Strict 4-level server-enforced role permissions. Owners, Admins, Maintainers, and Members with downward-only governance.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold font-mono">OWNER</span>
                <span className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-xs font-mono">ADMIN</span>
                <span className="px-3 py-1 rounded-full bg-[#F8F9FA] text-neutral-600 text-xs font-mono">MAINTAINER</span>
                <span className="px-3 py-1 rounded-full bg-[#F8F9FA] text-neutral-500 text-xs font-mono">MEMBER</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PRODUCT SHOWCASE SECTION */}
      <section id="showcase" className="py-24 relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-[#F8F9FA] text-xs font-mono uppercase tracking-wider text-neutral-600 mb-4 inline-block shadow-xs">
              Editorial Showcase
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase mt-2">
              Inside ChatPro.
            </h2>
            <p className="text-sm text-neutral-600 mt-3 font-normal">
              A clean multi-pane layout engineered for seamless communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#F8F9FA] border border-neutral-200 rounded-[28px] p-6 scroll-item">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h4 className="font-bold text-base text-black mb-2">Sidebar & Channels</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Quickly switch between Global Chat, direct messages, and group rooms with real-time unread counts.
              </p>
            </div>

            <div className="bg-[#F8F9FA] border border-neutral-200 rounded-[28px] p-6 scroll-item" style={{ transitionDelay: '100ms' }}>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h4 className="font-bold text-base text-black mb-2">Rich Composer</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Send text, images, videos, voice recordings, and camera snapshots instantly with read receipts.
              </p>
            </div>

            <div className="bg-[#F8F9FA] border border-neutral-200 rounded-[28px] p-6 scroll-item" style={{ transitionDelay: '200ms' }}>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h4 className="font-bold text-base text-black mb-2">Presence & Settings</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Monitor online contacts, toggle dark/light themes, and customize dark background patterns.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECURITY SECTION */}
      <section id="security" className="py-24 relative z-10 bg-[#F8F9FA] border-t border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-item">
          <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-white text-xs font-mono uppercase tracking-wider text-neutral-600 mb-4 inline-block shadow-xs">
            Private By Design
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase mt-2 mb-6">
            Secure Firebase Architecture.
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-10">
            ChatPro utilizes robust Firebase authentication and strict Firestore security rules. Every message, reaction, and profile update is governed by cryptographic permission checks ensuring absolute data integrity.
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700 shadow-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Firestore Rules</span>
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700 shadow-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-black" />
              <span>Secure Token Auth</span>
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 relative z-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-[#F8F9FA] text-xs font-mono uppercase tracking-wider text-neutral-600 mb-4 inline-block shadow-xs">
              Simple Onboarding
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase mt-2">
              How it works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F8F9FA] border border-neutral-200 rounded-[28px] p-8 text-left scroll-item">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-4">Step 01</span>
              <h4 className="font-extrabold text-lg text-black mb-2">Create your account</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Sign in instantly using Google 1-click auth, email credentials, or anonymous guest mode.
              </p>
            </div>

            <div className="bg-[#F8F9FA] border border-neutral-200 rounded-[28px] p-8 text-left scroll-item" style={{ transitionDelay: '100ms' }}>
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-4">Step 02</span>
              <h4 className="font-extrabold text-lg text-black mb-2">Find real people</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Browse the member directory or join Global Chat to meet verified users instantly.
              </p>
            </div>

            <div className="bg-[#F8F9FA] border border-neutral-200 rounded-[28px] p-8 text-left scroll-item" style={{ transitionDelay: '200ms' }}>
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block mb-4">Step 03</span>
              <h4 className="font-extrabold text-lg text-black mb-2">Start a conversation</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Send instant messages, photos, voice notes, and reactions in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AUTHENTICATION PORTAL SECTION */}
      <section id="register-login-section" className="py-24 relative z-10 bg-[#F8F9FA] border-t border-neutral-200">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-white text-xs font-mono uppercase tracking-wider text-neutral-600 mb-3 inline-block shadow-xs">
              Entry Portal
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-black uppercase">
              Join ChatPro
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Connect to live messaging with your preferred credentials.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-[28px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] scroll-item">
            
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-full bg-[#F8F9FA] hover:bg-neutral-200 text-neutral-900 border border-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Google 1-Click Sign In</span>
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-full border border-neutral-200 bg-white hover:bg-[#F8F9FA] text-neutral-700 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Instant Guest Mode</span>
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <span className="relative bg-white px-3 text-[10px] text-neutral-400 font-mono uppercase">
                or email authentication
              </span>
            </div>

            {authError && (
              <div className="p-3 mb-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs">
                {authError}
              </div>
            )}

            <div className="grid grid-cols-2 p-1 bg-[#F8F9FA] border border-neutral-200 rounded-full mb-5 text-xs font-mono uppercase">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(null); }}
                className={`py-2 rounded-full transition-all cursor-pointer ${authTab === 'login' ? 'bg-black text-white font-bold shadow-xs' : 'text-neutral-500 hover:text-black'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(null); }}
                className={`py-2 rounded-full transition-all cursor-pointer ${authTab === 'register' ? 'bg-black text-white font-bold shadow-xs' : 'text-neutral-500 hover:text-black'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authTab === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1 ml-3">Full Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1 ml-3">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="alex_chen"
                      className="w-full px-4 py-3 bg-[#F8F9FA] border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black font-mono transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1 ml-3">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-[#F8F9FA] border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-500 mb-1 ml-3">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#F8F9FA] border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3.5 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{authTab === 'login' ? 'Sign In to ChatPro' : 'Create Account'}</span>
              </button>
            </form>

          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 bg-white text-center border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 scroll-item">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-black uppercase mb-4">
            Your conversations. Your people.
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base max-w-lg mx-auto mb-8 font-normal">
            Join ChatPro today and experience fast, private, real-time messaging.
          </p>
          <button
            onClick={() => scrollTo('register-login-section')}
            className="px-8 py-4 text-xs font-bold tracking-wider uppercase bg-black text-white hover:bg-neutral-800 rounded-full inline-flex items-center gap-2 cursor-pointer shadow-lg transition-all"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-neutral-200 bg-[#F8F9FA] relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white border border-neutral-200 rounded-[28px] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-tight text-black">
                  CHATPRO
                </div>
                <p className="text-[11px] text-neutral-500">
                  Real people. Real conversations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600">
              <button onClick={() => scrollTo('interface-preview')} className="hover:text-black transition-colors cursor-pointer">Preview</button>
              <button onClick={() => scrollTo('features')} className="hover:text-black transition-colors cursor-pointer">Features</button>
              <button onClick={() => scrollTo('showcase')} className="hover:text-black transition-colors cursor-pointer">Showcase</button>
              <button onClick={() => scrollTo('security')} className="hover:text-black transition-colors cursor-pointer">Security</button>
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-black transition-colors cursor-pointer">How It Works</button>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono">
              © 2026 Chatpro
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
