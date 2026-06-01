import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/layout/Sidebar';

let mockPathname = '/dashboard';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('components/layout/Sidebar', () => {
  beforeEach(() => {
    mockPathname = '/dashboard';
  });

  it('renders all navigation items and the brand', () => {
    render(<Sidebar />);
    expect(screen.getByText('CallGenie AI')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('marks the active route based on the pathname (including nested paths)', () => {
    mockPathname = '/leads/123';
    render(<Sidebar />);
    const leadsLink = screen.getByText('Leads').closest('a')!;
    expect(leadsLink.className).toContain('sidebar-link-active');
  });

  it('collapses and expands when toggling, hiding labels when collapsed', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    const getToggle = () => screen.getAllByRole('button').slice(-1)[0];
    fireEvent.click(getToggle());
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    fireEvent.click(getToggle());
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
