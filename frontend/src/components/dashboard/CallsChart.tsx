'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mon', calls: 45, answered: 32, qualified: 12 },
  { date: 'Tue', calls: 62, answered: 48, qualified: 18 },
  { date: 'Wed', calls: 58, answered: 41, qualified: 15 },
  { date: 'Thu', calls: 71, answered: 55, qualified: 22 },
  { date: 'Fri', calls: 83, answered: 64, qualified: 28 },
  { date: 'Sat', calls: 35, answered: 25, qualified: 8 },
  { date: 'Sun', calls: 22, answered: 15, qualified: 5 },
];

export default function CallsChart() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-dark-100 mb-6">Call Activity</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorCalls)"
              strokeWidth={2}
              name="Total Calls"
            />
            <Area
              type="monotone"
              dataKey="answered"
              stroke="#34d399"
              fillOpacity={1}
              fill="url(#colorAnswered)"
              strokeWidth={2}
              name="Answered"
            />
            <Area
              type="monotone"
              dataKey="qualified"
              stroke="#a78bfa"
              fillOpacity={1}
              fill="url(#colorQualified)"
              strokeWidth={2}
              name="Qualified"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
