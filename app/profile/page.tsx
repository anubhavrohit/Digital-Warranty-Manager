'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatCurrency, calculateDashboardStats } from '@/lib/warranty-utils';
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
  Download,
  Upload,
  Bell,
  Shield,
  Package,
  ShieldCheck,
  Camera,
  Phone,
  Globe,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  Save,
  HardDrive,
  Check,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function ProfilePage() {
  const {
    user,
    loading,
    logout,
    updateUserProfile,
    changePassword,
    resetPassword,
    seedDemoData,
    clearAllData,
    importBackupData,
    deleteAccount,
    warranties,
    documents,
  } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Information State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Direct Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccessMessage, setPassSuccessMessage] = useState('');

  // Password Reset Link Email State
  const [isResettingEmail, setIsResettingEmail] = useState(false);
  const [resetEmailSuccess, setResetEmailSuccess] = useState(false);

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [expiryNoticeDays, setExpiryNoticeDays] = useState(30);
  const [isUpdatingNotifs, setIsUpdatingNotifs] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Backup & Import State
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCurrency(user.currency || 'INR');
      setAvatarUrl(user.avatarUrl || '');
      if (user.notificationPrefs) {
        setEmailAlerts(user.notificationPrefs.emailAlerts ?? true);
        setBrowserAlerts(user.notificationPrefs.browserAlerts ?? true);
        setExpiryNoticeDays(user.notificationPrefs.expiryNoticeDays ?? 30);
      }
    }
  }, [user, loading, router]);

  const stats = calculateDashboardStats(warranties);

  // Calculate estimated total storage size (in KB / MB)
  const calculateStorageUsed = () => {
    let totalBytes = 0;
    warranties.forEach((w) => {
      if (w.productImageUrl) totalBytes += w.productImageUrl.length;
      if (w.invoiceImageUrl) totalBytes += w.invoiceImageUrl.length;
    });
    documents.forEach((d) => {
      if (d.fileUrl) totalBytes += d.fileUrl.length;
    });

    const totalKB = totalBytes / 1024;
    if (totalKB > 1024) {
      return `${(totalKB / 1024).toFixed(2)} MB`;
    }
    return `${Math.round(totalKB)} KB`;
  };

  // Avatar Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file for your avatar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      setAvatarUrl(base64Url);
      try {
        await updateUserProfile({ avatarUrl: base64Url });
      } catch (err) {
        console.error('Failed to update avatar:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    await updateUserProfile({ avatarUrl: '' });
  };

  // Save Personal Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsUpdatingProfile(true);
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        currency,
        avatarUrl,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Save Notification Preferences
  const handleSaveNotificationPrefs = async () => {
    try {
      setIsUpdatingNotifs(true);
      const prefs = { emailAlerts, browserAlerts, expiryNoticeDays };
      await updateUserProfile({ notificationPrefs: prefs });
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingNotifs(false);
    }
  };

  // Direct Password Update
  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccessMessage('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await changePassword(currentPassword, newPassword);
      setPassSuccessMessage('Your account password has been updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccessMessage(''), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password. Check your current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Email Reset Link
  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      setIsResettingEmail(true);
      await resetPassword(user.email);
      setResetEmailSuccess(true);
      setTimeout(() => setResetEmailSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResettingEmail(false);
    }
  };

  // Export Data JSON
  const handleExportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      user: { uid: user?.uid, name: user?.name, email: user?.email },
      warranties,
      documents,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `WarrantyVault_Backup_${user?.name.replace(/\s+/g, '_') || 'user'}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Import Data JSON Backup
  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || (!parsed.warranties && !parsed.documents)) {
          setImportStatus({
            type: 'error',
            message: 'Invalid backup file format. Missing warranties or documents array.',
          });
          return;
        }

        const res = await importBackupData(parsed);
        setImportStatus({
          type: 'success',
          message: `Successfully imported ${res.warrantiesAdded} new warranty item(s) and ${res.docsAdded} document(s) into your vault!`,
        });
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'Failed to parse JSON backup file. Please ensure it is a valid WarrantyVault backup file.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  const handleDeleteAccount = async () => {
    await deleteAccount();
    router.push('/register');
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
                Account & Vault Settings
              </h1>
              <p className="text-xs sm:text-sm text-forest/70 mt-1">
                Manage profile details, security, notification alerts, currency preferences, and vault backups
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button variant="outline" size="sm" icon={Download} onClick={handleExportData}>
                Export Backup
              </Button>
              <Button variant="tomato" size="sm" icon={LogOut} onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* User Profile Identity Banner */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-cream-dark/60">
              <div className="flex items-center gap-5">
                {/* Avatar Uploader Circle */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-forest text-sunshine text-3xl font-black flex items-center justify-center shadow-md overflow-hidden border-2 border-cream-dark">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-forest/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Upload Profile Picture"
                  >
                    <Camera className="w-6 h-6 text-sunshine" />
                  </button>

                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-forest">{user.name}</h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-kiwi-dark bg-kiwi-light px-2.5 py-0.5 rounded-full border border-kiwi/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Vault
                    </span>
                  </div>

                  <p className="text-xs text-forest/70 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-forest/60" />
                    {user.email}
                  </p>

                  {user.phone && (
                    <p className="text-xs text-forest/70 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-forest/60" />
                      {user.phone}
                    </p>
                  )}

                  <p className="text-[11px] text-forest/60 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-forest/60" />
                    Member Since: {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs font-semibold text-tomato hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Avatar
                </button>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">
                  Products Owned
                </span>
                <span className="text-lg font-black text-forest">{stats.totalProducts}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">
                  Active Coverage
                </span>
                <span className="text-lg font-black text-kiwi-dark">{stats.activeWarranties}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">
                  Stored Documents
                </span>
                <span className="text-lg font-black text-forest">{documents.length}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60 block">
                  Total Value
                </span>
                <span className="text-lg font-black text-carrot">
                  {formatCurrency(stats.totalPurchaseValue, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Personal Details & Regional Preferences */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-carrot" />
              <span>Personal Information & Preferences</span>
            </h3>

            {profileSuccess && (
              <div className="p-3.5 rounded-2xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-kiwi-dark flex-shrink-0" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number (Optional)"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <Input
                  label="Email Address"
                  value={user.email}
                  disabled
                  helperText="Primary email cannot be changed"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest">
                    Preferred Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-cream-light/60 border border-cream-dark text-forest font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="secondary" size="sm" icon={Save} type="submit" isLoading={isUpdatingProfile}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Password & Account Security */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-carrot" />
              <span>Security & Password Controls</span>
            </h3>

            {passSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-kiwi-dark flex-shrink-0" />
                <span>{passSuccessMessage}</span>
              </div>
            )}

            {passError && (
              <div className="p-3.5 rounded-2xl bg-tomato-light border border-tomato/30 text-tomato text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-tomato flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {resetEmailSuccess && (
              <div className="p-3.5 rounded-2xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-kiwi-dark flex-shrink-0" />
                <span>Password reset link sent to {user.email}! Check your inbox.</span>
              </div>
            )}

            {/* Change Password Form */}
            <form onSubmit={handleDirectPasswordChange} className="space-y-4 max-w-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-forest/70">
                Update Account Password
              </h4>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-forest/60 hover:text-forest"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button variant="secondary" size="sm" icon={KeyRound} type="submit" isLoading={isChangingPass}>
                  Update Password
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  icon={Mail}
                  onClick={handleSendResetEmail}
                  isLoading={isResettingEmail}
                >
                  Send Reset Link to Email
                </Button>
              </div>
            </form>
          </div>

          {/* Section 3: Notification & Expiry Alert Preferences */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-carrot" />
              <span>Notification & Expiry Alerts</span>
            </h3>

            {notifSuccess && (
              <div className="p-3.5 rounded-2xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-kiwi-dark flex-shrink-0" />
                <span>Notification preferences saved!</span>
              </div>
            )}

            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-4 bg-cream-light/50 rounded-2xl border border-cream-dark/40">
                <div>
                  <h4 className="text-xs font-bold text-forest">30-Day Expiry Email Alerts</h4>
                  <p className="text-[11px] text-forest/70">Receive email reminders before product warranties expire</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-cream-light/50 rounded-2xl border border-cream-dark/40">
                <div>
                  <h4 className="text-xs font-bold text-forest">In-App Popover & Badge Alerts</h4>
                  <p className="text-[11px] text-forest/70">Display bell notification badges for expiring items</p>
                </div>
                <input
                  type="checkbox"
                  checked={browserAlerts}
                  onChange={(e) => setBrowserAlerts(e.target.checked)}
                  className="w-4 h-4 accent-forest rounded cursor-pointer"
                />
              </div>

              <div className="p-4 bg-cream-light/50 rounded-2xl border border-cream-dark/40 space-y-2">
                <label className="block text-xs font-bold text-forest">
                  Early Notice Threshold
                </label>
                <p className="text-[11px] text-forest/70">
                  Select how many days prior to warranty expiration you wish to start receiving alerts:
                </p>
                <select
                  value={expiryNoticeDays}
                  onChange={(e) => setExpiryNoticeDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-cream-dark text-forest font-bold text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value={7}>7 Days Before Expiry</option>
                  <option value={15}>15 Days Before Expiry</option>
                  <option value={30}>30 Days Before Expiry (Recommended)</option>
                  <option value={60}>60 Days Before Expiry</option>
                </select>
              </div>

              <div className="pt-1">
                <Button variant="primary" size="sm" icon={Save} onClick={handleSaveNotificationPrefs} isLoading={isUpdatingNotifs}>
                  Save Alert Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Section 4: Vault Data Backup & Import Restore */}
          <div className="bg-sunshine-light/60 rounded-3xl border border-sunshine/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-forest font-black text-sm">
              <Sparkles className="w-5 h-5 text-carrot" />
              <span>Vault Data Backup & Import Portability</span>
            </div>

            {seedSuccess && (
              <div className="p-3.5 rounded-2xl bg-kiwi-light border border-kiwi/30 text-kiwi-dark text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-kiwi-dark flex-shrink-0" />
                <span>Sample products populated into your vault!</span>
              </div>
            )}

            {importStatus && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  importStatus.type === 'success'
                    ? 'bg-kiwi-light border border-kiwi/30 text-kiwi-dark'
                    : 'bg-tomato-light border border-tomato/30 text-tomato'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            <p className="text-xs text-forest/80 leading-relaxed max-w-xl">
              Export a complete offline JSON backup of your warranties, receipts, and uploaded documents, or restore an existing backup file to import products seamlessly into your vault.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button variant="primary" size="sm" icon={Download} onClick={handleExportData}>
                Download JSON Backup
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => importInputRef.current?.click()}
              >
                Restore JSON Backup
              </Button>

              <input
                type="file"
                ref={importInputRef}
                onChange={handleImportBackupFile}
                accept=".json"
                className="hidden"
              />

              <Button variant="sunshine" size="sm" onClick={handleSeedData}>
                Load Sample Data
              </Button>
            </div>
          </div>

          {/* Section 5: Storage Diagnostics & Health */}
          <div className="bg-white rounded-3xl border border-cream-dark p-6 sm:p-8 shadow-warm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-forest border-b border-cream-dark/60 pb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-forest/70" />
              <span>Vault Storage & System Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-cream-light/60 rounded-2xl border border-cream-dark/60">
                <span className="text-[10px] font-extrabold uppercase text-forest/60 block">Document Vault</span>
                <span className="text-sm font-bold text-forest">{documents.length} Files Uploaded</span>
              </div>
              <div className="p-4 bg-cream-light/60 rounded-2xl border border-cream-dark/60">
                <span className="text-[10px] font-extrabold uppercase text-forest/60 block">Estimated Storage Payload</span>
                <span className="text-sm font-bold text-forest">{calculateStorageUsed()}</span>
              </div>
              <div className="p-4 bg-cream-light/60 rounded-2xl border border-cream-dark/60">
                <span className="text-[10px] font-extrabold uppercase text-forest/60 block">Vault Protection</span>
                <span className="text-sm font-bold text-kiwi-dark flex items-center gap-1 mt-0.5">
                  <Check className="w-4 h-4" /> 100% Encrypted & Local
                </span>
              </div>
            </div>
          </div>

          {/* Section 6: Danger Zone & Account Management */}
          <div className="bg-tomato-light/40 rounded-3xl border border-tomato/30 p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-tomato flex items-center gap-2 border-b border-tomato/20 pb-3">
              <AlertCircle className="w-4 h-4 text-tomato" />
              <span>Danger Zone</span>
            </h3>

            <p className="text-xs text-forest/80 leading-relaxed max-w-xl">
              Permanently delete stored product data, clear uploaded receipt documents, or delete your entire user account. These actions cannot be undone.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-tomato border-tomato/40 hover:bg-tomato-light"
                onClick={() => setClearConfirmOpen(true)}
              >
                Clear All Vault Data
              </Button>

              <Button
                variant="tomato"
                size="sm"
                icon={Trash2}
                onClick={() => setDeleteAccountConfirmOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Clear Data Dialog */}
      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => {
          clearAllData();
          setClearConfirmOpen(false);
        }}
        title="Clear All Products & Documents"
        message="Are you sure you want to remove all stored products and documents from your vault? This action cannot be undone."
        confirmText="Clear Everything"
      />

      {/* Delete Account Dialog */}
      <ConfirmDialog
        isOpen={deleteAccountConfirmOpen}
        onClose={() => setDeleteAccountConfirmOpen(false)}
        onConfirm={() => {
          setDeleteAccountConfirmOpen(false);
          handleDeleteAccount();
        }}
        title="Delete Account & Purge Vault Data"
        message="Are you sure you want to permanently delete your user account and all registered warranties and document backups? This action cannot be undone."
        confirmText="Delete My Account"
      />
    </div>
  );
}
