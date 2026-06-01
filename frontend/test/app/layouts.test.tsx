import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RootLayout from '@/app/layout';
import DashboardRouteLayout from '@/app/dashboard/layout';
import AnalyticsLayout from '@/app/analytics/layout';
import AiModelsLayout from '@/app/ai-models/layout';
import BillingLayout from '@/app/billing/layout';
import CallsLayout from '@/app/calls/layout';
import CampaignsLayout from '@/app/campaigns/layout';
import LeadsLayout from '@/app/leads/layout';
import SettingsLayout from '@/app/settings/layout';
import WhatsAppLayout from '@/app/whatsapp/layout';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

// Avoid running the real AuthProvider effects (router/api) for the root layout.
jest.mock('@/contexts/AuthContext', () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('app + component layouts', () => {
  it('DashboardLayout renders the sidebar alongside children', () => {
    render(
      <DashboardLayout>
        <p>child content</p>
      </DashboardLayout>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.getByText('CallGenie AI')).toBeInTheDocument();
  });

  it('route layout wraps children in the dashboard layout', () => {
    render(<DashboardRouteLayout>{<p>routed child</p>}</DashboardRouteLayout>);
    expect(screen.getByText('routed child')).toBeInTheDocument();
  });

  it.each([
    ['analytics', AnalyticsLayout],
    ['ai-models', AiModelsLayout],
    ['billing', BillingLayout],
    ['calls', CallsLayout],
    ['campaigns', CampaignsLayout],
    ['leads', LeadsLayout],
    ['settings', SettingsLayout],
    ['whatsapp', WhatsAppLayout],
  ])('%s route layout wraps children in the dashboard layout', (name, Layout) => {
    render(<Layout>{<p>{`child-${name}`}</p>}</Layout>);
    expect(screen.getByText(`child-${name}`)).toBeInTheDocument();
  });

  it('RootLayout renders children inside the providers', () => {
    const orig = console.error;
    // suppress expected html/body nesting warnings under jsdom
    console.error = jest.fn();
    render(<RootLayout>{<span>root child</span>}</RootLayout>);
    expect(screen.getByText('root child')).toBeInTheDocument();
    console.error = orig;
  });
});
