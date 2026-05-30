'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Send, FileText, Clock, Globe, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Notice from '@/components/ui/Notice';
import EmptyState from '@/components/ui/EmptyState';
import { LANGUAGES } from '@/lib/utils';
import { useApiData } from '@/hooks/useApiData';
import { useNotice } from '@/hooks/useNotice';
import api from '@/lib/api';

interface Template {
  id: string;
  name: string;
  type: string;
  language: string;
  content: string;
  is_active: boolean;
  sent_count: number;
}

const fallbackTemplates: Template[] = [
  {
    id: '1', name: 'Follow-up After Call', type: 'follow_up', language: 'en',
    content: 'Hi {{name}}, thank you for speaking with us today about {{product}}. As discussed, I\'d love to schedule a follow-up. Would {{date}} work for you?',
    is_active: true, sent_count: 234,
  },
  {
    id: '2', name: 'Appointment Confirmation', type: 'appointment_confirmation', language: 'hi',
    content: 'नमस्ते {{name}}, आपकी अपॉइंटमेंट {{date}} को {{time}} पर कन्फर्म हो गई है। कृपया समय पर पहुँचें।',
    is_active: true, sent_count: 156,
  },
  {
    id: '3', name: 'Missed Call Reminder', type: 'reminder', language: 'en',
    content: 'Hi {{name}}, we tried reaching you earlier today. Would you be available for a quick 5-minute call? Reply YES to schedule.',
    is_active: true, sent_count: 89,
  },
  {
    id: '4', name: 'Special Offer', type: 'follow_up', language: 'kn',
    content: 'ನಮಸ್ಕಾರ {{name}}, ನಮ್ಮ ವಿಶೇಷ ಆಫರ್ ಬಗ್ಗೆ ತಿಳಿಸಲು ಬಯಸುತ್ತೇವೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ YES ಎಂದು ಉತ್ತರಿಸಿ.',
    is_active: false, sent_count: 42,
  },
];

interface TemplateForm {
  name: string;
  type: string;
  language: string;
  content: string;
}

const emptyForm: TemplateForm = { name: '', type: 'follow_up', language: 'en', content: '' };

const langLabel = (l: string) => LANGUAGES[l] || l;

export default function WhatsAppPage() {
  const { data: templates, refetch } = useApiData<Template[]>({
    endpoint: '/whatsapp/templates',
    fallback: fallbackTemplates,
  });
  const { notice, flash } = useNotice();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditId(t.id);
    setForm({ name: t.name, type: t.type, language: t.language, content: t.content });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      flash('error', 'Name and message content are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        language: form.language,
        content: form.content.trim(),
      };
      const res = editId
        ? await api.put(`/whatsapp/templates/${editId}`, payload)
        : await api.post('/whatsapp/templates', payload);
      if (res.success) {
        flash('success', editId ? 'Template updated' : `Created "${payload.name}"`);
        setModalOpen(false);
        setForm(emptyForm);
        setEditId(null);
        refetch();
      } else {
        flash('error', res.error?.message || 'Failed to save template');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (t: Template) => {
    setSendingId(t.id);
    try {
      const leadsRes = await api.get<Array<{ id: string }>>('/leads?limit=1');
      const lead = leadsRes.success && leadsRes.data?.[0];
      if (!lead) {
        flash('error', 'Add a lead first to send a test message.');
        return;
      }
      const res = await api.post('/whatsapp/send', { lead_id: lead.id, template_id: t.id });
      if (res.success) {
        flash('success', `Test message queued for "${t.name}"`);
      } else {
        flash('error', res.error?.message || 'Failed to send test message');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div>
      <Header title="WhatsApp Automation" subtitle="Manage WhatsApp templates and automated messages" />

      <Notice notice={notice} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Templates', value: templates.length, icon: FileText },
          { label: 'Messages Sent', value: String(templates.reduce((s, t) => s + (t.sent_count || 0), 0)), icon: Send },
          { label: 'Active', value: String(templates.filter(t => t.is_active).length), icon: MessageSquare },
          { label: 'Languages', value: String(new Set(templates.map(t => t.language)).size), icon: Globe },
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
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No WhatsApp Templates"
          description="Create message templates to automate follow-ups, confirmations, and reminders via WhatsApp."
          action={{ label: 'Create Template', onClick: openCreate }}
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
                    <span className="text-xs px-2 py-0.5 rounded bg-dark-700/50 text-dark-400">{template.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-dark-700/50 text-dark-400">{langLabel(template.language)}</span>
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEdit(template)}
                    className="text-xs text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSendTest(template)}
                    disabled={sendingId === template.id}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {sendingId === template.id && <Loader2 className="w-3 h-3 animate-spin" />}
                    Send Test
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Template' : 'New Template'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">Template Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Follow-up After Call"
              className="glass-input w-full !py-2 text-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="glass-input w-full !py-2 text-sm"
              >
                <option value="follow_up">Follow Up</option>
                <option value="appointment_confirmation">Appointment Confirmation</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="glass-input w-full !py-2 text-sm"
              >
                {Object.entries(LANGUAGES).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Message Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Hi {{name}}, ..."
              rows={4}
              className="glass-input w-full !py-2 text-sm resize-none"
            />
            <p className="text-xs text-dark-500 mt-1">Use {'{{name}}'}, {'{{date}}'} etc. as placeholders.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm !py-2">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-sm !py-2 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editId ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
