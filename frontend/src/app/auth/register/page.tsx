'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    org_name: '',
    industry: 'real_estate',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, call auth API
    window.location.href = '/dashboard';
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="glass-card p-8 w-full max-w-md relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">CallGenie AI</span>
        </div>

        <h2 className="text-xl font-semibold text-center text-dark-100 mb-2">Create your account</h2>
        <p className="text-dark-400 text-center text-sm mb-8">Start your free trial — no credit card required</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-dark-300 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="John Doe"
                className="glass-input !pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-dark-300 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@company.com"
                className="glass-input !pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-dark-300 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Min 8 characters"
                className="glass-input !pl-10"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-dark-300 mb-1 block">Organization Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={formData.org_name}
                onChange={(e) => updateField('org_name', e.target.value)}
                placeholder="Your company name"
                className="glass-input !pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-dark-300 mb-1 block">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              className="glass-input"
            >
              <option value="real_estate">Real Estate</option>
              <option value="insurance">Insurance</option>
              <option value="clinic">Clinic / Hospital</option>
              <option value="salon">Salon / Spa</option>
              <option value="education">Education</option>
              <option value="loans">Loans / Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            Create Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-dark-500 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>

        <p className="text-center text-sm text-dark-400 mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
