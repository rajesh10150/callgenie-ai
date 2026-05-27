'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { Phone, TrendingUp, Clock, DollarSign, Target, CalendarCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/ui/StatsCard';

const callsByDay = [
  { day: 'Mon', calls: 120, answered: 85, qualified: 32 },
  { day: 'Tue', calls: 145, answered: 102, qualified: 41 },
  { day: 'Wed', calls: 138, answered: 98, qualified: 35 },
  { day: 'Thu', calls: 162, answered: 118, qualified: 48 },
  { day: 'Fri', calls: 175, answered: 130, qualified: 55 },
  { day: 'Sat', calls: 68, answered: 45, qualified: 15 },
  { day: 'Sun', calls: 42, answered: 28, qualified: 8 },
];

const conversionFunnel = [
  { stage: 'Total Leads', value: 2500 },
  { stage: 'Contacted', value: 1850 },
  { stage: 'Answered', value: 1320 },
  { stage: 'Qualified', value: 462 },
  { stage: 'Appointments', value: 185 },
  { stage: 'Converted', value: 92 },
];

const costByModel = [
  { model: 'GPT-4.1', cost: 245, calls: 890 },
  { model: 'Claude', cost: 120, calls: 450 },
  { model: 'Gemini', cost: 85, calls: 680 },
  { model: 'DeepSeek', cost: 35, calls: 320 },
];

const languageDistribution = [
  { name: 'English', value: 55, color: '#6366f1' },
  { name: 'Hindi', value: 25, color: '#a78bfa' },
  { name: 'Kannada', value: 10, color: '#34d399' },
  { name: 'Tamil', value: 6, color: '#fbbf24' },
  { name: 'Telugu', value: 4, color: '#f87171' },
];

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#e2e8f0',
};

export default function AnalyticsPage() {
  return (
    <div>
      <Header title="Analytics" subtitle="Deep insights into your AI calling performance" />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard title="Total Calls" value="2,847" icon={Phone} trend={{ value: 12.5, isPositive: true }} />
        <StatsCard title="Answer Rate" value="72.3%" icon={TrendingUp} trend={{ value: 3.2, isPositive: true }} />
        <StatsCard title="Avg Duration" value="3:24" icon={Clock} trend={{ value: 8.1, isPositive: true }} />
        <StatsCard title="Qualification" value="35.2%" icon={Target} trend={{ value: 5.4, isPositive: true }} />
        <StatsCard title="Appointments" value="185" icon={CalendarCheck} trend={{ value: 15.3, isPositive: true }} />
        <StatsCard title="Total Cost" value="$485" icon={DollarSign} trend={{ value: 2.1, isPositive: false }} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Calls by Day */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Calls by Day</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="answered" fill="#34d399" radius={[4, 4, 0, 0]} name="Answered" />
                <Bar dataKey="qualified" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Qualified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, i) => {
              const maxValue = conversionFunnel[0].value;
              const percentage = (stage.value / maxValue) * 100;
              const convRate = i > 0
                ? ((stage.value / conversionFunnel[i - 1].value) * 100).toFixed(1)
                : '100';

              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-dark-300">{stage.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-dark-100">{stage.value.toLocaleString()}</span>
                      <span className="text-xs text-dark-500">{convRate}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-dark-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, #6366f1, #a78bfa)`,
                        opacity: 0.3 + (percentage / 100) * 0.7,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost by AI Model */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Cost by AI Model</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costByModel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="model" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 6 }} name="Cost ($)" />
                <Line type="monotone" dataKey="calls" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 6 }} name="Calls" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Language Distribution */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Language Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {languageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {languageDistribution.map((lang) => (
              <div key={lang.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="text-sm text-dark-400">{lang.name}</span>
                <span className="text-sm font-medium text-dark-200">{lang.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
