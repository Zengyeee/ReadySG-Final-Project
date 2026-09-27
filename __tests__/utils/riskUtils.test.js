import {
  classifyPsi,
  classifyFloodAlertCount,
  describePsi,
  describeFloodAlerts,
  isKnownRisk,
  guidanceLevelFor,
  isMoreSevere,
  unavailableReading,
} from '../../src/utils/riskUtils';

describe('classifyPsi', () => {
  // Boundary values matter most here - this is where off-by-one errors hide.
  test('0 is Low', () => expect(classifyPsi(0)).toBe('Low'));
  test('50 is Low', () => expect(classifyPsi(50)).toBe('Low'));
  test('51 is Moderate', () => expect(classifyPsi(51)).toBe('Moderate'));
  test('100 is Moderate', () => expect(classifyPsi(100)).toBe('Moderate'));
  test('101 is High', () => expect(classifyPsi(101)).toBe('High'));
  test('very high readings are High', () => expect(classifyPsi(400)).toBe('High'));

  // The safety property: bad data must never read as Low.
  test('null is Unavailable', () => expect(classifyPsi(null)).toBe('Unavailable'));
  test('undefined is Unavailable', () =>
    expect(classifyPsi(undefined)).toBe('Unavailable'));
  test('NaN is Unavailable', () => expect(classifyPsi(NaN)).toBe('Unavailable'));
  test('Infinity is Unavailable', () =>
    expect(classifyPsi(Infinity)).toBe('Unavailable'));
  test('a negative reading is Unavailable, not Low', () =>
    expect(classifyPsi(-5)).toBe('Unavailable'));
});

describe('classifyFloodAlertCount', () => {
  test('0 alerts is Low', () => expect(classifyFloodAlertCount(0)).toBe('Low'));
  test('1 alert is Moderate', () =>
    expect(classifyFloodAlertCount(1)).toBe('Moderate'));
  test('2 alerts is High', () => expect(classifyFloodAlertCount(2)).toBe('High'));
  test('many alerts is High', () => expect(classifyFloodAlertCount(9)).toBe('High'));

  // An unreadable response is not the same as zero alerts.
  test('null is Unavailable rather than Low', () =>
    expect(classifyFloodAlertCount(null)).toBe('Unavailable'));
  test('undefined is Unavailable', () =>
    expect(classifyFloodAlertCount(undefined)).toBe('Unavailable'));
  test('a negative count is Unavailable', () =>
    expect(classifyFloodAlertCount(-1)).toBe('Unavailable'));
});

describe('describePsi', () => {
  test('includes the reading', () =>
    expect(describePsi(84)).toBe('Highest 24-hr PSI: 84'));
  test('says unavailable when there is no reading', () =>
    expect(describePsi(null)).toBe('PSI reading unavailable'));
});

describe('describeFloodAlerts', () => {
  test('no alerts', () =>
    expect(describeFloodAlerts(0)).toBe('No active PUB flood alerts'));
  test('one alert uses the singular', () =>
    expect(describeFloodAlerts(1)).toBe('1 active PUB flood alert'));
  test('several alerts use the plural', () =>
    expect(describeFloodAlerts(3)).toBe('3 active PUB flood alerts'));
  test('unknown count', () =>
    expect(describeFloodAlerts(null)).toBe('Flood alert information unavailable'));
});

describe('isKnownRisk', () => {
  test('recognises the three real levels', () => {
    expect(isKnownRisk('Low')).toBe(true);
    expect(isKnownRisk('Moderate')).toBe(true);
    expect(isKnownRisk('High')).toBe(true);
  });
  test('rejects Unavailable', () =>
    expect(isKnownRisk('Unavailable')).toBe(false));
});

describe('guidanceLevelFor', () => {
  test('passes known levels straight through', () => {
    expect(guidanceLevelFor('High')).toBe('High');
    expect(guidanceLevelFor('Moderate')).toBe('Moderate');
  });
  test('falls back to Low guidance when the risk is unknown', () =>
    expect(guidanceLevelFor('Unavailable')).toBe('Low'));
});

describe('isMoreSevere', () => {
  test('Low to High is an escalation', () =>
    expect(isMoreSevere('High', 'Low')).toBe(true));
  test('Moderate to High is an escalation', () =>
    expect(isMoreSevere('High', 'Moderate')).toBe(true));
  test('High staying High is not', () =>
    expect(isMoreSevere('High', 'High')).toBe(false));
  test('High dropping to Low is not', () =>
    expect(isMoreSevere('Low', 'High')).toBe(false));
  // Coming back online to find High risk should still notify.
  test('Unavailable to High is an escalation', () =>
    expect(isMoreSevere('High', 'Unavailable')).toBe(true));
});

describe('unavailableReading', () => {
  test('builds a reading with no value', () => {
    const reading = unavailableReading('Network error');
    expect(reading.risk).toBe('Unavailable');
    expect(reading.detail).toBe('Network error');
    expect(reading.value).toBeNull();
  });
});