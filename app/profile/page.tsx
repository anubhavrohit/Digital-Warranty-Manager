'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/warranty-utils';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  User,
  Mail,
  Calendar,
  KeyRound,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, logout, updateProfileName, resetPassword, seedDemoData, isDemoMode } =
    useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [isResettingPass, setIsResettingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setName(user.name);
    }
  }, [user, loading, router]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsUpdatingName(true);
      await updateProfileName(name.trim());
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      setIsResettingPass(true);
      await resetPassword(user.email);
      setPassSuccess(true);
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleSeedData = () => {
    seedDemoData();
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-cream flex font-sans">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-forest/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              User Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-forest/70">
              Manage your personal account credentials and demo state
            </p>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-cream-dark/60">
              <div className="w-16 h-16 rounded-full bg-forest text-sunshine text-2xl font-extrabold flex items-center justify-center shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-forest">{user.name}</h2>
                <p className="text-xs text-forest/70 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-forest/60" />
                  {user.email}
                </p>
                <p className="text-[11px] text-forest/60 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-forest/60" />
                  Account Created: {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Edit Name Form */}
            <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest">
                Update Display Name
              </h3>

              {nameSuccess && (
                <div className="p-3 rounded-xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile name updated successfully!</span>
                </div>
              )}

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Button variant="secondary" size="sm" type="submit" isLoading={isUpdatingName}>
                Save Profile Name
              </Button>
            </form>
          </div>

          {/* Security & Password Reset */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-2">
              Security & Credentials
            </h3>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Password reset link sent to {user.email}!</span>
              </div>
            )}

            <p className="text-xs text-forest/70 leading-relaxed max-w-md">
              Need to change your account password? We will email you a secure reset link.
            </p>

            <Button
              variant="outline"
              size="sm"
              icon={KeyRound}
              onClick={handleChangePassword}
              isLoading={isResettingPass}
            >
              Send Password Reset Email
            </Button>
          </div>

          {/* Demo Seed Generator */}
          <div className="bg-sunshine-light rounded-3xl border border-sunshine/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-forest font-extrabold text-sm">
              <Sparkles className="w-5 h-5 text-carrot" />
              <span>College Presentation Seed Tool</span>
            </div>

            {seedSuccess && (
              <div className="p-3 rounded-xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sample demo products populated into your vault!</span>
              </div>
            )}

            <p className="text-xs text-forest/80 leading-relaxed max-w-xl">
              Instantly seed sample warranties (ASUS TUF Laptop, Samsung Refrigerator, iPhone 15 Pro, Sony Headphones, LG Washing Machine) for live project demonstration.
            </p>

            <Button variant="sunshine" size="sm" onClick={handleSeedData}>
              Load Sample Demo Data
            </Button>
          </div>

          {/* Account Logout */}
          <div className="pt-4 flex justify-end">
            <Button variant="tomato" size="md" icon={LogOut} onClick={handleLogout}>
              Logout of WarrantyVault
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
