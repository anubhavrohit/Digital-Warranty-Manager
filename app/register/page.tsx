'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { user, register, loginAsDemoUser, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Failed to create account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      {/* Ambient backgrounds */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-kiwi/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-sunshine/30 rounded-full blur-3xl pointer-events-none" />

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
          <h2 className="text-xl font-bold text-forest">Create Your Account</h2>
          <p className="text-xs text-forest/70 mt-1">
            Start organizing product warranties & bills in seconds
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cream-dark/60 text-center text-xs text-forest/70">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-carrot hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
