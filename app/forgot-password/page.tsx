'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cream-dark p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-forest text-sunshine flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-forest tracking-tight">
              Warranty<span className="text-carrot">Vault</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-forest">Reset Password</h2>
          <p className="text-xs text-forest/70 mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-kiwi-light rounded-2xl border border-kiwi/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-kiwi mx-auto" />
            <h3 className="text-base font-bold text-forest">Check Your Email</h3>
            <p className="text-xs text-forest/80 leading-relaxed">
              We have sent a password reset link to <strong className="text-forest">{email}</strong>.
            </p>
            <div className="pt-3">
              <Link href="/login">
                <Button variant="secondary" size="sm" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-cream-dark/60 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-carrot transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
