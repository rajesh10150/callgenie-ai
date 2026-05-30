'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Megaphone, Play, Pause, MoreVertical, Users, Phone as PhoneIcon, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Notice from '@/components/ui/Notice';
import { formatPercentage, LANGUAGES, AI_MODELS } from '@/lib/utils';
import { useApiData } from '@/hooks/useApiData';
import { useNotice } from '@/hooks/useNotice';
import api from '@/lib/api';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  type: string;
  language: string;
  ai_model: string;
  total_leads: number;
  calls_made: number;
  calls_answered: number;
  leads_qualified: number;
  appointments_booked: number;
  created_at: string;
}

const fallbackCampaigns: CampaignData[] = [
  {
    id: '1', name: 'Q1 Real Estate Outreach', status: 'active', type: 'cold_call',
    language: 'en', ai_model: 'gpt-4.1', total_leads: 500, calls_made: 325,
    calls_answered: 245, leads_qualified: 82, appointments_booked: 34,
    created_at: '2024-01-15',
  },
  {
    id: '2', name: 'Insurance Lead Generation', status: 'active', type: 'cold_call',
    language: 'hi', ai_model: 'gemini', total_leads: 1200, calls_made: 890,
    calls_answered: 620, leads_qualified: 186, appointments_booked: 72,
    created_at: '2024-01-20',
  },
  {
    id: '3', name: 'Clinic Appointment Setter', status: 'paused', type: 'appointment',
    language: 'kn', ai_model: 'claude', total_leads: 300, calls_made: 120,
    calls_answered: 95, leads_qualified: 45, appointments_booked: 28,
    created_at: '2024-02-01',
  },
  {
    id: '4', name: 'Education Consultation', status: 'draft', type: 'cold_call',
    language: 'ta', ai_model: 'deepseek', total_leads: 800, calls_made: 0,
    calls_answered: 0, leads_qualified: 0, appointments_booked: 0,
    created_at: '2024-02-10',
  },
  {
    id: '5', name: 'Salon Re-engagement', status: 'completed', type: 'follow_up',
    language: 'en', ai_model: 'gpt-4.1', total_leads: 200, calls_made: 200,
    calls_answered: 155, leads_qualified: 68, appointments_booked: 42,
    created_at: '2024-01-05',
  },
];

interface CampaignForm {
  name: string;
  type: string;
  language: string;
  ai_model: string;
}

const emptyForm: CampaignForm = { name: '', type: 'cold_call', language: 'en', ai_model: 'gpt-4.1' };

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: campaigns, refetch } = useApiData<CampaignData[]>({
    endpoint: '/campaigns',
    fallback: fallbackCampaigns,
  });
  const { notice, flash } = useNotice();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      flash('error', 'Campaign name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/campaigns', {
        name: form.name.trim(),
        type: form.type,
        language: form.language,
        ai_model: form.ai_model,
      });
      if (res.success) {
        flash('success', `Created "${form.name.trim()}"`);
        setCreateOpen(false);
        setForm(emptyForm);
        refetch();
      } else {
        flash('error', res.error?.message || 'Failed to create campaign');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (campaign: CampaignData, action: 'start' | 'pause') => {
    setBusyId(campaign.id);
    try {
      const res = await api.post(`/campaigns/${campaign.id}/${action}`);
      if (res.success) {
        flash('success', `${campaign.name} ${action === 'start' ? 'started' : 'paused'}`);
        refetch();
      } else {
        flash('error', res.error?.message || `Failed to ${action} campaign`);
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (campaign: CampaignData) => {
    setMenuId(null);
    setBusyId(campaign.id);
    try {
      const res = await api.delete(`/campaigns/${campaign.id}`);
      if (res.success) {
        flash('success', `Deleted "${campaign.name}"`);
        refetch();
      } else {
        flash('error', res.error?.message || 'Failed to delete campaign');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Header title="Campaigns" subtitle="Manage your AI calling campaigns" />

      <Notice notice={notice} />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 glass-input !w-64 !py-2">
            <Search className="w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-dark-200 placeholder-dark-500 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input !w-auto !py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCampaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              className="glass-card-hover p-6 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-100">{campaign.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={campaign.status} />
                      <span className="text-xs text-dark-500">{campaign.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuId(menuId === campaign.id ? null : campaign.id)}
                    className="p-1 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-dark-500" />
                  </button>
                  {menuId === campaign.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                      <div className="absolute right-0 top-full mt-1 w-40 glass-card p-1 z-20">
                        <button
                          onClick={() => handleDelete(campaign)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800/60 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-dark-400">Progress</span>
                  <span className="text-dark-200">
                    {campaign.total_leads > 0
                      ? formatPercentage(campaign.calls_made / campaign.total_leads)
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-dark-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                    style={{
                      width: `${campaign.total_leads > 0 ? (campaign.calls_made / campaign.total_leads) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-dark-800/30">
                  <div className="flex items-center justify-center gap-1 text-dark-400 mb-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">Leads</span>
                  </div>
                  <span className="text-sm font-semibold text-dark-200">{campaign.total_leads}</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-800/30">
                  <div className="flex items-center justify-center gap-1 text-dark-400 mb-1">
                    <PhoneIcon className="w-3 h-3" />
                    <span className="text-xs">Called</span>
                  </div>
                  <span className="text-sm font-semibold text-dark-200">{campaign.calls_made}</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-dark-800/30">
                  <div className="flex items-center justify-center gap-1 text-dark-400 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">Qualified</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{campaign.leads_qualified}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-dark-500 pt-3 border-t border-dark-700/30">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-dark-700/50">{LANGUAGES[campaign.language]}</span>
                  <span className="px-2 py-0.5 rounded bg-dark-700/50">{AI_MODELS[campaign.ai_model]?.label}</span>
                </div>
                {campaign.status === 'active' && (
                  <button
                    onClick={() => setStatus(campaign, 'pause')}
                    disabled={busyId === campaign.id}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 disabled:opacity-50"
                  >
                    {busyId === campaign.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
                    Pause
                  </button>
                )}
                {campaign.status === 'paused' && (
                  <button
                    onClick={() => setStatus(campaign, 'start')}
                    disabled={busyId === campaign.id}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                  >
                    {busyId === campaign.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Resume
                  </button>
                )}
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => setStatus(campaign, 'start')}
                    disabled={busyId === campaign.id}
                    className="flex items-center gap-1 text-brand-400 hover:text-brand-300 disabled:opacity-50"
                  >
                    {busyId === campaign.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Start
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Campaign">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">Campaign Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Q1 Real Estate Outreach"
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
                <option value="cold_call">Cold Call</option>
                <option value="follow_up">Follow Up</option>
                <option value="appointment">Appointment</option>
                <option value="survey">Survey</option>
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
            <label className="block text-sm text-dark-300 mb-1">AI Model</label>
            <select
              value={form.ai_model}
              onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
              className="glass-input w-full !py-2 text-sm"
            >
              {Object.entries(AI_MODELS).map(([id, m]) => (
                <option key={id} value={id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary text-sm !py-2">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-sm !py-2 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
