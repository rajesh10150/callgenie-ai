'use client';

import { motion } from 'framer-motion';
import { Phone, Clock, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';

const recentCalls = [
  { id: 1, name: 'Priya Sharma', phone: '+91 98765 43210', duration: 245, status: 'completed', sentiment: 'positive', qualified: true, campaign: 'Q1 Real Estate' },
  { id: 2, name: 'Rahul Kumar', phone: '+91 87654 32109', duration: 180, status: 'completed', sentiment: 'neutral', qualified: false, campaign: 'Insurance Outreach' },
  { id: 3, name: 'Aisha Begum', phone: '+91 76543 21098', duration: 0, status: 'no_answer', sentiment: 'neutral', qualified: false, campaign: 'Q1 Real Estate' },
  { id: 4, name: 'Vikram Reddy', phone: '+91 65432 10987', duration: 320, status: 'completed', sentiment: 'positive', qualified: true, campaign: 'Clinic Appointments' },
  { id: 5, name: 'Sneha Patel', phone: '+91 54321 09876', duration: 95, status: 'completed', sentiment: 'negative', qualified: false, campaign: 'Insurance Outreach' },
];

const sentimentIcons = {
  positive: { icon: ThumbsUp, color: 'text-emerald-400' },
  neutral: { icon: Minus, color: 'text-amber-400' },
  negative: { icon: ThumbsDown, color: 'text-red-400' },
};

export default function RecentCalls() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark-100">Recent Calls</h3>
        <button className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {recentCalls.map((call, i) => {
          const SentimentIcon = sentimentIcons[call.sentiment as keyof typeof sentimentIcons];
          return (
            <motion.div
              key={call.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/40 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-10 h-10 rounded-full bg-dark-700/50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-dark-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-dark-100 truncate">{call.name}</span>
                  {call.qualified && (
                    <span className="badge-success text-[10px] !py-0">Qualified</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-500">
                  <span>{call.campaign}</span>
                  <span>•</span>
                  <span>{call.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <SentimentIcon.icon className={`w-4 h-4 ${SentimentIcon.color}`} />
                <div className="flex items-center gap-1 text-dark-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{formatDuration(call.duration)}</span>
                </div>
                <Badge status={call.status} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
