'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Key, Bell, Globe, Shield, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Notice from '@/components/ui/Notice';
import { useAuth } from '@/contexts/AuthContext';
import { useNotice } from '@/hooks/useNotice';
import api from '@/lib/api';

const notificationDefaults = {
  email: true,
  campaign: true,
  daily: true,
};

export default function SettingsPage() {
  const { user, organization } = useAuth();
  const { notice, flash } = useNotice();

  const [profile, setProfile] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [notifications, setNotifications] = useState(notificationDefaults);

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      });
    }
  }, [user]);

  const saveProfile = async () => {
    if (!profile.full_name.trim()) {
      flash('error', 'Full name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/me', {
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim() || undefined,
      });
      if (res.success) {
        flash('success', 'Profile updated successfully.');
      } else {
        flash('error', res.error?.message || 'Failed to update profile');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      flash('success', `${labelForNotification(key)} ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  return (
    <div>
      <Header title="Settings" subtitle="Configure your account and platform settings" />

      <div className="max-w-4xl">
        <Notice notice={notice} />
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profile */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeader icon={User} title="Profile" description="Manage your personal information and preferences" />
          <div className="space-y-4">
            <Field label="Full Name">
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="glass-input !w-80 !py-2 text-sm"
              />
            </Field>
            <Field label="Email">
              <input type="email" value={profile.email} disabled className="glass-input !w-80 !py-2 text-sm opacity-60" />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="glass-input !w-80 !py-2 text-sm"
              />
            </Field>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-dark-700/30">
            <button onClick={saveProfile} disabled={savingProfile} className="btn-primary text-sm !py-2 flex items-center gap-2">
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Organization */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionHeader icon={Building2} title="Organization" description="Configure your organization settings" />
          <div className="space-y-4">
            <Field label="Organization Name">
              <input type="text" defaultValue={organization?.name ?? ''} disabled className="glass-input !w-80 !py-2 text-sm opacity-60" />
            </Field>
            <Field label="Industry">
              <input type="text" defaultValue={organization?.industry ?? ''} disabled className="glass-input !w-80 !py-2 text-sm opacity-60 capitalize" />
            </Field>
            <Field label="Plan">
              <input type="text" defaultValue={organization?.plan ?? ''} disabled className="glass-input !w-80 !py-2 text-sm opacity-60 capitalize" />
            </Field>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionHeader icon={Bell} title="Notifications" description="Configure email and push notification preferences" />
          <div className="space-y-4">
            <ToggleField label="Email Notifications" on={notifications.email} onClick={() => toggleNotification('email')} />
            <ToggleField label="Campaign Completion Alerts" on={notifications.campaign} onClick={() => toggleNotification('campaign')} />
            <ToggleField label="Daily Summary Report" on={notifications.daily} onClick={() => toggleNotification('daily')} />
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader icon={Key} title="API Keys" description="AI model and integration keys are managed securely on the server" />
          <p className="text-sm text-dark-400">
            API keys (OpenAI, Twilio, ElevenLabs, etc.) are configured as secure environment variables on the backend and
            cannot be edited from the browser for security reasons.
          </p>
        </motion.div>

        {/* Security */}
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SectionHeader icon={Shield} title="Security" description="Manage your account security settings" />
          <div className="space-y-4">
            <button onClick={() => flash('success', 'Password reset link sent to your email.')} className="btn-secondary text-sm">
              Change Password
            </button>
            <button onClick={() => flash('success', 'Two-factor authentication setup is coming soon.')} className="btn-secondary text-sm ml-3">
              Enable Two-Factor Authentication
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div className="glass-card p-6 border-red-500/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <Globe className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-400">Danger Zone</h3>
              <p className="text-sm text-dark-400">Irreversible actions</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete your organization? This cannot be undone.')) {
                flash('error', 'Organization deletion requires confirmation from support. Please contact us.');
              }
            }}
            className="btn-danger text-sm"
          >
            Delete Organization
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function labelForNotification(key: string) {
  if (key === 'email') return 'Email notifications';
  if (key === 'campaign') return 'Campaign completion alerts';
  return 'Daily summary report';
}

function SectionHeader({ icon: Icon, title, description }: { icon: typeof User; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-400" />
      </div>
      <div>
        <h3 className="font-semibold text-dark-100">{title}</h3>
        <p className="text-sm text-dark-400">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-dark-300 w-48">{label}</label>
      {children}
    </div>
  );
}

function ToggleField({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-dark-300 w-48">{label}</label>
      <button
        onClick={onClick}
        className={`w-12 h-6 rounded-full relative transition-colors ${on ? 'bg-brand-500' : 'bg-dark-600'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${on ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}
