'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign, Globe, Shield, Brain, Gauge, Languages } from 'lucide-react';
import Header from '@/components/layout/Header';
import Notice from '@/components/ui/Notice';
import { useNotice } from '@/hooks/useNotice';

const models = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: 'Most capable model for complex reasoning, sales conversations, and English-language tasks.',
    costPer1k: '$0.030',
    speed: 'Medium',
    strengths: ['Complex reasoning', 'Sales optimization', 'English fluency', 'Objection handling'],
    badge: 'Recommended',
    badgeColor: 'badge-success',
    icon: Brain,
    color: 'from-green-500/20 to-emerald-500/20',
    enabled: true,
  },
  {
    id: 'claude',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Excellent for nuanced conversations, long-context understanding, and safety-critical tasks.',
    costPer1k: '$0.015',
    speed: 'Medium',
    strengths: ['Nuanced responses', 'Long context', 'Safety-first', 'Detailed analysis'],
    badge: 'Balanced',
    badgeColor: 'badge-info',
    icon: Shield,
    color: 'from-blue-500/20 to-cyan-500/20',
    enabled: true,
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Best for multilingual calls, fast responses, and cost-effective high-volume campaigns.',
    costPer1k: '$0.005',
    speed: 'Fast',
    strengths: ['Multilingual', 'Fast responses', 'Cost-effective', 'Multimodal'],
    badge: 'Best for Languages',
    badgeColor: 'badge-warning',
    icon: Languages,
    color: 'from-amber-500/20 to-orange-500/20',
    enabled: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: 'Most cost-effective option for high-volume, simpler conversations and follow-ups.',
    costPer1k: '$0.002',
    speed: 'Fast',
    strengths: ['Lowest cost', 'Fast processing', 'Simple tasks', 'High volume'],
    badge: 'Budget',
    badgeColor: 'badge-neutral',
    icon: DollarSign,
    color: 'from-purple-500/20 to-pink-500/20',
    enabled: false,
  },
];

const routingStrategies = [
  {
    name: 'Sales Optimized',
    description: 'Routes to the best model for closing deals and handling objections',
    icon: Zap,
    active: true,
  },
  {
    name: 'Cost Effective',
    description: 'Minimizes AI costs by routing to the cheapest capable model',
    icon: DollarSign,
    active: false,
  },
  {
    name: 'Speed First',
    description: 'Prioritizes response time for natural conversation flow',
    icon: Gauge,
    active: false,
  },
  {
    name: 'Multilingual',
    description: 'Routes based on language requirements for best fluency',
    icon: Globe,
    active: false,
  },
];

export default function AIModelsPage() {
  const { notice, flash } = useNotice();
  const [activeStrategy, setActiveStrategy] = useState(
    routingStrategies.find(s => s.active)?.name ?? routingStrategies[0].name
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(models.map(m => [m.id, m.enabled]))
  );

  const selectStrategy = (name: string) => {
    setActiveStrategy(name);
    flash('success', `Routing strategy set to "${name}"`);
  };

  const toggleModel = (id: string, name: string) => {
    setEnabled(prev => {
      const next = { ...prev, [id]: !prev[id] };
      flash('success', `${name} ${next[id] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  return (
    <div>
      <Header title="AI Models" subtitle="Configure and manage your AI model providers" />

      <Notice notice={notice} />

      {/* Routing Strategy */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Routing Strategy</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routingStrategies.map((strategy, i) => {
            const isActive = activeStrategy === strategy.name;
            return (
            <motion.button
              key={strategy.name}
              onClick={() => selectStrategy(strategy.name)}
              className={`glass-card p-5 text-left transition-all ${
                isActive ? 'border-brand-500/50 shadow-glow' : 'hover:border-dark-600'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-brand-500/20' : 'bg-dark-700/50'
                }`}>
                  <strategy.icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-dark-400'}`} />
                </div>
                <span className={`text-sm font-semibold ${isActive ? 'text-brand-400' : 'text-dark-300'}`}>
                  {strategy.name}
                </span>
              </div>
              <p className="text-xs text-dark-500">{strategy.description}</p>
              {isActive && (
                <div className="mt-3 text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                  Active
                </div>
              )}
            </motion.button>
            );
          })}
        </div>
      </div>

      {/* Model Cards */}
      <h3 className="text-lg font-semibold text-dark-100 mb-4">Available Models</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {models.map((model, i) => {
          const isEnabled = enabled[model.id];
          return (
          <motion.div
            key={model.id}
            className={`glass-card overflow-hidden ${isEnabled ? '' : 'opacity-60'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isEnabled ? 1 : 0.6, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Header gradient */}
            <div className={`h-2 bg-gradient-to-r ${model.color}`} />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center">
                    <model.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-dark-100">{model.name}</h3>
                      <span className={model.badgeColor}>{model.badge}</span>
                    </div>
                    <p className="text-xs text-dark-500">{model.provider}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleModel(model.id, model.name)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    isEnabled ? 'bg-brand-500' : 'bg-dark-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <p className="text-sm text-dark-400 mb-4">{model.description}</p>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-dark-500" />
                  <span className="text-dark-300">{model.costPer1k}/1K tokens</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="w-4 h-4 text-dark-500" />
                  <span className="text-dark-300">{model.speed}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {model.strengths.map((strength) => (
                  <span key={strength} className="text-xs px-2 py-1 rounded-lg bg-dark-700/50 text-dark-400">
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}
