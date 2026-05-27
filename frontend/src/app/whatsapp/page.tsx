'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Plus, Send, FileText, Clock, Globe } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const templates = [
  {
    id: '1',
    name: 'Follow-up After Call',
    type: 'follow_up',
    language: 'English',
    content: 'Hi {{name}}, thank you for speaking with us today about {{product}}. As discussed, I\'d love to schedule a follow-up. Would {{date}} work for you?',
    is_active: true,
    sent_count: 234,
  },
  {
    id: '2',
    name: 'Appointment Confirmation',
    type: 'appointment_confirmation',
    language: 'Hindi',
    content: 'नमस्ते {{name}}, आपकी अपॉइंटमेंट {{date}} को {{time}} पर कन्फर्म हो गई है। कृपया समय पर पहुँचें।',
    is_active: true,
    sent_count: 156,
  },
  {
    id: '3',
    name: 'Missed Call Reminder',
    type: 'reminder',
    language: 'English',
    content: 'Hi {{name}}, we tried reaching you earlier today. Would you be available for a quick 5-minute call? Reply YES to schedule.',
    is_active: true,
    sent_count: 89,
  },
  {
    id: '4',
    name: 'Special Offer',
    type: 'follow_up',
    language: 'Kannada',
    content: 'ನಮಸ್ಕಾರ {{name}}, ನಮ್ಮ ವಿಶೇಷ ಆಫರ್ ಬಗ್ಗೆ ತಿಳಿಸಲು ಬಯಸುತ್ತೇವೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ YES ಎಂದು ಉತ್ತರಿಸಿ.',
    is_active: false,
    sent_count: 42,
  },
];

export default function WhatsAppPage() {
  return (
    <div>
      <Header title="WhatsApp Automation" subtitle="Manage WhatsApp templates and automated messages" />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Templates', value: templates.length, icon: FileText },
          { label: 'Messages Sent', value: '521', icon: Send },
          { label: 'Response Rate', value: '68%', icon: MessageSquare },
          { label: 'Languages', value: '3', icon: Globe },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card p-4 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-dark-100">{stat.value}</div>
              <div className="text-xs text-dark-400">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Templates */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark-100">Message Templates</h3>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No WhatsApp Templates"
          description="Create message templates to automate follow-ups, confirmations, and reminders via WhatsApp."
          action={{ label: 'Create Template', onClick: () => {} }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              className="glass-card-hover p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-dark-100">{template.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge status={template.is_active ? 'active' : 'draft'} label={template.is_active ? 'Active' : 'Inactive'} />
                    <span className="text-xs px-2 py-0.5 rounded bg-dark-700/50 text-dark-400">{template.type.replace('_', ' ')}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-dark-700/50 text-dark-400">{template.language}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-dark-500">
                  <Send className="w-3 h-3" />
                  <span className="text-xs">{template.sent_count}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-800/30 border border-dark-700/30 mb-4">
                <p className="text-sm text-dark-300 leading-relaxed">{template.content}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-dark-500">
                  <Clock className="w-3 h-3" />
                  <span>Auto-sent after calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-dark-400 hover:text-dark-200 transition-colors">Edit</button>
                  <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Send Test</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
