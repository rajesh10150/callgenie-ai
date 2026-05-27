'use client';

import { motion } from 'framer-motion';
import { Megaphone, Play } from 'lucide-react';
import { formatPercentage } from '@/lib/utils';

const campaigns = [
  { id: 1, name: 'Q1 Real Estate Outreach', leads: 500, called: 325, answered: 245, qualified: 82, progress: 0.65 },
  { id: 2, name: 'Insurance Lead Gen', leads: 1200, called: 890, answered: 620, qualified: 186, progress: 0.74 },
  { id: 3, name: 'Clinic Appointment Setter', leads: 300, called: 120, answered: 95, qualified: 45, progress: 0.40 },
];

export default function ActiveCampaigns() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark-100">Active Campaigns</h3>
        <button className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {campaigns.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:border-brand-500/20 transition-all cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-brand-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-dark-100">{campaign.name}</h4>
                <p className="text-xs text-dark-500">
                  {campaign.called}/{campaign.leads} leads called
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs">
                <Play className="w-3 h-3" />
                Active
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-dark-700/50 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${campaign.progress * 100}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-dark-400">
              <span>{formatPercentage(campaign.progress)} complete</span>
              <div className="flex gap-4">
                <span>Answered: <span className="text-dark-200">{campaign.answered}</span></span>
                <span>Qualified: <span className="text-emerald-400">{campaign.qualified}</span></span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
