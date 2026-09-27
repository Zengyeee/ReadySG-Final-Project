import {
  shouldNotify,
  recordNotification,
  buildRiskMessage,
} from '../../src/utils/notificationUtils';

const today = new Date(2026, 8, 26, 14, 0).toISOString();
const laterToday = new Date(2026, 8, 26, 18, 0).toISOString();
const tomorrow = new Date(2026, 8, 27, 9, 0).toISOString();

describe('shouldNotify', () => {
  test('notifies when risk rises from Low to High', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Low',
        lastNotified: {},
        type: 'haze',
        now: today,
      })
    ).toBe(true);
  });

  test('notifies when risk rises from Moderate to High', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Moderate',
        lastNotified: {},
        type: 'flood',
        now: today,
      })
    ).toBe(true);
  });

  // Good news does not need to interrupt anyone.
  test('does not notify when risk falls', () => {
    expect(
      shouldNotify({
        nextRisk: 'Low',
        previousRisk: 'High',
        lastNotified: {},
        type: 'haze',
        now: today,
      })
    ).toBe(false);
  });

  test('does not notify when risk is unchanged', () => {
    expect(
      shouldNotify({
        nextRisk: 'Moderate',
        previousRisk: 'Moderate',
        lastNotified: {},
        type: 'haze',
        now: today,
      })
    ).toBe(false);
  });

  test('never notifies about Low risk', () => {
    expect(
      shouldNotify({
        nextRisk: 'Low',
        previousRisk: 'Unavailable',
        lastNotified: {},
        type: 'flood',
        now: today,
      })
    ).toBe(false);
  });

  // Coming back online to find High risk is worth knowing about.
  test('notifies when recovering from Unavailable to High', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Unavailable',
        lastNotified: {},
        type: 'haze',
        now: today,
      })
    ).toBe(true);
  });

  // The rule that stops the app becoming annoying. Refreshing five times
  // during a hazy afternoon should not produce five notifications.
  test('does not repeat the same level on the same day', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Moderate',
        lastNotified: { haze: { risk: 'High', at: today } },
        type: 'haze',
        now: laterToday,
      })
    ).toBe(false);
  });

  test('notifies again the next day', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Moderate',
        lastNotified: { haze: { risk: 'High', at: today } },
        type: 'haze',
        now: tomorrow,
      })
    ).toBe(true);
  });

  // Escalating from Moderate to High on the same day is new information.
  test('notifies when the level escalates on the same day', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Moderate',
        lastNotified: { haze: { risk: 'Moderate', at: today } },
        type: 'haze',
        now: laterToday,
      })
    ).toBe(true);
  });

  // Flood and haze are tracked separately.
  test('a haze notification does not suppress a flood one', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Low',
        lastNotified: { haze: { risk: 'High', at: today } },
        type: 'flood',
        now: laterToday,
      })
    ).toBe(true);
  });

  test('sends nothing when the user has switched notifications off', () => {
    expect(
      shouldNotify({
        nextRisk: 'High',
        previousRisk: 'Low',
        lastNotified: {},
        type: 'haze',
        now: today,
        enabled: false,
      })
    ).toBe(false);
  });
});

describe('recordNotification', () => {
  test('stores the level and time for that type', () => {
    const result = recordNotification({}, 'haze', 'High', today);
    expect(result.haze.risk).toBe('High');
    expect(result.haze.at).toBe(today);
  });

  test('does not disturb the other type', () => {
    const existing = { flood: { risk: 'Moderate', at: today } };
    const result = recordNotification(existing, 'haze', 'High', laterToday);
    expect(result.flood.risk).toBe('Moderate');
    expect(result.haze.risk).toBe('High');
  });
});

describe('buildRiskMessage', () => {
  test('high flood message warns about flood water', () => {
    const message = buildRiskMessage('flood', 'High');
    expect(message.title).toContain('Flood');
    expect(message.title).toContain('High');
    expect(message.body).toContain('flood water');
  });

  test('high haze message mentions a mask', () => {
    const message = buildRiskMessage('haze', 'High');
    expect(message.body).toContain('mask');
  });

  test('moderate messages are less urgent', () => {
    const message = buildRiskMessage('haze', 'Moderate');
    expect(message.title).toContain('Moderate');
  });
});