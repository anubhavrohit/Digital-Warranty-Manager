'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, login, loginAsDemoUser, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      {/* Decorative ambient elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-sunshine/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-carrot/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-dark p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-sunshine flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-forest tracking-tight">
              Warranty<span className="text-carrot">Vault</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-forest">Welcome Back</h2>
          <p className="text-xs text-forest/70 mt-1">
            Sign in to access your digital warranties & bills
          </p>
        </div>

        {/* Demo Account Quick CTA Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-sunshine-light border border-sunshine/60 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-forest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-carrot" />
              College Demo Mode
            </span>
            <span className="text-[10px] font-bold text-forest/70 uppercase">Zero Setup</span>
          </div>
          <p className="text-xs text-forest/80 mb-2.5 leading-relaxed">
            Presenting or testing? Click below to instantly log in with sample product data.
          </p>
          <Button
            type="button"
            variant="sunshine"
            size="sm"
            onClick={handleDemoLogin}
            className="w-full text-xs shadow-none border border-sunshine/60"
          >
            Instant Demo Account Login &rarr;
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-forest/90">
                Password <span className="text-tomato">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-carrot hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-dark/60 text-center text-xs text-forest/70">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-carrot hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
