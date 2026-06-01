import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/auth/login/page';
import RegisterPage from '@/app/auth/register/page';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('app/auth/login', () => {
  const login = jest.fn();
  const clearError = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ login, loading: false, error: null, clearError });
  });

  it('submits typed credentials', () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));
    expect(login).toHaveBeenCalledWith('a@b.com', 'secret');
  });

  it('shows an error banner and dismisses it', () => {
    mockUseAuth.mockReturnValue({ login, loading: false, error: 'bad creds', clearError });
    render(<LoginPage />);
    expect(screen.getByText('bad creds')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dismiss'));
    expect(clearError).toHaveBeenCalled();
  });

  it('shows the loading state', () => {
    mockUseAuth.mockReturnValue({ login, loading: true, error: null, clearError });
    render(<LoginPage />);
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });
});

describe('app/auth/register', () => {
  const register = jest.fn();
  const clearError = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ register, loading: false, error: null, clearError });
  });

  it('updates all fields and submits the form data', () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane Roe' } });
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'jane@co.com' } });
    fireEvent.change(screen.getByPlaceholderText('Min 8 characters'), { target: { value: 'password1' } });
    fireEvent.change(screen.getByPlaceholderText('Your company name'), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByDisplayValue('Real Estate'), { target: { value: 'insurance' } });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }));
    expect(register).toHaveBeenCalledWith({
      full_name: 'Jane Roe',
      email: 'jane@co.com',
      password: 'password1',
      org_name: 'Acme',
      industry: 'insurance',
    });
  });

  it('shows an error banner and dismisses it', () => {
    mockUseAuth.mockReturnValue({ register, loading: false, error: 'taken', clearError });
    render(<RegisterPage />);
    expect(screen.getByText('taken')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dismiss'));
    expect(clearError).toHaveBeenCalled();
  });

  it('shows the loading state', () => {
    mockUseAuth.mockReturnValue({ register, loading: true, error: null, clearError });
    render(<RegisterPage />);
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });
});
