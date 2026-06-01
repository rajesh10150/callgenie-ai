import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CampaignsPage from '@/app/campaigns/page';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/api';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/hooks/useApiData', () => ({ __esModule: true, useApiData: jest.fn() }));
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), delete: jest.fn() },
}));

const mockUseApiData = useApiData as jest.Mock;
const mockApi = api as unknown as { post: jest.Mock; delete: jest.Mock };
const refetch = jest.fn();

const base = {
  type: 'cold_call', language: 'en', ai_model: 'gpt-4.1',
  calls_answered: 0, appointments_booked: 0, created_at: '2024-01-01',
};
const campaigns = [
  { ...base, id: 'c1', name: 'Active Camp', status: 'active', total_leads: 100, calls_made: 50, leads_qualified: 10 },
  { ...base, id: 'c2', name: 'Paused Camp', status: 'paused', total_leads: 0, calls_made: 0, leads_qualified: 0 },
  { ...base, id: 'c3', name: 'Draft Camp', status: 'draft', total_leads: 800, calls_made: 0, leads_qualified: 0 },
];

const card = (name: string) => screen.getByText(name).closest('.glass-card-hover') as HTMLElement;

beforeEach(() => mockUseApiData.mockReturnValue({ data: campaigns, refetch }));

describe('app/campaigns', () => {
  it('renders campaign cards and filters by search and status', () => {
    render(<CampaignsPage />);
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Active Camp')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search campaigns...'), { target: { value: 'paused' } });
    expect(screen.getByText('Paused Camp')).toBeInTheDocument();
    expect(screen.queryByText('Active Camp')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search campaigns...'), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('All Status'), { target: { value: 'draft' } });
    expect(screen.getByText('Draft Camp')).toBeInTheDocument();
    expect(screen.queryByText('Active Camp')).not.toBeInTheDocument();
  });

  it('validates campaign name on create', () => {
    render(<CampaignsPage />);
    fireEvent.click(screen.getByText('New Campaign'));
    fireEvent.click(screen.getByText('Create Campaign'));
    expect(screen.getByText('Campaign name is required.')).toBeInTheDocument();
    expect(mockApi.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('New Campaign'));
    fireEvent.click(screen.getByLabelText('Close'));
  });

  it('closes the row menu when clicking the overlay', () => {
    render(<CampaignsPage />);
    fireEvent.click(within(card('Active Camp')).getAllByRole('button')[0]);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    const overlay = document.querySelector('.fixed.inset-0.z-10') as HTMLElement;
    fireEvent.click(overlay);
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('creates a campaign successfully', async () => {
    mockApi.post.mockResolvedValue({ success: true });
    render(<CampaignsPage />);
    fireEvent.click(screen.getByText('New Campaign'));
    fireEvent.change(screen.getByPlaceholderText('Q1 Real Estate Outreach'), { target: { value: 'New One' } });
    const form = screen.getByText('Create Campaign').closest('form') as HTMLElement;
    const selects = within(form).getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'follow_up' } });
    fireEvent.change(selects[1], { target: { value: 'hi' } });
    fireEvent.change(selects[2], { target: { value: 'gemini' } });
    fireEvent.click(screen.getByText('Create Campaign'));
    expect(await screen.findByText('Created "New One"')).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/campaigns', {
      name: 'New One', type: 'follow_up', language: 'hi', ai_model: 'gemini',
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('reports create failure and connection errors', async () => {
    mockApi.post.mockResolvedValueOnce({ success: false, error: { message: 'dup' } });
    render(<CampaignsPage />);
    fireEvent.click(screen.getByText('New Campaign'));
    fireEvent.change(screen.getByPlaceholderText('Q1 Real Estate Outreach'), { target: { value: 'X' } });
    fireEvent.click(screen.getByText('Create Campaign'));
    expect(await screen.findByText('dup')).toBeInTheDocument();
    mockApi.post.mockRejectedValueOnce(new Error('net'));
    fireEvent.click(screen.getByText('Create Campaign'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('pauses an active campaign, resumes a paused one and starts a draft', async () => {
    mockApi.post.mockResolvedValue({ success: true });
    render(<CampaignsPage />);
    fireEvent.click(within(card('Active Camp')).getByText('Pause'));
    expect(await screen.findByText('Active Camp paused')).toBeInTheDocument();
    fireEvent.click(within(card('Paused Camp')).getByText('Resume'));
    expect(await screen.findByText('Paused Camp started')).toBeInTheDocument();
    fireEvent.click(within(card('Draft Camp')).getByText('Start'));
    expect(await screen.findByText('Draft Camp started')).toBeInTheDocument();
    expect(mockApi.post).toHaveBeenCalledWith('/campaigns/c1/pause');
    expect(mockApi.post).toHaveBeenCalledWith('/campaigns/c2/start');
  });

  it('handles status-change failure and connection error', async () => {
    mockApi.post.mockResolvedValueOnce({ success: false, error: { message: 'cannot' } });
    render(<CampaignsPage />);
    fireEvent.click(within(card('Active Camp')).getByText('Pause'));
    expect(await screen.findByText('cannot')).toBeInTheDocument();
    mockApi.post.mockRejectedValueOnce(new Error('net'));
    fireEvent.click(within(card('Active Camp')).getByText('Pause'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('deletes a campaign via the row menu', async () => {
    mockApi.delete.mockResolvedValue({ success: true });
    render(<CampaignsPage />);
    fireEvent.click(within(card('Active Camp')).getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText('Deleted "Active Camp"')).toBeInTheDocument();
    expect(mockApi.delete).toHaveBeenCalledWith('/campaigns/c1');
  });

  it('reports delete failure and connection error', async () => {
    mockApi.delete.mockResolvedValueOnce({ success: false, error: { message: 'locked' } });
    render(<CampaignsPage />);
    fireEvent.click(within(card('Active Camp')).getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText('locked')).toBeInTheDocument();
    fireEvent.click(within(card('Active Camp')).getAllByRole('button')[0]);
    mockApi.delete.mockRejectedValueOnce(new Error('net'));
    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });
});
