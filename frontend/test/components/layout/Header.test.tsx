import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const logout = jest.fn();

describe('components/layout/Header', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { full_name: 'Test Alpha', email: 'a@b.com' },
      logout,
    });
  });

  it('renders title and subtitle', () => {
    render(<Header title="Dashboard" subtitle="Overview" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('derives initials from the user full name', () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByText('TA')).toBeInTheDocument();
    expect(screen.getByText('Test Alpha')).toBeInTheDocument();
  });

  it('falls back to U and hides name when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null, logout });
    render(<Header title="Dashboard" />);
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.queryByText('Test Alpha')).not.toBeInTheDocument();
  });

  it('toggles the notifications dropdown and clears the unread dot', () => {
    const { container } = render(<Header title="Dashboard" />);
    const bellButton = container.querySelector('button')!;
    fireEvent.click(bellButton);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('New lead imported from CSV')).toBeInTheDocument();
  });

  it('opens the user menu and logs out', () => {
    render(<Header title="Dashboard" />);
    fireEvent.click(screen.getByText('Test Alpha'));
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sign Out'));
    expect(logout).toHaveBeenCalled();
  });

  it('closes menus when clicking outside', () => {
    render(<Header title="Dashboard" />);
    fireEvent.click(screen.getByText('Test Alpha'));
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('a@b.com')).not.toBeInTheDocument();
  });
});
