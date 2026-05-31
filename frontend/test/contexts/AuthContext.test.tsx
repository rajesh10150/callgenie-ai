import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const push = jest.fn();
let mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => mockPathname,
}));
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), setToken: jest.fn(), clearToken: jest.fn() },
}));

const mockApi = api as unknown as {
  get: jest.Mock; post: jest.Mock; setToken: jest.Mock; clearToken: jest.Mock;
};

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

function setup() {
  return renderHook(() => useAuth(), { wrapper });
}

const profile = { user: { id: 'u1' }, organization: { id: 'o1' }, role: 'owner' };

describe('contexts/AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPathname = '/dashboard';
  });

  it('throws when used outside the provider', () => {
    const orig = console.error;
    console.error = jest.fn();
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    console.error = orig;
  });

  describe('mount bootstrap', () => {
    it('redirects to login when no token on a protected path', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(push).toHaveBeenCalledWith('/auth/login');
    });

    it('does not redirect on a public path with no token', async () => {
      mockPathname = '/';
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(push).not.toHaveBeenCalled();
    });

    it('loads the profile when a token exists and redirects away from auth pages', async () => {
      mockPathname = '/auth/login';
      window.localStorage.setItem('callgenie_token', 't');
      mockApi.get.mockResolvedValue({ success: true, data: profile });
      const { result } = setup();
      await waitFor(() => expect(result.current.user).toEqual(profile.user));
      expect(mockApi.setToken).toHaveBeenCalledWith('t');
      expect(push).toHaveBeenCalledWith('/dashboard');
    });

    it('loads the profile without redirecting on a normal page', async () => {
      window.localStorage.setItem('callgenie_token', 't');
      mockApi.get.mockResolvedValue({ success: true, data: profile });
      const { result } = setup();
      await waitFor(() => expect(result.current.role).toBe('owner'));
      expect(push).not.toHaveBeenCalled();
    });

    it('clears an invalid token and redirects', async () => {
      window.localStorage.setItem('callgenie_token', 'bad');
      mockApi.get.mockResolvedValue({ success: false });
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(window.localStorage.getItem('callgenie_token')).toBeNull();
      expect(push).toHaveBeenCalledWith('/auth/login');
    });

    it('handles a thrown error while loading the profile', async () => {
      window.localStorage.setItem('callgenie_token', 'bad');
      mockApi.get.mockRejectedValue(new Error('boom'));
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(mockApi.clearToken).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    beforeEach(() => { mockPathname = '/auth/login'; });

    it('stores the token and redirects on success', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockResolvedValue({ success: true, data: { ...profile, token: 'tok' } });
      await act(async () => { await result.current.login('a@b.com', 'pw'); });
      expect(window.localStorage.getItem('callgenie_token')).toBe('tok');
      expect(push).toHaveBeenCalledWith('/dashboard');
    });

    it('sets an error on failed login', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockResolvedValue({ success: false, error: { message: 'bad creds' } });
      await act(async () => { await result.current.login('a@b.com', 'pw'); });
      expect(result.current.error).toBe('bad creds');
    });

    it('sets a connection error when login throws', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockRejectedValue(new Error('network'));
      await act(async () => { await result.current.login('a@b.com', 'pw'); });
      expect(result.current.error).toContain('Unable to connect');
    });
  });

  describe('register', () => {
    beforeEach(() => { mockPathname = '/auth/register'; });
    const data = { email: 'a@b.com', password: 'pw', full_name: 'A', org_name: 'Org', industry: 'other' };

    it('registers and redirects on success', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockResolvedValue({ success: true, data: { ...profile, token: 'tok' } });
      await act(async () => { await result.current.register(data); });
      expect(result.current.role).toBe('owner');
      expect(push).toHaveBeenCalledWith('/dashboard');
    });

    it('sets an error on failed registration', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockResolvedValue({ success: false, error: { message: 'taken' } });
      await act(async () => { await result.current.register(data); });
      expect(result.current.error).toBe('taken');
    });

    it('sets a connection error when registration throws', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockRejectedValue(new Error('network'));
      await act(async () => { await result.current.register(data); });
      expect(result.current.error).toContain('Unable to connect');
    });
  });

  describe('logout and clearError', () => {
    beforeEach(() => { mockPathname = '/'; });

    it('clears state and redirects to login', async () => {
      window.localStorage.setItem('callgenie_token', 't');
      const { result } = setup();
      await act(async () => { result.current.logout(); });
      expect(window.localStorage.getItem('callgenie_token')).toBeNull();
      expect(result.current.user).toBeNull();
      expect(push).toHaveBeenCalledWith('/auth/login');
    });

    it('clears the error message', async () => {
      const { result } = setup();
      await waitFor(() => expect(result.current.loading).toBe(false));
      mockApi.post.mockResolvedValue({ success: false, error: { message: 'x' } });
      await act(async () => { await result.current.login('a@b.com', 'pw'); });
      expect(result.current.error).toBe('x');
      act(() => result.current.clearError());
      expect(result.current.error).toBeNull();
    });
  });
});
