import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, User, UserX, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAnonymously, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const clearStatus = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const complete = () => {
    onClose();
    onSuccess?.();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearStatus();
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Enter your email and password.');
        }
        await loginWithEmail(email, password);
        complete();
      } else if (mode === 'register') {
        if (!displayName.trim()) throw new Error('Enter your display name.');
        if (username.trim().length < 3) throw new Error('Username must be at least 3 characters.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        await registerWithEmail(email, password, displayName, username);
        complete();
      } else {
        if (!email.trim()) throw new Error('Enter your account email.');
        await resetPassword(email);
        setSuccessMessage('Password reset link sent. Check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const runProvider = async (callback: () => Promise<void>, fallback: string) => {
    clearStatus();
    setLoading(true);
    try {
      await callback();
      complete();
    } catch (err: any) {
      setError(err.message || fallback);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-overlay" role="presentation" onClick={onClose}>
      <div className="auth-shell" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => e.stopPropagation()}>
        <aside className="auth-aside">
          <div className="auth-aside-badge">ChatPro</div>
          <h2>Welcome back to your best conversations.</h2>
          <p>Private rooms, secure messaging, and a cleaner way to work with your team in real time.</p>
          <div className="auth-aside-list">
            <span><Check size={16} /> Private-by-default chat spaces</span>
            <span><Check size={16} /> Shared rooms and direct messaging</span>
            <span><Check size={16} /> Fast access across devices</span>
          </div>
        </aside>

        <div className="auth-form-wrap">
          <button type="button" className="auth-close" onClick={onClose} aria-label="Close authentication dialog">
            <X size={16} />
          </button>

          <div className="auth-heading">
            <div className="auth-brand-mark">C</div>
            <h1 id="auth-title">{mode === 'forgot' ? 'Reset password' : mode === 'register' ? 'Create account' : 'Sign in'}</h1>
          </div>

          {mode !== 'forgot' && (
            <div className="auth-tabs" aria-label="Authentication mode selector">
              <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); resetForm(); }}>Login</button>
              <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); resetForm(); }}>Register</button>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-status auth-status-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-status auth-status-success">
                <Check size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {mode === 'register' && (
              <>
                <label>
                  <span>Display name</span>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane Doe" />
                </label>
                <label>
                  <span>Username</span>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="janedoe" />
                </label>
              </>
            )}

            <label>
              <span>Email</span>
              <div className="input-with-icon">
                <Mail size={16} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </label>

            {mode !== 'forgot' && (
              <label>
                <span>Password</span>
                <div className="auth-password">
                  <Lock size={16} className="auth-lock-icon" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'register' && (
              <label>
                <span>Confirm password</span>
                <div className="auth-password">
                  <Lock size={16} className="auth-lock-icon" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
                </div>
              </label>
            )}

            {mode === 'login' && (
              <button type="button" className="auth-forgot" onClick={() => { setMode('forgot'); resetForm(); }}>
                Forgot password?
              </button>
            )}

            {mode === 'forgot' && (
              <button type="button" className="auth-back" onClick={() => { setMode('login'); resetForm(); }}>
                Back to login
              </button>
            )}

            <button type="submit" className="auth-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <ArrowRight size={16} />}
              <span>{mode === 'forgot' ? 'Send reset link' : mode === 'register' ? 'Create account' : 'Continue'}</span>
            </button>

            {mode !== 'forgot' && (
              <>
                <div className="auth-divider">or continue with</div>

                <div className="auth-provider-grid">
                  <button type="button" className="auth-provider" onClick={() => runProvider(() => loginWithGoogle(), 'Google sign-in failed.')}>
                    <User size={16} />
                    Google
                  </button>
                  <button type="button" className="auth-provider" onClick={() => runProvider(() => loginAnonymously(), 'Guest sign-in failed.')}>
                    <UserX size={16} />
                    Guest
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
