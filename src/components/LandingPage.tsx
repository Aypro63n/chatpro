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
  Eye
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

  // Parallax calculations for pure white cinematic view
  const zoomScale = Math.min(1.2, 1 + scrollY * 0.00025);
  const cityTranslateY = scrollY * 0.2;
  const skylineOpacity = Math.max(0.08, 1 - scrollY * 0.001);

  return (
    <div ref={containerRef} className="w-full bg-[#FFFFFF] text-neutral-900 font-sans selection:bg-black selection:text-white overflow-x-hidden relative">
      
      {/* ============================================================== */}
      {/* PURE WHITE CINEMATIC PARALLAX BACKGROUND LAYERS                */}
      {/* ============================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: skylineOpacity }}>
        
        {/* Ambient light layer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-neutral-100 via-neutral-50 to-transparent rounded-full blur-[120px]" />

        {/* Abstract Architectural Lines */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{ transform: `scale(${zoomScale * 0.98}) translateY(${cityTranslateY * 0.1}px)` }}
        >
          <div className="w-[1200px] h-[800px] opacity-10 border border-neutral-300 grid grid-cols-12 gap-4 p-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-t border-neutral-300 h-full flex flex-col justify-between py-2">
                <div className="w-2 h-2 bg-neutral-400 rounded-full mx-auto" />
                <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full mx-auto" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* HERO OPENING SEQUENCE (Pure White Minimalist Apple/Linear Vibe) */}
      {/* ============================================================== */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 z-10 min-h-[90vh] flex flex-col justify-center items-center text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-mono tracking-wide text-neutral-600 mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span>ChatPro 2026 — Real-Time Messaging Architecture</span>
          </div>

          {/* Headline */}
          <div className="overflow-hidden mb-2">
            <h1 className="animate-line-up text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-black uppercase leading-[0.92]">
              Real people.
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h1 className="animate-line-up-delayed text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-neutral-400 uppercase leading-[0.92]">
              Real conversations.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 font-normal leading-relaxed mb-10">
            A fast, private, and distraction-free communication environment. Designed with Apple-grade minimalism, sub-100ms synchronization, and server-enforced role permissions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold tracking-wider uppercase bg-black text-white hover:bg-neutral-800 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all"
            >
              <span>Start Chatting</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('interface-preview')}
              className="w-full sm:w-auto px-8 py-4 text-xs font-semibold tracking-wider uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Explore Preview</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================================== */}
          {/* PREMIUM APP PREVIEW / MOCKUP                                   */}
          {/* ============================================================== */}
          <div id="interface-preview" className="relative mt-8 scroll-item">
            
            <div className="relative z-15 max-w-5xl mx-auto bg-white border border-neutral-200 rounded-[32px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.08)] text-left">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    #
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-black">global_chat</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                        Live Room
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">All verified ChatPro community members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono text-neutral-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span>Real-time onSnapshot</span>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6">
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center text-xs font-bold shrink-0">
                    E
                  </div>
                  <div className="p-4 rounded-3xl rounded-tl-sm bg-neutral-50 border border-neutral-200 max-w-md">
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

              {/* Composer */}
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-full bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
                  <span>Message #global_chat...</span>
                  <Radio className="w-3.5 h-3.5 text-neutral-400" />
                </div>
                <button 
                  onClick={onGetStarted}
                  className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                >
                  Send ↵
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* FEATURE REVEALS (Real-Time, Global Chat, Private, Presence, Secure) */}
      {/* ============================================================== */}
      <section id="features" className="py-28 relative z-10 bg-neutral-50 border-t border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-white text-xs font-mono uppercase tracking-wider text-neutral-600 mb-4 inline-block shadow-xs">
              Architectural Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase mt-2">
              Designed for focus.
            </h2>
            <p className="text-sm text-neutral-600 mt-3 font-normal">
              Every card reveals sequentially with high-end Apple-grade transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Feature 1: Real-Time (7 cols) */}
            <div 
              className="md:col-span-7 bg-white border border-neutral-200 rounded-[28px] p-8 sm:p-10 flex flex-col justify-between scroll-item shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all"
              style={{ transitionDelay: '50ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">01 // REAL-TIME</span>
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

            {/* Feature 2: Global Chat (5 cols) */}
            <div 
              className="md:col-span-5 bg-white border border-neutral-200 rounded-[28px] p-8 flex flex-col justify-between scroll-item shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all"
              style={{ transitionDelay: '100ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-6 text-black">
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
                <span className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-600">
                  Public Channel
                </span>
              </div>
            </div>

            {/* Feature 3: Private DMs (5 cols) */}
            <div 
              className="md:col-span-5 bg-white border border-neutral-200 rounded-[28px] p-8 flex flex-col justify-between scroll-item shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all"
              style={{ transitionDelay: '150ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-6 text-black">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">03 // PRIVATE DMs</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-black mt-1 mb-3">
                  Direct conversations with real people.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Deterministic direct threads using sorted participant IDs.
                </p>
              </div>
              <div className="mt-6 font-mono text-xs text-neutral-400">
                <span>[uidA, uidB].sort().join('_')</span>
              </div>
            </div>

            {/* Feature 4: Secure & Roles (7 cols) */}
            <div 
              className="md:col-span-7 bg-white border border-neutral-200 rounded-[28px] p-8 sm:p-10 flex flex-col justify-between scroll-item shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all"
              style={{ transitionDelay: '200ms' }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6 shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">04 // SECURE & GOVERNANCE</span>
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
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-mono">MAINTAINER</span>
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-mono">MEMBER</span>
              </div>
            </div>

            {/* Feature 5: Presence (12 cols) */}
            <div 
              className="md:col-span-12 bg-white border border-neutral-200 rounded-[28px] p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 scroll-item shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all"
              style={{ transitionDelay: '250ms' }}
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black shrink-0">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-black">
                    Live Presence & Status
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
                    Know who is online instantly with automatic browser unload heartbeats and visibility detection.
                  </p>
                </div>
              </div>
              <button
                onClick={onGetStarted}
                className="px-7 py-3 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-md"
              >
                Launch ChatPro
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* AUTHENTICATION PORTAL                                          */}
      {/* ============================================================== */}
      <section id="register-login-section" className="py-24 relative z-10">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-mono uppercase tracking-wider text-neutral-600 mb-3 inline-block">
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
                className="w-full py-3.5 px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Google 1-Click Sign In</span>
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

            <div className="grid grid-cols-2 p-1 bg-neutral-100 border border-neutral-200 rounded-full mb-5 text-xs font-mono uppercase">
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
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
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
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black font-mono transition-colors"
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
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
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
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
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

      {/* ============================================================== */}
      {/* FOOTER                                                         */}
      {/* ============================================================== */}
      <footer className="py-16 border-t border-neutral-200 bg-neutral-50 relative z-10">
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
              <button onClick={() => scrollTo('interface-preview')} className="hover:text-black transition-colors">Product</button>
              <button onClick={() => scrollTo('features')} className="hover:text-black transition-colors">Features</button>
              <button onClick={() => scrollTo('security')} className="hover:text-black transition-colors">Security</button>
              <span className="hover:text-black cursor-default">Privacy</span>
              <span className="hover:text-black cursor-default">Terms</span>
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
