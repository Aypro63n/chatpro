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

  // IntersectionObserver for snappy scroll reveal (150-250ms cubic-bezier transitions)
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // Unobserve once revealed for peak performance
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -20px 0px',
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

  return (
    <div ref={containerRef} className="w-full bg-[#000000] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Background Soft Diffused Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[500px] bg-gradient-to-r from-white/[0.04] to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[70%] -right-40 w-[600px] h-[500px] bg-gradient-to-l from-white/[0.04] to-transparent rounded-full blur-[140px]" />
      </div>

      {/* ============================================================== */}
      {/* 1. HERO SECTION (Massive headline, pill CTAs, fluid visuals)   */}
      {/* ============================================================== */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-xl text-xs font-medium text-neutral-300 mb-8 shadow-[0_4px_20px_rgba(255,255,255,0.05)]">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="tracking-wide">Next-Generation Real-Time Messaging</span>
          </div>

          {/* Masked Line-Up Reveal Headline */}
          <div className="overflow-hidden mb-2">
            <h1 className="animate-line-up text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white leading-[0.95]">
              Real people.
            </h1>
          </div>
          <div className="overflow-hidden mb-8">
            <h1 className="animate-line-up-delayed text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-600 bg-clip-text text-transparent leading-[0.95]">
              Real conversations.
            </h1>
          </div>

          {/* Supporting Copy */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-400 font-normal leading-relaxed mb-10">
            A fluid, private, and distraction-free communication environment. Designed with organic curves, sub-100ms synchronization, and server-enforced role permissions.
          </p>

          {/* Pill-Shaped CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 text-xs font-bold tracking-wider uppercase btn-mono-primary rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
              <span>Start Chatting</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('product')}
              className="w-full sm:w-auto px-8 py-4 text-xs font-semibold tracking-wider uppercase btn-mono-secondary rounded-full flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Fluid System</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================================== */}
          {/* FLUID VISUAL ELEMENT: Overlapping floating cards with wavy SVG  */}
          {/* ============================================================== */}
          <div id="product" className="relative mt-8 scroll-item">
            
            {/* Wavy Decorative SVG Connecting Lines */}
            <svg 
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 pointer-events-none opacity-40 z-0" 
              viewBox="0 0 1000 240" 
              fill="none"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path 
                d="M 50 120 C 250 20, 350 220, 500 120 C 650 20, 750 220, 950 120" 
                stroke="url(#waveGrad)" 
                strokeWidth="1.5" 
                strokeDasharray="4 6"
              />
              <circle cx="500" cy="120" r="4" fill="#ffffff" />
              <circle cx="270" cy="90" r="3" fill="#ffffff" opacity="0.6" />
              <circle cx="730" cy="150" r="3" fill="#ffffff" opacity="0.6" />
            </svg>

            {/* Overlapping Curved Floating Containers */}
            <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Main Floating Center Mockup (8 Cols) */}
              <div className="lg:col-span-8 fluid-card p-6 sm:p-8 backdrop-blur-2xl text-left relative overflow-hidden">
                
                {/* Header of Mockup */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-white">
                      #
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">global_chat</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 border border-white/15 text-neutral-300">
                          Live Room
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">All verified ChatPro community members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
                    <span>Real-time onSnapshot</span>
                  </div>
                </div>

                {/* Overlapping Messages Stream */}
                <div className="space-y-4">
                  {/* Message Bubble 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 border border-white/20 shrink-0 flex items-center justify-center text-xs font-bold">
                      E
                    </div>
                    <div className="p-4 rounded-3xl rounded-tl-sm bg-white/5 border border-white/10 max-w-md shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-white">elena_rostova</span>
                        <span className="text-[10px] text-neutral-400">10:24 AM</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        The fluid curves and soft diffused drop shadows make this interface feel effortlessly modern.
                      </p>
                    </div>
                  </div>

                  {/* Message Bubble 2 (Current user outgoing) */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="p-4 rounded-3xl rounded-tr-sm bg-white text-black font-medium max-w-md shadow-[0_10px_25px_rgba(255,255,255,0.15)]">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="font-bold text-xs text-black">alex_chen</span>
                        <span className="text-[10px] text-neutral-700 flex items-center gap-1">
                          Just now <CheckCheck className="w-3.5 h-3.5 text-black" />
                        </span>
                      </div>
                      <p className="text-xs text-black leading-relaxed">
                        Completely smooth. Zero blocky sharp corners anywhere—pure pill buttons and continuous curves.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white text-black border border-white/30 shrink-0 flex items-center justify-center text-xs font-bold">
                      A
                    </div>
                  </div>

                  {/* Typing Indicator Pill */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
                      </span>
                      <span>David is typing...</span>
                    </div>
                  </div>
                </div>

                {/* Rounded Composer Mock */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="flex-1 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400 flex items-center justify-between">
                    <span>Message #global_chat...</span>
                    <Radio className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                  <button 
                    onClick={onGetStarted}
                    className="px-5 py-2.5 rounded-full btn-mono-primary text-xs font-bold uppercase cursor-pointer shrink-0"
                  >
                    Send ↵
                  </button>
                </div>

              </div>

              {/* Side Floating Layered Cards (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Floating Card: Direct Message Preview */}
                <div className="fluid-card p-6 backdrop-blur-2xl text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                        D
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">david_k</h4>
                        <span className="text-[10px] text-neutral-300 font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] inline-block" />
                          Online
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono border border-white/15 bg-white/5 text-neutral-300">
                      DIRECT
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 bg-white/5 p-3 rounded-2xl border border-white/10 mb-3">
                    "All role permissions are fully active in Firestore security rules."
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono">
                    <span>END-TO-END</span>
                    <span>18MS STREAM</span>
                  </div>
                </div>

                {/* Floating Card: Role Authority Pill */}
                <div className="fluid-card p-6 backdrop-blur-2xl text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white uppercase">Hierarchy Gate</h4>
                      <p className="text-[11px] text-neutral-400">4-Tier Downward Control</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono pt-3 border-t border-white/10">
                    <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold">OWNER (4)</span>
                    <span className="text-neutral-500">→</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px]">ADMIN (3)</span>
                    <span className="text-neutral-500">→</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 text-[10px]">MAINTAINER</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ASYMMETRICAL FLOATING FEATURES (Generous 28-32px corners)   */}
      {/* ============================================================== */}
      <section id="features" className="py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 inline-block">
              Architectural Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase mt-2">
              Fluid, layered precision.
            </h2>
            <p className="text-sm text-neutral-400 mt-3 font-normal">
              Asymmetrical floating structures designed for real human conversations without artificial clutter.
            </p>
          </div>

          {/* Asymmetrical Floating Bento Cards with Staggered Delays & Wavy Connecting Paths */}
          <div className="relative">
            
            {/* Wavy Connecting SVG Line Weaving Through Cards */}
            <svg 
              className="absolute -top-6 left-0 w-full h-[600px] pointer-events-none opacity-25 hidden md:block z-0" 
              viewBox="0 0 1000 600" 
              fill="none"
            >
              <defs>
                <linearGradient id="featuresWave" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#888888" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path 
                d="M 100 100 C 400 30, 600 250, 850 180 S 300 450, 700 520" 
                stroke="url(#featuresWave)" 
                strokeWidth="1.5" 
                strokeDasharray="6 8"
              />
              <circle cx="100" cy="100" r="4" fill="#ffffff" />
              <circle cx="550" cy="190" r="4" fill="#ffffff" />
              <circle cx="850" cy="180" r="4" fill="#ffffff" />
              <circle cx="450" cy="460" r="4" fill="#ffffff" />
              <circle cx="700" cy="520" r="4" fill="#ffffff" />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative z-10">
              
              {/* Card 1: Large Anchor (7 Cols) */}
              <div 
                className="md:col-span-7 fluid-card p-8 sm:p-10 flex flex-col justify-between scroll-item relative overflow-hidden group"
                style={{ transitionDelay: '50ms' }}
              >
                {/* Subtle Monochrome Vector Illustration in background */}
                <div className="absolute top-4 right-4 w-36 h-36 opacity-[0.06] group-hover:opacity-[0.14] transition-opacity pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-white">
                    <circle cx="50" cy="50" r="45" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="30" strokeWidth="1" />
                    <circle cx="50" cy="50" r="15" strokeWidth="1.5" />
                    <path d="M 50 5 L 50 95 M 5 50 L 95 50" strokeWidth="0.75" />
                  </svg>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">01 // INSTANT LATENCY</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
                    Sub-100ms Bidirectional Sync
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                    Powered by Firestore real-time onSnapshot listeners. Every message delivered to User B in milliseconds without needing to refresh or poll.
                  </p>
                </div>

                {/* Graphical Pill Wave */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-mono text-neutral-300">Continuous WebSocket Stream</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-neutral-300 border border-white/10">
                    Zero Latency Gap
                  </span>
                </div>
              </div>

              {/* Card 2: Medium Top Right (5 Cols) */}
              <div 
                className="md:col-span-5 fluid-card p-8 flex flex-col justify-between scroll-item relative overflow-hidden group"
                style={{ transitionDelay: '100ms' }}
              >
                {/* Monochrome Radial Grid Illustration */}
                <div className="absolute top-3 right-3 w-28 h-28 opacity-[0.06] group-hover:opacity-[0.14] transition-opacity pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-white">
                    <path d="M 10 50 Q 50 10 90 50 T 170 50" strokeWidth="1" />
                    <path d="M 10 70 Q 50 30 90 70 T 170 70" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6 text-white">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">02 // PUBLIC COMMONS</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 mb-3">
                    Global Shared Channel
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    A persistent town hall for all authenticated users. Automatically loaded as the primary channel upon logging in.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400">
                    Shared Collection
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400">
                    Moderator Guarded
                  </span>
                </div>
              </div>

              {/* Card 3: Medium Bottom Left (5 Cols) */}
              <div 
                className="md:col-span-5 fluid-card p-8 flex flex-col justify-between scroll-item relative overflow-hidden group"
                style={{ transitionDelay: '150ms' }}
              >
                {/* Minimalist Vector Node Network */}
                <div className="absolute bottom-3 right-3 w-32 h-32 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-white">
                    <line x1="20" y1="20" x2="80" y2="80" strokeWidth="1" />
                    <line x1="20" y1="80" x2="80" y2="20" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="20" cy="20" r="4" fill="currentColor" />
                    <circle cx="80" cy="80" r="4" fill="currentColor" />
                    <circle cx="50" cy="50" r="6" strokeWidth="1" />
                  </svg>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6 text-white">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">03 // DIRECT ISOLATION</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 mb-3">
                    Deterministic Direct Chat
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Both users connect to the exact same sorted conversation document ID. No duplicate or ghost chat rooms.
                  </p>
                </div>

                <div className="mt-6 font-mono text-xs text-neutral-500">
                  <span>[uidA, uidB].sort().join('_')</span>
                </div>
              </div>

              {/* Card 4: Wide Bottom Right (7 Cols) */}
              <div 
                className="md:col-span-7 fluid-card p-8 sm:p-10 flex flex-col justify-between scroll-item relative overflow-hidden group"
                style={{ transitionDelay: '200ms' }}
              >
                {/* Minimalist Shield Invariant Geometric Vector */}
                <div className="absolute top-4 right-4 w-32 h-32 opacity-[0.06] group-hover:opacity-[0.14] transition-opacity pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-full h-full text-white">
                    <path d="M 50 10 L 85 25 V 55 C 85 75 50 92 50 92 C 50 92 15 75 15 55 V 25 Z" strokeWidth="1.2" />
                    <path d="M 50 25 L 75 35 V 55 C 75 70 50 82 50 82 C 50 82 25 70 25 55 V 35 Z" strokeWidth="0.8" strokeDasharray="3 3" />
                  </svg>
                </div>

                <div>
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider">04 // HIERARCHICAL SECURITY</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
                    Server-Authoritative RBAC
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                    Strict 4-level permissions verified server-side. Users cannot elevate their own privileges or modify users with equal authority.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-white text-black text-xs font-bold font-mono">OWNER</span>
                  <span className="px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-mono">ADMIN</span>
                  <span className="px-3.5 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-mono">MAINTAINER</span>
                  <span className="px-3.5 py-1 rounded-full bg-white/5 text-neutral-400 text-xs font-mono">MEMBER</span>
                </div>
              </div>

              {/* Card 5: Full Width Horizontal Ribbon (12 Cols) */}
              <div 
                className="md:col-span-12 fluid-card p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 scroll-item"
                style={{ transitionDelay: '250ms' }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Live Heartbeat & Unload Presence
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                      Online status syncs automatically via visibility changes and browser unload hooks. No stale indicator artifacts.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onGetStarted}
                  className="px-6 py-3 rounded-full btn-mono-primary text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Experience Live Demo
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. PRODUCT PHILOSOPHY (Editorial curved statement)             */}
      {/* ============================================================== */}
      <section className="py-28 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="fluid-card p-10 sm:p-16 text-center backdrop-blur-2xl scroll-item">
            <span className="px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-widest text-neutral-400 inline-block mb-6">
              Core Philosophy
            </span>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[0.95] text-white mb-6">
              Less noise.<br />
              <span className="bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-600 bg-clip-text text-transparent">
                More conversation.
              </span>
            </h2>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-400 leading-relaxed font-normal">
              Chatpro focuses on what messaging should have been from the beginning: deterministic delivery, true privacy, real humans, and respectful software.
            </p>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. ROLE SYSTEM SECTION (Power, with boundaries)                */}
      {/* ============================================================== */}
      <section id="roles" className="py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 inline-block">
              Governance & Permissions
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase mt-2">
              Power, with boundaries.
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto mt-2">
              Every action flows strictly downward. No administrator can touch another administrator of equal or higher authority.
            </p>
          </div>

          {/* Vertical Hierarchy with Generous Curves */}
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* Level 4: Owner */}
            <div 
              className="fluid-card p-6 flex items-center justify-between scroll-item"
              style={{ transitionDelay: '50ms' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  4
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white uppercase">Owner</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white text-black font-bold">
                      HIGHEST AUTHORITY
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Appoints and demotes Admins, maintains governance, irreversible ownership.
                  </p>
                </div>
              </div>
              <Shield className="w-5 h-5 text-white shrink-0 ml-4" />
            </div>

            {/* Level 3: Admin */}
            <div 
              className="fluid-card p-6 flex items-center justify-between scroll-item"
              style={{ transitionDelay: '100ms' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white uppercase">Admin</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-neutral-200">
                      DOWNWARD ONLY
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Manages Maintainers & Members. Cannot modify, kick, or ban other Admins.
                  </p>
                </div>
              </div>
              <Sliders className="w-5 h-5 text-neutral-400 shrink-0 ml-4" />
            </div>

            {/* Level 2: Maintainer */}
            <div 
              className="fluid-card p-6 flex items-center justify-between scroll-item"
              style={{ transitionDelay: '150ms' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 text-neutral-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white uppercase">Maintainer</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-neutral-400">
                      MODERATION
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Moderates public chats, deletes inappropriate content, temporarily mutes members.
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-neutral-400 shrink-0 ml-4" />
            </div>

            {/* Level 1: Member */}
            <div 
              className="fluid-card p-6 flex items-center justify-between scroll-item"
              style={{ transitionDelay: '200ms' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-neutral-400 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white uppercase">Member</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-neutral-500">
                      STANDARD
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Full messaging access, 1-on-1 private threads, presence, and profile management.
                  </p>
                </div>
              </div>
              <Users className="w-5 h-5 text-neutral-400 shrink-0 ml-4" />
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. INSTANT ACCESS / SIGN IN CARD (32px pill design)           */}
      {/* ============================================================== */}
      <section id="register-login-section" className="py-24 relative z-10">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8 scroll-item">
            <span className="px-3.5 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 inline-block">
              Entry Portal
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
              Join ChatPro
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Connect to live messaging with your preferred credentials.
            </p>
          </div>

          {/* Fluid Floating Auth Card */}
          <div className="fluid-card p-8 backdrop-blur-2xl scroll-item">
            
            {/* Quick 1-Click Buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-full btn-mono-secondary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Google 1-Click Sign In</span>
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-full border border-white/10 bg-white/5 hover:border-white text-neutral-300 hover:text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Instant Guest Mode</span>
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#000000] px-3 text-[10px] text-neutral-500 font-mono uppercase">
                or email authentication
              </span>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 mb-4 rounded-2xl bg-white/5 border border-white/20 text-white text-xs">
                {authError}
              </div>
            )}

            {/* Tab switch pills */}
            <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-full mb-5 text-xs font-mono uppercase">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(null); }}
                className={`py-2 rounded-full transition-all cursor-pointer ${authTab === 'login' ? 'bg-white text-black font-bold shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setAuthError(null); }}
                className={`py-2 rounded-full transition-all cursor-pointer ${authTab === 'register' ? 'bg-white text-black font-bold shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authTab === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">Full Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="alex_chen"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white font-mono transition-colors"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3.5 text-xs font-bold uppercase tracking-wider btn-mono-primary rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{authTab === 'login' ? 'Sign In to ChatPro' : 'Create Account'}</span>
              </button>
            </form>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. FOOTER                                                     */}
      {/* ============================================================== */}
      <footer className="py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="fluid-card p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-tight text-white">
                  CHATPRO
                </div>
                <p className="text-[11px] text-neutral-400">
                  Real people. Real conversations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
              <button onClick={() => scrollTo('product')} className="hover:text-white transition-colors">Product</button>
              <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollTo('roles')} className="hover:text-white transition-colors">Roles</button>
              <span className="hover:text-white cursor-default">Privacy</span>
              <span className="hover:text-white cursor-default">Terms</span>
            </div>

            <div className="text-[11px] text-neutral-500 font-mono">
              © 2026 Chatpro
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
