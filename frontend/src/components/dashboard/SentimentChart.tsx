'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Positive', value: 45, color: '#34d399' },
  { name: 'Neutral', value: 35, color: '#fbbf24' },
  { name: 'Negative', value: 20, color: '#f87171' },
];

export default function SentimentChart() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-dark-100 mb-6">Sentiment Analysis</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-dark-400">{item.name}</span>
            <span className="text-sm font-medium text-dark-200">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
