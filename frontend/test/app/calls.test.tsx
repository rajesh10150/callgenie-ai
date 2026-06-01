import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CallsPage from '@/app/calls/page';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/api';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/hooks/useApiData', () => ({ __esModule: true, useApiData: jest.fn() }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));

const mockUseApiData = useApiData as jest.Mock;
const mockApi = api as unknown as { get: jest.Mock };

const callRecords = [
  {
    id: 1,
    leads: { first_name: 'Aisha', last_name: 'Khan', phone: '+91 111' },
    campaigns: { name: 'Q1 Outreach' },
    status: 'completed',
    sentiment: 'positive',
    lead_qualified: true,
    ai_model_used: 'GPT-4.1',
    cost: '0.50',
    duration_seconds: 120,
    created_at: '2024-02-15T10:30:00Z',
    recording_url: 'https://rec.example/1',
  },
  {}, // minimal record -> Unknown Lead / queued / neutral defaults
  { id: 3, lead_name: 'Zed Brown', campaign: 'Insurance', status: 'failed', sentiment: 'weird', ai_model: 'X' },
];

beforeEach(() => {
  mockUseApiData.mockReturnValue({ data: callRecords });
});

describe('app/calls', () => {
  it('normalizes and renders call records (nested, minimal, and unknown sentiment)', () => {
    render(<CallsPage />);
    expect(screen.getByText('Call History')).toBeInTheDocument();
    expect(screen.getByText('Aisha Khan')).toBeInTheDocument();
    expect(screen.getByText('Unknown Lead')).toBeInTheDocument();
    expect(screen.getByText('Zed Brown')).toBeInTheDocument();
    expect(screen.getByText('Q1 Outreach')).toBeInTheDocument();
  });

  it('filters by search text', () => {
    render(<CallsPage />);
    fireEvent.change(screen.getByPlaceholderText('Search calls...'), { target: { value: 'aisha' } });
    expect(screen.getByText('Aisha Khan')).toBeInTheDocument();
    expect(screen.queryByText('Zed Brown')).not.toBeInTheDocument();
  });

  it('filters by status', () => {
    render(<CallsPage />);
    fireEvent.change(screen.getByDisplayValue('All Status'), { target: { value: 'failed' } });
    expect(screen.getByText('Zed Brown')).toBeInTheDocument();
    expect(screen.queryByText('Aisha Khan')).not.toBeInTheDocument();
  });

  it('opens a recording when available and warns when missing', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<CallsPage />);
    const playButtons = screen.getAllByTitle('Play recording');
    fireEvent.click(playButtons[0]); // first record has a recording_url
    expect(openSpy).toHaveBeenCalledWith('https://rec.example/1', '_blank', 'noopener,noreferrer');
    fireEvent.click(playButtons[1]); // minimal record has none
    expect(screen.getByText('No recording available for this call.')).toBeInTheDocument();
    openSpy.mockRestore();
  });

  it('loads a transcript and renders the modal with mixed entry shapes', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: {
        summary: 'Great call',
        entries: [
          { speaker: 'AI agent', text: 'Hello there' },
          { role: 'customer', message: 'Hi back' },
          { content: 'plain content' },
        ],
      },
    });
    render(<CallsPage />);
    fireEvent.click(screen.getAllByTitle('View transcript')[0]);
    expect(await screen.findByText('Great call')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi back')).toBeInTheDocument();
    expect(screen.getByText('plain content')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Great call')).not.toBeInTheDocument();
  });

  it('flashes an error when the transcript is empty', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: { entries: [] } });
    render(<CallsPage />);
    fireEvent.click(screen.getAllByTitle('View transcript')[0]);
    expect(await screen.findByText('Transcript not available for this call.')).toBeInTheDocument();
  });

  it('flashes an error when the transcript request throws', async () => {
    mockApi.get.mockRejectedValue(new Error('boom'));
    render(<CallsPage />);
    fireEvent.click(screen.getAllByTitle('View transcript')[0]);
    expect(await screen.findByText('Transcript not available for this call.')).toBeInTheDocument();
  });
});
