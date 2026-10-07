import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  AtSign, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  Loader2, 
  UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess 
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAnonymously, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUsernameChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await loginWithEmail(email, password);
        onClose();
        if (onSuccess) onSuccess();
      } else if (mode === 'register') {
        if (!displayName.trim()) throw new Error('Please enter your full name.');
        if (!username.trim() || username.length < 3) throw new Error('Username must be at least 3 characters.');
        if (!email.trim()) throw new Error('Please enter a valid email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');

        const photoURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        await registerWithEmail(email, password, displayName, username, photoURL);
        onClose();
        if (onSuccess) onSuccess();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your account email.');
        await resetPassword(email);
        setSuccessMessage('Password reset link sent. Check your email inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAnonymously();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Guest sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in-fast font-sans text-white">
      
      <div className="relative w-full max-w-md fluid-card bg-black/95 p-6 sm:p-8 text-xs">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-full bg-white text-black flex items-center justify-center font-bold text-sm mb-3 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            C
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">
            {mode === 'login' && 'Sign In to ChatPro'}
            {mode === 'register' && 'Register Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-[11px] text-neutral-400 mt-1">
            {mode === 'login' && 'Enter credentials to connect to real-time streams'}
            {mode === 'register' && 'Deterministic human-to-human messaging platform'}
            {mode === 'forgot' && 'Enter your registered email address'}
          </p>
        </div>

        {/* Error / Success message */}
        {error && (
          <div className="mb-4 p-3 bg-white/5 border border-white/20 text-white text-[11px] rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-white/5 border border-white/20 text-white text-[11px] rounded-2xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-white" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode switcher tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-full mb-5 text-xs font-mono uppercase">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-full transition-all cursor-pointer ${mode === 'login' ? 'bg-white text-black font-bold shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 rounded-full transition-all cursor-pointer ${mode === 'register' ? 'bg-white text-black font-bold shadow-md' : 'text-neutral-400 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">
                  Username Handle
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="alex_chen"
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1 px-3">
                <label className="text-[10px] uppercase font-mono text-neutral-400">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 ml-3">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 text-xs font-bold tracking-wider uppercase btn-mono-primary rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Register Profile'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Back to sign in from forgot mode */}
        {mode === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className="text-[11px] text-neutral-400 hover:text-white uppercase font-mono"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Google & Guest Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-full btn-mono-secondary text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAnonymousSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-white/5 hover:border-white text-neutral-300 hover:text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5 shrink-0" />
                <span>Continue as Guest (Anonymous)</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
