import React, { useEffect, useState } from 'react';
import { Sparkles, X, Mail, Lock, AlertCircle } from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, googleProvider } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function formatAuthError(err: unknown, fallback: string): string {
  const code = err && typeof err === 'object' && 'code' in err ? String((err as any).code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by the browser. Allow popups or use email sign-in.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in window was closed before completing.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Firebase Authentication. Check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    default:
      return err instanceof Error && err.message ? err.message : fallback;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setMessage('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setMessage('Signed in successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (loading) return;
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err: unknown) {
      setError(formatAuthError(err, 'Failed to send password reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#E9ECE8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#123D32] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 end-6 p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#C5A45D] text-[#123D32] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">LifeFlow Cloud Account</h2>
              <p className="text-xs text-[#C5A45D]">Secure Multi-Device Real-Time Sync</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 border border-neutral-200 rounded-2xl font-semibold text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3 shadow-xs disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.23 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.13 0 9.83 0 11.6s.43 3.47 1.18 4.99l4.09-2.35z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-4 text-xs text-neutral-400 uppercase font-medium">Or email</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@lifeflow.global"
                  className="w-full ps-10 pe-4 py-2.5 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleForgotPassword}
                    className="text-xs text-[#123D32] hover:underline font-medium disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute start-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-10 pe-4 py-2.5 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#123D32] text-white rounded-2xl font-bold text-sm hover:bg-[#1a5244] transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Cloud Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
              }}
              className="text-xs text-neutral-600 hover:text-[#123D32] font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

