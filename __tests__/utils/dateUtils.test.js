import {
  toDateString,
  getTodayString,
  toTimeString,
  describeAge,
  formatUpdatedAt,
  isSameLocalDay,
} from '../../src/utils/dateUtils';

describe('toDateString', () => {
  test('formats a date as YYYY-MM-DD', () => {
    const date = new Date(2026, 8, 4); // Months start from 0, so 8 is September.
    expect(toDateString(date)).toBe('2026-09-04');
  });

  test('pads single-digit months and days', () => {
    const date = new Date(2026, 0, 5);
    expect(toDateString(date)).toBe('2026-01-05');
  });

  // Make sure the local date is used instead of the UTC date.
  test('uses the local date rather than UTC', () => {
    const localMidnight = new Date(2026, 8, 4, 0, 0, 0);
    expect(toDateString(localMidnight)).toBe('2026-09-04');
  });
});

describe('getTodayString', () => {
  test('returns something in the right format', () => {
    expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('toTimeString', () => {
  test('formats as 24-hour time', () => {
    const date = new Date(2026, 8, 4, 14, 5);
    expect(toTimeString(date)).toBe('14:05');
  });

  test('pads a single-digit hour', () => {
    const date = new Date(2026, 8, 4, 9, 30);
    expect(toTimeString(date)).toBe('09:30');
  });

  test('handles midnight', () => {
    const date = new Date(2026, 8, 4, 0, 0);
    expect(toTimeString(date)).toBe('00:00');
  });
});

describe('describeAge', () => {
  // Check that timestamps are displayed in an easy to understand format.
  test('a fresh timestamp is just now', () =>
    expect(describeAge(new Date().toISOString())).toBe('just now'));

  test('describes minutes', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000).toISOString();
    expect(describeAge(thirtyMinutesAgo)).toBe('30 minutes ago');
  });

  test('uses the singular for one minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    expect(describeAge(oneMinuteAgo)).toBe('1 minute ago');
  });

  test('describes hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(describeAge(threeHoursAgo)).toBe('3 hours ago');
  });

  test('describes days', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(describeAge(twoDaysAgo)).toBe('2 days ago');
  });

  test('returns empty for a missing timestamp', () =>
    expect(describeAge(null)).toBe(''));
});

describe('formatUpdatedAt', () => {
  test('includes the time', () => {
    const date = new Date(2026, 8, 4, 14, 5);
    expect(formatUpdatedAt(date.toISOString())).toBe('Updated 14:05');
  });

  test('handles never having updated', () =>
    expect(formatUpdatedAt(null)).toBe('Never updated'));
});

describe('isSameLocalDay', () => {
  // Used to check whether two timestamps belong to the same local day.
  test('two times on the same day match', () => {
    const morning = new Date(2026, 8, 4, 8, 0).toISOString();
    const evening = new Date(2026, 8, 4, 20, 0).toISOString();
    expect(isSameLocalDay(morning, evening)).toBe(true);
  });

  test('different days do not match', () => {
    const today = new Date(2026, 8, 4, 12, 0).toISOString();
    const tomorrow = new Date(2026, 8, 5, 12, 0).toISOString();
    expect(isSameLocalDay(today, tomorrow)).toBe(false);
  });

  test('a missing timestamp is not the same day', () =>
    expect(isSameLocalDay(null, new Date().toISOString())).toBe(false));
});