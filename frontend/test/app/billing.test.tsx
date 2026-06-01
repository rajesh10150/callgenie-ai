import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BillingPage from '@/app/billing/page';
import api from '@/lib/api';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockApi = api as unknown as { post: jest.Mock };

describe('app/billing', () => {
  it('renders usage and available plans', () => {
    render(<BillingPage />);
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Call Minutes')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('subscribes successfully via the Upgrade Plan button', async () => {
    mockApi.post.mockResolvedValue({ success: true, data: { plan: 'professional' } });
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Upgrade Plan'));
    expect(await screen.findByText(/Upgrade to Professional initiated/)).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/billing/subscribe', { plan: 'professional' });
  });

  it('shows the server error message when the API reports failure', async () => {
    mockApi.post.mockResolvedValue({ success: false, error: { message: 'no go' } });
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Upgrade Plan'));
    expect(await screen.findByText('no go')).toBeInTheDocument();
  });

  it('shows a connection error when the request throws', async () => {
    mockApi.post.mockRejectedValue(new Error('network'));
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Upgrade Plan'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('upgrades from an Enterprise plan card', async () => {
    mockApi.post.mockResolvedValue({ success: true, data: { plan: 'enterprise' } });
    render(<BillingPage />);
    const card = screen.getByText('Enterprise').closest('.glass-card') as HTMLElement;
    fireEvent.click(card.querySelector('button') as HTMLElement);
    expect(await screen.findByText(/Upgrade to Enterprise initiated/)).toBeInTheDocument();
  });
});
