'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Upload, Download, Filter, Mail, Phone as PhoneIcon, Building2, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import { formatDate } from '@/lib/utils';
import { useApiData } from '@/hooks/useApiData';

const fallbackLeads = [
  { id: '1', first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', phone: '+91 98765 43210', company: 'Sharma Realty', status: 'qualified', score: 85, source: 'csv_import', created_at: '2024-01-15T10:30:00Z' },
  { id: '2', first_name: 'Rahul', last_name: 'Kumar', email: 'rahul@example.com', phone: '+91 87654 32109', company: 'Kumar Insurance', status: 'contacted', score: 62, source: 'manual', created_at: '2024-01-18T14:20:00Z' },
  { id: '3', first_name: 'Aisha', last_name: 'Begum', email: 'aisha@example.com', phone: '+91 76543 21098', company: 'City Clinic', status: 'new', score: 45, source: 'webhook', created_at: '2024-01-20T09:15:00Z' },
  { id: '4', first_name: 'Vikram', last_name: 'Reddy', email: 'vikram@example.com', phone: '+91 65432 10987', company: 'Reddy Education', status: 'converted', score: 95, source: 'api', created_at: '2024-01-22T16:45:00Z' },
  { id: '5', first_name: 'Sneha', last_name: 'Patel', email: 'sneha@example.com', phone: '+91 54321 09876', company: 'Patel Loans', status: 'unqualified', score: 20, source: 'csv_import', created_at: '2024-01-25T11:00:00Z' },
  { id: '6', first_name: 'Arjun', last_name: 'Nair', email: 'arjun@example.com', phone: '+91 43210 98765', company: 'Nair Salon', status: 'new', score: 50, source: 'manual', created_at: '2024-02-01T08:30:00Z' },
  { id: '7', first_name: 'Deepa', last_name: 'Verma', email: 'deepa@example.com', phone: '+91 32109 87654', company: 'Verma Properties', status: 'contacted', score: 70, source: 'whatsapp', created_at: '2024-02-03T13:20:00Z' },
  { id: '8', first_name: 'Karthik', last_name: 'Iyer', email: 'karthik@example.com', phone: '+91 21098 76543', company: 'Iyer Tech', status: 'qualified', score: 88, source: 'csv_import', created_at: '2024-02-05T15:10:00Z' },
];

type LeadRecord = typeof fallbackLeads[0] & Record<string, unknown>;

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: leads } = useApiData<typeof fallbackLeads>({
    endpoint: '/leads',
    fallback: fallbackLeads,
  });

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (lead: LeadRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-purple-500/30 flex items-center justify-center text-xs font-semibold text-brand-300">
            {(lead.first_name as string)[0]}{(lead.last_name as string)[0]}
          </div>
          <div>
            <div className="font-medium text-dark-100">{lead.first_name as string} {lead.last_name as string}</div>
            <div className="text-xs text-dark-500">{lead.company as string}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (lead: LeadRecord) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-dark-400">
            <Mail className="w-3 h-3" />
            {lead.email as string}
          </div>
          <div className="flex items-center gap-1 text-xs text-dark-400">
            <PhoneIcon className="w-3 h-3" />
            {lead.phone as string}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: LeadRecord) => <Badge status={lead.status as string} />,
    },
    {
      key: 'score',
      header: 'Score',
      render: (lead: LeadRecord) => (
        <div className="flex items-center gap-2">
          <Star className={`w-4 h-4 ${(lead.score as number) >= 70 ? 'text-amber-400' : 'text-dark-600'}`} />
          <span className={`font-medium ${(lead.score as number) >= 70 ? 'text-amber-400' : 'text-dark-400'}`}>
            {lead.score as number}
          </span>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (lead: LeadRecord) => (
        <span className="text-xs px-2 py-1 rounded-lg bg-dark-700/50 text-dark-300">
          {(lead.source as string).replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Added',
      render: (lead: LeadRecord) => (
        <span className="text-dark-400">{formatDate(lead.created_at as string)}</span>
      ),
    },
  ];

  return (
    <div>
      <Header title="Leads" subtitle="Manage your leads and contacts" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: leads.length, icon: Building2 },
          { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, icon: Star },
          { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, icon: PhoneIcon },
          { label: 'Avg Score', value: leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0, icon: Star },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card p-4 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-dark-100">{stat.value}</div>
              <div className="text-xs text-dark-400">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-input !w-72 !py-2">
            <Search className="w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search by name, email, company..."
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
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable<LeadRecord>
        columns={columns}
        data={filteredLeads as LeadRecord[]}
        emptyMessage="No leads found. Import a CSV or add leads manually."
      />
    </div>
  );
}
