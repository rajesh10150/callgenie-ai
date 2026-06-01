import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '@/app/settings/page';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

jest.mock('@/components/layout/Header', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/contexts/AuthContext', () => ({ __esModule: true, useAuth: jest.fn() }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { put: jest.fn() } }));

const mockUseAuth = useAuth as jest.Mock;
const mockApi = api as unknown as { put: jest.Mock };

const withUser = () =>
  mockUseAuth.mockReturnValue({
    user: { full_name: 'Test User', email: 'u@b.com', phone: '123' },
    organization: { name: 'Acme', industry: 'real_estate', plan: 'starter' },
  });

describe('app/settings', () => {
  beforeEach(() => {
    withUser();
  });

  it('populates the profile form from the auth user and organization', () => {
    render(<SettingsPage />);
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('u@b.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument();
  });

  it('renders empty profile when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null, organization: null });
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('validates that the full name is required', () => {
    render(<SettingsPage />);
    fireEvent.change(screen.getByDisplayValue('Test User'), { target: { value: '  ' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(mockApi.put).not.toHaveBeenCalled();
  });

  it('saves the profile successfully', async () => {
    mockApi.put.mockResolvedValue({ success: true });
    render(<SettingsPage />);
    fireEvent.change(screen.getByDisplayValue('123'), { target: { value: '5551234' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
    expect(mockApi.put).toHaveBeenCalledWith('/auth/me', { full_name: 'Test User', phone: '5551234' });
  });

  it('shows server error on failed save', async () => {
    mockApi.put.mockResolvedValue({ success: false, error: { message: 'bad' } });
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Save Changes'));
    expect(await screen.findByText('bad')).toBeInTheDocument();
  });

  it('shows connection error when save throws', async () => {
    mockApi.put.mockRejectedValue(new Error('x'));
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Save Changes'));
    expect(await screen.findByText(/Unable to connect to server/)).toBeInTheDocument();
  });

  it('toggles each notification preference', () => {
    render(<SettingsPage />);
    const toggleFor = (label: string) =>
      screen.getByText(label).closest('div')!.querySelector('button') as HTMLElement;
    fireEvent.click(toggleFor('Email Notifications'));
    expect(screen.getByText('Email notifications disabled')).toBeInTheDocument();
    fireEvent.click(toggleFor('Campaign Completion Alerts'));
    expect(screen.getByText('Campaign completion alerts disabled')).toBeInTheDocument();
    fireEvent.click(toggleFor('Daily Summary Report'));
    expect(screen.getByText('Daily summary report disabled')).toBeInTheDocument();
  });

  it('handles security and danger-zone actions', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Change Password'));
    expect(screen.getByText('Password reset link sent to your email.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Enable Two-Factor Authentication'));
    expect(screen.getByText('Two-factor authentication setup is coming soon.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete Organization'));
    expect(screen.getByText(/Organization deletion requires confirmation/)).toBeInTheDocument();
    confirmSpy.mockReturnValue(false);
    fireEvent.click(screen.getByText('Delete Organization'));
    confirmSpy.mockRestore();
  });
});
