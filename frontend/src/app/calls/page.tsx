'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, Clock, ThumbsUp, ThumbsDown, Minus, PlayCircle, FileText } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import { formatDuration, formatDateTime } from '@/lib/utils';
import { useApiData } from '@/hooks/useApiData';

const fallbackCalls = [
  { id: '1', lead_name: 'Priya Sharma', phone: '+91 98765 43210', campaign: 'Q1 Real Estate', status: 'completed', duration: 245, sentiment: 'positive', qualified: true, ai_model: 'GPT-4.1', cost: 0.42, created_at: '2024-02-15T10:30:00Z' },
  { id: '2', lead_name: 'Rahul Kumar', phone: '+91 87654 32109', campaign: 'Insurance Outreach', status: 'completed', duration: 180, sentiment: 'neutral', qualified: false, ai_model: 'Gemini', cost: 0.28, created_at: '2024-02-15T10:25:00Z' },
  { id: '3', lead_name: 'Aisha Begum', phone: '+91 76543 21098', campaign: 'Q1 Real Estate', status: 'no_answer', duration: 0, sentiment: 'neutral', qualified: false, ai_model: 'GPT-4.1', cost: 0.05, created_at: '2024-02-15T10:20:00Z' },
  { id: '4', lead_name: 'Vikram Reddy', phone: '+91 65432 10987', campaign: 'Clinic Appointments', status: 'completed', duration: 320, sentiment: 'positive', qualified: true, ai_model: 'Claude', cost: 0.55, created_at: '2024-02-15T10:15:00Z' },
  { id: '5', lead_name: 'Sneha Patel', phone: '+91 54321 09876', campaign: 'Insurance Outreach', status: 'completed', duration: 95, sentiment: 'negative', qualified: false, ai_model: 'DeepSeek', cost: 0.15, created_at: '2024-02-15T10:10:00Z' },
  { id: '6', lead_name: 'Arjun Nair', phone: '+91 43210 98765', campaign: 'Salon Rebooking', status: 'busy', duration: 0, sentiment: 'neutral', qualified: false, ai_model: 'GPT-4.1', cost: 0.03, created_at: '2024-02-15T10:05:00Z' },
  { id: '7', lead_name: 'Deepa Verma', phone: '+91 32109 87654', campaign: 'Q1 Real Estate', status: 'completed', duration: 210, sentiment: 'positive', qualified: true, ai_model: 'GPT-4.1', cost: 0.38, created_at: '2024-02-15T10:00:00Z' },
  { id: '8', lead_name: 'Karthik Iyer', phone: '+91 21098 76543', campaign: 'Education Outreach', status: 'in_progress', duration: 45, sentiment: 'neutral', qualified: false, ai_model: 'Gemini', cost: 0.08, created_at: '2024-02-15T09:55:00Z' },
];

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  neutral: { icon: Minus, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  negative: { icon: ThumbsDown, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function CallsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: calls } = useApiData<typeof fallbackCalls>({
    endpoint: '/calls',
    fallback: fallbackCalls,
  });

  const filteredCalls = calls.filter(c => {
    const matchesSearch = c.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaign.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <Header title="Call History" subtitle="View and analyze all AI-powered calls" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-input !w-72 !py-2">
            <Search className="w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search calls..."
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
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="no_answer">No Answer</option>
              <option value="busy">Busy</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Call List */}
      <div className="space-y-3">
        {filteredCalls.map((call, i) => {
          const sentiment = sentimentConfig[call.sentiment as keyof typeof sentimentConfig];
          const SentimentIcon = sentiment.icon;

          return (
            <motion.div
              key={call.id}
              className="glass-card-hover p-5 cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-dark-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-dark-100">{call.lead_name}</span>
                    {call.qualified && <span className="badge-success text-[10px] !py-0">Qualified</span>}
                    <Badge status={call.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-dark-500">
                    <span>{call.campaign}</span>
                    <span>•</span>
                    <span>{call.phone}</span>
                    <span>•</span>
                    <span>{formatDateTime(call.created_at)}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-5 flex-shrink-0">
                  {/* Sentiment */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${sentiment.bg}`}>
                    <SentimentIcon className={`w-4 h-4 ${sentiment.color}`} />
                    <span className={`text-xs font-medium ${sentiment.color}`}>{call.sentiment}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 text-dark-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDuration(call.duration)}</span>
                  </div>

                  {/* AI Model */}
                  <span className="text-xs px-2 py-1 rounded-lg bg-dark-700/50 text-dark-300">
                    {call.ai_model}
                  </span>

                  {/* Cost */}
                  <span className="text-sm text-dark-400 w-14 text-right">
                    ${call.cost.toFixed(2)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors" title="Play recording">
                      <PlayCircle className="w-4 h-4 text-dark-400 hover:text-brand-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors" title="View transcript">
                      <FileText className="w-4 h-4 text-dark-400 hover:text-brand-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
