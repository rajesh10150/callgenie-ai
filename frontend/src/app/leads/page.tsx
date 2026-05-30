'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Upload, Download, Filter, Mail, Phone as PhoneIcon, Building2, Star, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/api';

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += char;
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(c => c.trim() !== '')) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some(c => c.trim() !== '')) rows.push(row);
  }
  if (rows.length < 2) return [];

  const normalize = (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_');
  const headers = rows[0].map(normalize);
  return rows.slice(1).map(cols => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (cols[idx] ?? '').trim(); });
    return obj;
  });
}

function mapCsvRow(r: Record<string, string>) {
  const first = r.first_name || r.firstname || (r.name ? r.name.split(' ')[0] : '') || '';
  const last = r.last_name || r.lastname || (r.name ? r.name.split(' ').slice(1).join(' ') : '') || '';
  return {
    first_name: first,
    last_name: last,
    email: r.email || '',
    phone: r.phone || r.phone_number || r.mobile || '',
    company: r.company || r.organization || '',
    title: r.title || '',
  };
}

interface LeadForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
}

const emptyForm: LeadForm = { first_name: '', last_name: '', email: '', phone: '', company: '' };

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
  const { data: leads, refetch } = useApiData<typeof fallbackLeads>({
    endpoint: '/leads',
    fallback: fallbackLeads,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const flash = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleExport = () => {
    const cols = ['first_name', 'last_name', 'email', 'phone', 'company', 'status', 'score', 'source', 'created_at'];
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      cols.join(','),
      ...filteredLeads.map(l => cols.map(c => escape((l as Record<string, unknown>)[c])).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash('success', `Exported ${filteredLeads.length} lead(s) to CSV`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      e.target.value = '';
      setImporting(true);
      try {
        const text = await file.text();
        const parsed = parseCsv(text).map(mapCsvRow).filter(l => l.first_name && l.phone);
        if (parsed.length === 0) {
          flash('error', 'No valid rows found. CSV needs first_name and phone columns.');
          return;
        }
        const res = await api.post<{ imported: number; total: number }>('/leads/import', { leads: parsed });
        if (res.success) {
          flash('success', `Imported ${res.data.imported} of ${parsed.length} lead(s)`);
          refetch();
        } else {
          flash('error', res.error?.message || 'Import failed');
        }
      } catch {
        flash('error', 'Unable to import CSV. Check the file and your connection.');
      } finally {
        setImporting(false);
      }
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || form.phone.trim().length < 10) {
      flash('error', 'First name and a valid phone (10+ digits) are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        company: form.company.trim() || undefined,
        source: 'manual' as const,
      };
      const res = await api.post('/leads', payload);
      if (res.success) {
        flash('success', `Added ${payload.first_name}`);
        setAddOpen(false);
        setForm(emptyForm);
        refetch();
      } else {
        flash('error', res.error?.message || 'Failed to add lead');
      }
    } catch {
      flash('error', 'Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import CSV
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            notice.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Table */}
      <DataTable<LeadRecord>
        columns={columns}
        data={filteredLeads as LeadRecord[]}
        emptyMessage="No leads found. Import a CSV or add leads manually."
      />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Lead">
        <form onSubmit={handleAddLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">First Name *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="glass-input !py-2 text-sm"
                placeholder="Priya"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="glass-input !py-2 text-sm"
                placeholder="Sharma"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="glass-input !py-2 text-sm"
              placeholder="priya@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Phone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="glass-input !py-2 text-sm"
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Company</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="glass-input !py-2 text-sm"
              placeholder="Sharma Realty"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
