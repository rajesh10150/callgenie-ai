'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Megaphone, Play, Pause, MoreVertical, Users, Phone as PhoneIcon, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import { formatPercentage, LANGUAGES, AI_MODELS } from '@/lib/utils';

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

const mockCampaigns: CampaignData[] = [
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

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCampaigns = mockCampaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Header title="Campaigns" subtitle="Manage your AI calling campaigns" />

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
          onClick={() => {}}
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
                <button className="p-1 rounded-lg hover:bg-dark-700/50 transition-colors">
                  <MoreVertical className="w-4 h-4 text-dark-500" />
                </button>
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
                  <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300">
                    <Pause className="w-3 h-3" />
                    Pause
                  </button>
                )}
                {campaign.status === 'paused' && (
                  <button className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                    <Play className="w-3 h-3" />
                    Resume
                  </button>
                )}
                {campaign.status === 'draft' && (
                  <button className="flex items-center gap-1 text-brand-400 hover:text-brand-300">
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
