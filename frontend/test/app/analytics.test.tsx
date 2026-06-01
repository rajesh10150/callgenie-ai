import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from '@/app/analytics/page';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

describe('app/analytics', () => {
  it('renders overview stats, charts and the conversion funnel', () => {
    render(<AnalyticsPage />);
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Calls by Day')).toBeInTheDocument();
    expect(screen.getByText('Conversion Funnel')).toBeInTheDocument();
    // funnel renders first (100%) and subsequent (computed) conversion rates
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('Converted')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
