import React from 'react';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';

describe('app/page (landing)', () => {
  it('renders hero, feature, stats and pricing sections', () => {
    render(<LandingPage />);
    expect(screen.getByText('Cold Calling')).toBeInTheDocument();
    expect(screen.getByText('AI Voice Agents')).toBeInTheDocument();
    // stats grid
    expect(screen.getByText('Languages supported')).toBeInTheDocument();
    // pricing tiers including the "popular" (Starter) branch
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    // CTA links
    expect(screen.getAllByText(/Start Free Trial|Get Started Free/).length).toBeGreaterThan(0);
    // secondary CTA + trust microcopy + industries strip
    expect(screen.getByText('See How It Works')).toBeInTheDocument();
    expect(screen.getByText(/No credit card required/)).toBeInTheDocument();
    expect(screen.getByText('Real Estate')).toBeInTheDocument();
  });
});
