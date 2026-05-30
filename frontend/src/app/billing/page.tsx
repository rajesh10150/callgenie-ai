'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Phone, Bot, Check, ArrowUpRight, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Notice from '@/components/ui/Notice';
import { useNotice } from '@/hooks/useNotice';
import api from '@/lib/api';

const plans = [
  {
    name: 'Free',
    price: '$0',
    current: false,
    features: ['30 AI call minutes/mo', '1 campaign', '100 leads', 'English only', 'Basic analytics'],
  },
  {
    name: 'Starter',
    price: '$49',
    current: true,
    popular: true,
    features: ['500 AI call minutes/mo', '5 campaigns', '2,500 leads', 'English + Hindi', 'Standard analytics', 'Call recordings'],
  },
  {
    name: 'Professional',
    price: '$149',
    current: false,
    features: ['2,000 AI call minutes/mo', '25 campaigns', '25,000 leads', 'All 5 languages', 'Advanced analytics', 'WhatsApp', 'API access'],
  },
  {
    name: 'Enterprise',
    price: '$499+',
    current: false,
    features: ['Unlimited minutes', 'Unlimited campaigns', 'Unlimited leads', 'Custom languages', 'White-labeling', 'Dedicated support', 'SLA guarantee'],
  },
];

export default function BillingPage() {
  const { notice, flash } = useNotice();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    const plan = planName.toLowerCase();
    setBusyPlan(plan);
    try {
      const res = await api.post<{ message: string; plan: string }>('/billing/subscribe', { plan });
      if (res.success) {
        flash('success', `Upgrade to ${planName} initiated. Our team will follow up to complete checkout.`);
      } else {
        flash('error', res.error?.message || 'Failed to start upgrade');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div>
      <Header title="Billing" subtitle="Manage your subscription and usage" />

      <Notice notice={notice} />

      {/* Current Usage */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <Phone className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100">Call Minutes</h3>
              <p className="text-xs text-dark-500">This billing period</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-dark-100">342</span>
              <span className="text-dark-500 mb-1">/ 500 min</span>
            </div>
          </div>
          <div className="w-full h-2 bg-dark-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" style={{ width: '68.4%' }} />
          </div>
          <p className="text-xs text-dark-500 mt-2">158 minutes remaining</p>
        </motion.div>

        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100">AI Credits</h3>
              <p className="text-xs text-dark-500">This billing period</p>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-dark-100">2,450</span>
              <span className="text-dark-500 mb-1">/ 5,000</span>
            </div>
          </div>
          <div className="w-full h-2 bg-dark-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: '49%' }} />
          </div>
          <p className="text-xs text-dark-500 mt-2">2,550 credits remaining</p>
        </motion.div>

        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100">Current Plan</h3>
              <p className="text-xs text-dark-500">Renews Mar 15, 2024</p>
            </div>
          </div>
          <div className="mb-3">
            <span className="text-3xl font-bold gradient-text">Starter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-dark-100">$49</span>
            <span className="text-dark-500">/month</span>
          </div>
          <button
            onClick={() => handleSubscribe('Professional')}
            disabled={busyPlan === 'professional'}
            className="mt-4 btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {busyPlan === 'professional' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
            Upgrade Plan
          </button>
        </motion.div>
      </div>

      {/* Plans */}
      <h3 className="text-lg font-semibold text-dark-100 mb-6">Available Plans</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={`glass-card p-6 relative ${plan.current ? 'border-brand-500/50 shadow-glow' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-brand-600 to-purple-500 rounded-full text-[10px] font-semibold text-white">
                Current Plan
              </div>
            )}
            <h4 className="text-xl font-bold text-dark-100 mb-1">{plan.name}</h4>
            <div className="mb-4">
              <span className="text-3xl font-bold gradient-text">{plan.price}</span>
              <span className="text-dark-400">/mo</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-dark-300">
                  <Check className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !plan.current && plan.name !== 'Free' && handleSubscribe(plan.name)}
              className={`w-full ${plan.current ? 'btn-secondary' : 'btn-primary'} text-sm flex items-center justify-center gap-2`}
              disabled={plan.current || plan.name === 'Free' || busyPlan === plan.name.toLowerCase()}
            >
              {busyPlan === plan.name.toLowerCase() && <Loader2 className="w-4 h-4 animate-spin" />}
              {plan.current ? 'Current' : plan.name === 'Free' ? 'Free' : 'Upgrade'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Invoice History */}
      <h3 className="text-lg font-semibold text-dark-100 mb-4">Invoice History</h3>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700/50">
              <th className="table-header">Date</th>
              <th className="table-header">Description</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Feb 15, 2024', desc: 'Starter Plan - Monthly', amount: '$49.00', status: 'paid' },
              { date: 'Feb 15, 2024', desc: 'Overage - 42 extra minutes', amount: '$5.04', status: 'paid' },
              { date: 'Jan 15, 2024', desc: 'Starter Plan - Monthly', amount: '$49.00', status: 'paid' },
              { date: 'Dec 15, 2023', desc: 'Starter Plan - Monthly', amount: '$49.00', status: 'paid' },
            ].map((invoice, i) => (
              <tr key={i} className="table-row">
                <td className="table-cell">{invoice.date}</td>
                <td className="table-cell text-dark-300">{invoice.desc}</td>
                <td className="table-cell font-medium">{invoice.amount}</td>
                <td className="table-cell">
                  <span className="badge-success capitalize">{invoice.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
