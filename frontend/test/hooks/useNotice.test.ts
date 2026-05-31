import { renderHook, act } from '@testing-library/react';
import { useNotice } from '@/hooks/useNotice';

describe('hooks/useNotice', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts with no notice', () => {
    const { result } = renderHook(() => useNotice());
    expect(result.current.notice).toBeNull();
  });

  it('flashes a notice and clears it after the timeout', () => {
    const { result } = renderHook(() => useNotice(1000));
    act(() => result.current.flash('success', 'Saved'));
    expect(result.current.notice).toEqual({ type: 'success', text: 'Saved' });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.notice).toBeNull();
  });

  it('resets the timer when flashed again', () => {
    const { result } = renderHook(() => useNotice(1000));
    act(() => result.current.flash('error', 'First'));
    act(() => { jest.advanceTimersByTime(500); });
    act(() => result.current.flash('success', 'Second'));
    act(() => { jest.advanceTimersByTime(500); });
    expect(result.current.notice).toEqual({ type: 'success', text: 'Second' });
    act(() => { jest.advanceTimersByTime(500); });
    expect(result.current.notice).toBeNull();
  });
});
