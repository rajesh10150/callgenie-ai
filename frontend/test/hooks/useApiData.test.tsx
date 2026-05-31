import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiData } from '@/hooks/useApiData';
import api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGet = api.get as jest.Mock;

describe('hooks/useApiData', () => {
  it('returns fetched data and clears the fallback flag on success', async () => {
    mockGet.mockResolvedValue({ success: true, data: [{ id: '1' }] });
    const { result } = renderHook(() => useApiData({ endpoint: '/leads', fallback: [] }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: '1' }]);
    expect(result.current.isUsingFallback).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('keeps the fallback and sets an error when the API reports failure', async () => {
    mockGet.mockResolvedValue({ success: false, error: { message: 'nope' } });
    const { result } = renderHook(() => useApiData({ endpoint: '/leads', fallback: ['fb'] }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['fb']);
    expect(result.current.error).toBe('nope');
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('uses a generic error message when none is provided', async () => {
    mockGet.mockResolvedValue({ success: false });
    const { result } = renderHook(() => useApiData({ endpoint: '/x', fallback: null }));
    await waitFor(() => expect(result.current.error).toBe('Request failed'));
  });

  it('handles a thrown error (network failure)', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useApiData({ endpoint: '/x', fallback: 0 }));
    await waitFor(() => expect(result.current.error).toBe('Unable to connect to server'));
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('does not fetch when disabled', () => {
    mockGet.mockResolvedValue({ success: true, data: 1 });
    const { result } = renderHook(() => useApiData({ endpoint: '/x', fallback: 0, enabled: false }));
    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('refetches on demand', async () => {
    mockGet.mockResolvedValue({ success: true, data: 1 });
    const { result } = renderHook(() => useApiData({ endpoint: '/x', fallback: 0 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    mockGet.mockResolvedValue({ success: true, data: 2 });
    await act(async () => { result.current.refetch(); });
    await waitFor(() => expect(result.current.data).toBe(2));
  });
});
