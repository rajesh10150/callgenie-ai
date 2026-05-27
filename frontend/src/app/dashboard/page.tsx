'use client';

import { Phone, Users, Megaphone, CalendarCheck, TrendingUp, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/ui/StatsCard';
import CallsChart from '@/components/dashboard/CallsChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentCalls from '@/components/dashboard/RecentCalls';
import ActiveCampaigns from '@/components/dashboard/ActiveCampaigns';

const stats = [
  {
    title: 'Total Calls',
    value: '2,847',
    icon: Phone,
    trend: { value: 12.5, isPositive: true },
    subtitle: 'Last 30 days',
  },
  {
    title: 'Active Leads',
    value: '1,234',
    icon: Users,
    trend: { value: 8.2, isPositive: true },
    subtitle: '567 qualified',
  },
  {
    title: 'Campaigns',
    value: '12',
    icon: Megaphone,
    trend: { value: 3, isPositive: true },
    subtitle: '3 active',
  },
  {
    title: 'Appointments',
    value: '89',
    icon: CalendarCheck,
    trend: { value: 15.3, isPositive: true },
    subtitle: 'This month',
  },
  {
    title: 'Answer Rate',
    value: '72%',
    icon: TrendingUp,
    trend: { value: 2.1, isPositive: true },
    subtitle: 'vs 68% last month',
  },
  {
    title: 'Total Spend',
    value: '$1,245',
    icon: DollarSign,
    trend: { value: 5.2, isPositive: false },
    subtitle: 'This billing cycle',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of your AI calling performance"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CallsChart />
        </div>
        <SentimentChart />
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentCalls />
        <ActiveCampaigns />
      </div>
    </div>
  );
}
