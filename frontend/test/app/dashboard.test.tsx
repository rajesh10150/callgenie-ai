import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { useApiData } from '@/hooks/useApiData';

jest.mock('@/hooks/useApiData', () => ({ __esModule: true, useApiData: jest.fn() }));
jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const mockUseApiData = useApiData as jest.Mock;

describe('app/dashboard', () => {
  it('renders stat cards and widgets from overview data', () => {
    mockUseApiData.mockReturnValue({
      data: {
        overview: {
          total_calls: 2847,
          total_leads: 1234,
          total_campaigns: 12,
          qualified_leads: 567,
          appointments_booked: 89,
          answer_rate: 72,
          qualification_rate: 35.2,
        },
      },
    });
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('2,847')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('567 qualified')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    // widgets present
    expect(screen.getByText('Call Activity')).toBeInTheDocument();
    expect(screen.getByText('Recent Calls')).toBeInTheDocument();
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
  });
});
