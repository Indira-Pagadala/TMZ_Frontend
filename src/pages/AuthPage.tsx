import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = (location.state as { redirect?: string })?.redirect || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        showToast('Welcome back!', 'success');
      } else {
        await signUp(email.trim(), password);
        showToast('Account created! Welcome to The Modern Stories.', 'success');
      }
      navigate(redirect);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10 animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center mb-4 animate-glow-pulse">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl text-primary">The Modern Stories</h1>
            <p className="text-sm text-muted mt-1">
              {mode === 'signin' ? 'Welcome back. Continue your journey.' : 'Join us. Start your reading journey.'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--btn-secondary)' }}>
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-body transition-all ${mode === 'signin' ? 'bg-brand-primary text-white shadow-md' : 'text-secondary'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-body transition-all ${mode === 'signup' ? 'bg-brand-primary text-white shadow-md' : 'text-secondary'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full btn-secondary mb-4 flex items-center justify-center gap-3 py-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
