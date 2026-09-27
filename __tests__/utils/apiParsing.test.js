import { parsePsiResponse, parseFloodResponse } from '../../src/services/api';

// The parsers are pure, so they can be tested with fake responses instead
// of making real network calls. That also lets me test the malformed cases
// that would be almost impossible to trigger against the live API.

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
    // National is 52 but west is 55 - reporting the highest avoids
    // understating conditions where the user actually is.
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

  // Every one of these must return null so the risk shows as Unavailable.
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
  // This shape is taken from the real endpoint. Each record is a two-minute
  // observation snapshot, and the alerts live inside item.readings.
  function makeRecord(readings, datetime = '2026-09-26T16:46:54+08:00') {
    return {
      datetime,
      item: { type: 'observation', readings, isStationData: false },
      updatedTimestamp: datetime,
    };
  }

  // The bug this test exists to prevent: counting the records themselves
  // returned 25 and permanently reported High flood risk, because the
  // endpoint polls every two minutes whether anything is happening or not.
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
    // The older record had an alert but the latest does not, so the current
    // state is zero.
    expect(parseFloodResponse(response)).toBe(0);
  });

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