import { render, screen } from '@testing-library/react';
import { Phone } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';

describe('ui/StatsCard', () => {
  it('renders title and value with no trend or subtitle', () => {
    render(<StatsCard title="Calls" value={42} icon={Phone} />);
    expect(screen.getByText('Calls')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a positive trend and subtitle', () => {
    render(<StatsCard title="Calls" value="10" icon={Phone} trend={{ value: 12, isPositive: true }} subtitle="vs last week" />);
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('renders a negative trend with the absolute value', () => {
    render(<StatsCard title="Calls" value="10" icon={Phone} trend={{ value: -7, isPositive: false }} />);
    expect(screen.getByText('7%')).toBeInTheDocument();
  });
});
