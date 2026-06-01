import React from 'react';
import { render, screen } from '@testing-library/react';
import CallsChart from '@/components/dashboard/CallsChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import RecentCalls from '@/components/dashboard/RecentCalls';
import ActiveCampaigns from '@/components/dashboard/ActiveCampaigns';

describe('dashboard/CallsChart', () => {
  it('renders the call activity heading', () => {
    render(<CallsChart />);
    expect(screen.getByText('Call Activity')).toBeInTheDocument();
  });
});

describe('dashboard/SentimentChart', () => {
  it('renders the sentiment legend with all categories', () => {
    render(<SentimentChart />);
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('Negative')).toBeInTheDocument();
  });
});

describe('dashboard/RecentCalls', () => {
  it('renders calls with the three sentiment variants', () => {
    render(<RecentCalls />);
    expect(screen.getByText('Recent Calls')).toBeInTheDocument();
    // positive, neutral and negative rows all present in fixture data
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rahul Kumar')).toBeInTheDocument();
    expect(screen.getByText('Sneha Patel')).toBeInTheDocument();
    // qualified badge appears for qualified calls
    expect(screen.getAllByText('Qualified').length).toBeGreaterThan(0);
  });
});

describe('dashboard/ActiveCampaigns', () => {
  it('renders each campaign with progress and stats', () => {
    render(<ActiveCampaigns />);
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Q1 Real Estate Outreach')).toBeInTheDocument();
    expect(screen.getByText('Insurance Lead Gen')).toBeInTheDocument();
    expect(screen.getByText('Clinic Appointment Setter')).toBeInTheDocument();
    expect(screen.getAllByText(/complete/).length).toBe(3);
  });
});
