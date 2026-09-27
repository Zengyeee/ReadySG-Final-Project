import { parsePsiResponse, parseFloodResponse } from '../../src/services/api';

// Tests the API data parsing without needing to make real network requests.
describe('parsePsiResponse', () => {
  const validResponse = {
    code: 0,
    data: {
      items: [
        {
          timestamp: '2026-09-26T15:00:00+08:00',
          readings: {
            psi_twenty_four_hourly: {
              west: 55,
              national: 52,
              east: 48,
              central: 50,
              south: 51,
              north: 49,
            },
          },
        },
      ],
    },
  };

  test('returns the highest regional reading', () => {
    // Use the highest regional PSI reading for the current haze condition.
    expect(parsePsiResponse(validResponse)).toBe(55);
  });

  test('handles a single region', () => {
    const response = {
      data: {
        items: [{ readings: { psi_twenty_four_hourly: { national: 42 } } }],
      },
    };
    expect(parsePsiResponse(response)).toBe(42);
  });

  // Invalid or missing PSI data should return null.
  test('null response returns null', () =>
    expect(parsePsiResponse(null)).toBeNull());
  test('empty object returns null', () => expect(parsePsiResponse({})).toBeNull());
  test('missing items returns null', () =>
    expect(parsePsiResponse({ data: {} })).toBeNull());
  test('empty items array returns null', () =>
    expect(parsePsiResponse({ data: { items: [] } })).toBeNull());
  test('missing readings returns null', () =>
    expect(parsePsiResponse({ data: { items: [{}] } })).toBeNull());
  test('empty readings returns null', () =>
    expect(
      parsePsiResponse({
        data: { items: [{ readings: { psi_twenty_four_hourly: {} } }] },
      })
    ).toBeNull());

  test('ignores non-numeric readings', () => {
    const response = {
      data: {
        items: [
          {
            readings: {
              psi_twenty_four_hourly: { west: 'n/a', national: 40, east: null },
            },
          },
        ],
      },
    };
    expect(parsePsiResponse(response)).toBe(40);
  });

  test('all readings unusable returns null', () => {
    const response = {
      data: {
        items: [
          { readings: { psi_twenty_four_hourly: { west: 'n/a', national: null } } },
        ],
      },
    };
    expect(parsePsiResponse(response)).toBeNull();
  });
});

describe('parseFloodResponse', () => {
  // Creates sample flood records for testing different API responses.
  function makeRecord(readings, datetime = '2026-09-26T16:46:54+08:00') {
    return {
      datetime,
      item: { type: 'observation', readings, isStationData: false },
      updatedTimestamp: datetime,
    };
  }

  // Only the readings in the latest record should be counted as active alerts.
  test('counts readings in the latest record, not the number of records', () => {
    const response = {
      data: {
        records: [
          makeRecord([], '2026-09-26T16:46:54+08:00'),
          makeRecord([], '2026-09-26T16:44:54+08:00'),
          makeRecord([], '2026-09-26T16:42:54+08:00'),
        ],
      },
    };
    expect(parseFloodResponse(response)).toBe(0);
  });

  test('an empty readings array is zero alerts, not unknown', () => {
    expect(parseFloodResponse({ data: { records: [makeRecord([])] } })).toBe(0);
  });

  test('counts actual alerts when present', () => {
    const response = {
      data: {
        records: [makeRecord([{ station: 'A', level: 'high' }, { station: 'B' }])],
      },
    };
    expect(parseFloodResponse(response)).toBe(2);
  });

  test('uses the most recent record only', () => {
    const response = {
      data: {
        records: [
          makeRecord([], '2026-09-26T16:46:54+08:00'),
          makeRecord([{ station: 'A' }], '2026-09-26T16:44:54+08:00'),
        ],
      },
    };
    // Older alerts should not affect the current flood condition.
    expect(parseFloodResponse(response)).toBe(0);
  });

  // Invalid or missing flood data should return null.
  test('null response returns null', () =>
    expect(parseFloodResponse(null)).toBeNull());
  test('empty object returns null', () =>
    expect(parseFloodResponse({})).toBeNull());
  test('missing data returns null', () =>
    expect(parseFloodResponse({ code: 0 })).toBeNull());
  test('records that are not an array returns null', () =>
    expect(parseFloodResponse({ data: { records: 'none' } })).toBeNull());
  test('an empty records list returns null, not zero', () =>
    expect(parseFloodResponse({ data: { records: [] } })).toBeNull());
  test('a record with no readings array returns null', () =>
    expect(
      parseFloodResponse({ data: { records: [{ item: { type: 'observation' } }] } })
    ).toBeNull());
});