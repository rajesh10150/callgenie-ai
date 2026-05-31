import {
  cn, formatDuration, formatNumber, formatCurrency, formatPercentage,
  formatDate, formatDateTime, getInitials, getStatusColor, LANGUAGES, AI_MODELS,
} from '@/lib/utils';

describe('lib/utils', () => {
  describe('cn', () => {
    it('merges and dedupes tailwind classes', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
      expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold');
    });
  });

  describe('formatDuration', () => {
    it.each([
      [0, '0:00'],
      [5, '0:05'],
      [65, '1:05'],
      [600, '10:00'],
    ])('formats %i seconds as %s', (input, expected) => {
      expect(formatDuration(input)).toBe(expected);
    });
  });

  describe('formatNumber', () => {
    it.each([
      [500, '500'],
      [1500, '1.5K'],
      [2_000_000, '2.0M'],
    ])('formats %i as %s', (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });

  describe('formatCurrency', () => {
    it('formats USD by default', () => {
      expect(formatCurrency(10)).toBe('$10.00');
    });
    it('respects an explicit currency', () => {
      expect(formatCurrency(10, 'EUR')).toContain('10.00');
    });
  });

  describe('formatPercentage', () => {
    it('multiplies and appends a percent sign', () => {
      expect(formatPercentage(0.123)).toBe('12.3%');
    });
  });

  describe('formatDate / formatDateTime', () => {
    it('formats a date', () => {
      expect(formatDate(new Date(2024, 0, 15, 12))).toBe('Jan 15, 2024');
    });
    it('accepts a date string', () => {
      expect(formatDate('2024-01-15T12:00:00')).toBe('Jan 15, 2024');
    });
    it('formats a date with time', () => {
      const out = formatDateTime(new Date(2024, 0, 15, 13, 5));
      expect(out).toContain('Jan 15, 2024');
      expect(out).toMatch(/1:05/);
    });
  });

  describe('getInitials', () => {
    it.each([
      ['John Doe', 'JD'],
      ['alice', 'A'],
      ['a b c', 'AB'],
    ])('returns initials for %s', (input, expected) => {
      expect(getInitials(input)).toBe(expected);
    });
  });

  describe('getStatusColor', () => {
    it('maps known statuses', () => {
      expect(getStatusColor('active')).toBe('badge-success');
      expect(getStatusColor('failed')).toBe('badge-danger');
    });
    it('falls back to neutral for unknown statuses', () => {
      expect(getStatusColor('mystery')).toBe('badge-neutral');
    });
  });

  describe('constants', () => {
    it('exposes language and model registries', () => {
      expect(LANGUAGES.en).toBe('English');
      expect(AI_MODELS['gpt-4.1'].label).toBe('GPT-4.1');
    });
  });
});
