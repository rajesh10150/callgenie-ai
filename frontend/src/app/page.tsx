'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, Zap, Globe, BarChart3, Bot, Shield, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Voice Agents',
    description: 'Human-sounding AI that handles conversations, objections, and qualifies leads automatically.',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Deploy agents in English, Hindi, Kannada, Tamil, and Telugu with native-like fluency.',
  },
  {
    icon: Zap,
    title: 'Multi-Model AI',
    description: 'Smart routing across GPT-4.1, Claude, Gemini & DeepSeek for optimal cost and performance.',
  },
  {
    icon: Phone,
    title: 'Automated Calling',
    description: 'Run thousands of calls simultaneously with intelligent scheduling and retry logic.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track conversions, sentiment, costs, and campaign performance with live dashboards.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2-ready with end-to-end encryption, rate limiting, and comprehensive audit logs.',
  },
];

const stats = [
  { value: '10x', label: 'Cheaper than human agents' },
  { value: '5', label: 'Languages supported' },
  { value: '24/7', label: 'Always available' },
  { value: '95%', label: 'Human-like voice quality' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CallGenie AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-dark-400 hover:text-dark-100 transition-colors">Features</a>
            <a href="#pricing" className="text-dark-400 hover:text-dark-100 transition-colors">Pricing</a>
            <Link href="/auth/login" className="text-dark-400 hover:text-dark-100 transition-colors">Login</Link>
            <Link href="/auth/register" className="btn-primary text-sm !py-2 !px-4">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-brand-300">Your AI Sales Team That Never Sleeps</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-dark-50">AI-Powered</span>
              <br />
              <span className="gradient-text">Cold Calling</span>
              <br />
              <span className="text-dark-50">at Scale</span>
            </h1>

            <p className="text-xl text-dark-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Deploy multilingual AI voice agents that call customers, qualify leads, 
              and book appointments — at 1/10th the cost of human agents.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button
                  className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="#features">
                <motion.button
                  className="glass-button text-lg !px-8 !py-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  See How It Works
                </motion.button>
              </a>
            </div>

            <p className="text-sm text-dark-500 mt-6">
              No credit card required · 30 free AI call minutes · Set up in minutes
            </p>
          </motion.div>

          {/* Industries strip */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-xs uppercase tracking-widest text-dark-500 mb-4">
              Built for outbound teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-dark-400 font-medium">
              <span>Real Estate</span>
              <span>Clinics</span>
              <span>Agencies</span>
              <span>EdTech</span>
              <span>Insurance</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-dark-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">automate sales</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              From AI-powered voice calls to real-time analytics, CallGenie AI handles 
              your entire outbound sales pipeline.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card-hover p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-dark-100">{feature.title}</h3>
                <p className="text-dark-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Simple, <span className="gradient-text">transparent pricing</span>
            </h2>
            <p className="text-dark-400 text-lg">Start free. Scale as you grow.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                features: ['30 AI call minutes/mo', '1 campaign', '100 leads', 'English only', 'Basic analytics'],
              },
              {
                name: 'Starter',
                price: '$49',
                popular: true,
                features: ['500 AI call minutes/mo', '5 campaigns', '2,500 leads', 'English + Hindi', 'Standard analytics', 'Call recordings'],
              },
              {
                name: 'Professional',
                price: '$149',
                features: ['2,000 AI call minutes/mo', '25 campaigns', '25,000 leads', 'All 5 languages', 'Advanced analytics', 'WhatsApp automation', 'API access'],
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                className={`glass-card p-8 relative ${plan.popular ? 'border-brand-500/50 shadow-glow' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-brand-600 to-purple-500 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-dark-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-dark-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <button className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                    Get Started
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="glass-card p-12 relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-purple-500/10" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Ready to transform your sales?</h2>
              <p className="text-dark-400 text-lg mb-8">
                Join hundreds of businesses already using CallGenie AI to scale their outreach.
              </p>
              <Link href="/auth/register">
                <button className="btn-primary text-lg !px-8 !py-4">
                  Start Your Free Trial
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold gradient-text">CallGenie AI</span>
          </div>
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} CallGenie AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
