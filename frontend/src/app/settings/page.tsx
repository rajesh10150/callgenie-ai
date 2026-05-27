'use client';

import { motion } from 'framer-motion';
import { User, Building2, Key, Bell, Globe, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';

const settingsSections = [
  {
    icon: User,
    title: 'Profile',
    description: 'Manage your personal information and preferences',
    fields: [
      { label: 'Full Name', value: 'Rajesh Kumar', type: 'text' },
      { label: 'Email', value: 'rajesh@callgenie.ai', type: 'email' },
      { label: 'Phone', value: '+91 98765 43210', type: 'tel' },
    ],
  },
  {
    icon: Building2,
    title: 'Organization',
    description: 'Configure your organization settings',
    fields: [
      { label: 'Organization Name', value: 'Acme Corp', type: 'text' },
      { label: 'Industry', value: 'real_estate', type: 'select' },
      { label: 'Timezone', value: 'Asia/Kolkata', type: 'select' },
    ],
  },
  {
    icon: Key,
    title: 'API Keys',
    description: 'Manage your AI model and integration API keys',
    fields: [
      { label: 'OpenAI API Key', value: '••••••••••••••••', type: 'password' },
      { label: 'Twilio Account SID', value: '••••••••••••••••', type: 'password' },
      { label: 'ElevenLabs API Key', value: '••••••••••••••••', type: 'password' },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure email and push notification preferences',
    fields: [
      { label: 'Email Notifications', value: 'enabled', type: 'toggle' },
      { label: 'Campaign Completion Alerts', value: 'enabled', type: 'toggle' },
      { label: 'Daily Summary Report', value: 'enabled', type: 'toggle' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Configure your account and platform settings" />

      <div className="max-w-4xl space-y-6">
        {settingsSections.map((section, i) => (
          <motion.div
            key={section.title}
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-100">{section.title}</h3>
                <p className="text-sm text-dark-400">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between">
                  <label className="text-sm text-dark-300 w-48">{field.label}</label>
                  {field.type === 'toggle' ? (
                    <button className="w-12 h-6 rounded-full bg-brand-500 relative transition-colors">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform" />
                    </button>
                  ) : (
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      className="glass-input !w-80 !py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-dark-700/30">
              <button className="btn-primary text-sm !py-2">Save Changes</button>
            </div>
          </motion.div>
        ))}

        {/* Security Section */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100">Security</h3>
              <p className="text-sm text-dark-400">Manage your account security settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <button className="btn-secondary text-sm">Change Password</button>
            <button className="btn-secondary text-sm ml-3">Enable Two-Factor Authentication</button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="glass-card p-6 border-red-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <Globe className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-400">Danger Zone</h3>
              <p className="text-sm text-dark-400">Irreversible actions</p>
            </div>
          </div>
          <button className="btn-danger text-sm">Delete Organization</button>
        </motion.div>
      </div>
    </div>
  );
}
