'use client';

import { Phone, Users, Megaphone, CalendarCheck, TrendingUp, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/ui/StatsCard';
import CallsChart from '@/components/dashboard/CallsChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentCalls from '@/components/dashboard/RecentCalls';
import ActiveCampaigns from '@/components/dashboard/ActiveCampaigns';
import { useApiData } from '@/hooks/useApiData';
import type { DashboardOverview } from '@/types';

interface DashboardResponse {
  overview: DashboardOverview;
}

const fallbackData: DashboardResponse = {
  overview: {
    total_calls: 2847,
    total_leads: 1234,
    total_campaigns: 12,
    qualified_leads: 567,
    appointments_booked: 89,
    answer_rate: 72,
    qualification_rate: 35.2,
  },
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function DashboardPage() {
  const { data } = useApiData<DashboardResponse>({
    endpoint: '/analytics/dashboard',
    fallback: fallbackData,
  });
  const overview = data.overview;

  const stats = [
    {
      title: 'Total Calls',
      value: formatNumber(overview.total_calls),
      icon: Phone,
      trend: { value: 12.5, isPositive: true },
      subtitle: 'Last 30 days',
    },
    {
      title: 'Active Leads',
      value: formatNumber(overview.total_leads),
      icon: Users,
      trend: { value: 8.2, isPositive: true },
      subtitle: `${formatNumber(overview.qualified_leads)} qualified`,
    },
    {
      title: 'Campaigns',
      value: String(overview.total_campaigns),
      icon: Megaphone,
      trend: { value: 3, isPositive: true },
      subtitle: '3 active',
    },
    {
      title: 'Appointments',
      value: String(overview.appointments_booked),
      icon: CalendarCheck,
      trend: { value: 15.3, isPositive: true },
      subtitle: 'This month',
    },
    {
      title: 'Answer Rate',
      value: `${overview.answer_rate}%`,
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
