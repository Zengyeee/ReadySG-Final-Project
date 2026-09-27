import {
  calculateDistanceKm,
  addDistances,
  sortByDistance,
  filterByType,
  formatDistance,
  shouldShowDistance,
} from '../../src/utils/distanceUtils';

const locations = [
  {
    id: 'far',
    name: 'Far place',
    type: 'Hospital',
    latitude: 1.4244,
    longitude: 103.8386,
  },
  {
    id: 'near',
    name: 'Near place',
    type: 'Clinic',
    latitude: 1.3,
    longitude: 103.84,
  },
  {
    id: 'emergency',
    name: 'SCDF',
    type: 'Emergency Service',
    latitude: 1.3521,
    longitude: 103.8198,
  },
];

// Sample user location used for the distance tests.
const userCoords = { latitude: 1.3, longitude: 103.84 };

describe('calculateDistanceKm', () => {
  test('the same point is zero distance', () =>
    expect(calculateDistanceKm(1.3, 103.8, 1.3, 103.8)).toBe(0));

  test('returns a positive distance between different points', () => {
    const distance = calculateDistanceKm(1.3, 103.8, 1.4, 103.8);
    expect(distance).toBeGreaterThan(0);
  });

  // Check that the distance calculation gives a reasonable result.
  test('one degree of latitude is roughly 111 km', () => {
    const distance = calculateDistanceKm(0, 0, 1, 0);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
  });

  test('distance is the same in either direction', () => {
    const there = calculateDistanceKm(1.3, 103.8, 1.4, 103.9);
    const back = calculateDistanceKm(1.4, 103.9, 1.3, 103.8);
    expect(there).toBeCloseTo(back, 10);
  });

  test('invalid coordinates return null rather than NaN', () => {
    expect(calculateDistanceKm(null, 103.8, 1.4, 103.8)).toBeNull();
    expect(calculateDistanceKm(1.3, undefined, 1.4, 103.8)).toBeNull();
    expect(calculateDistanceKm(NaN, 103.8, 1.4, 103.8)).toBeNull();
  });
});

describe('addDistances', () => {
  test('attaches a distance to each location', () => {
    const result = addDistances(locations, userCoords);
    expect(result[1].distanceKm).toBe(0);
    expect(result[0].distanceKm).toBeGreaterThan(0);
  });

  // Distance should be unknown if the user's location is not available.
  test('distances are null when there are no coordinates', () => {
    const result = addDistances(locations, null);
    result.forEach((location) => expect(location.distanceKm).toBeNull());
  });

  test('does not change the original array', () => {
    const original = [...locations];
    addDistances(locations, userCoords);
    expect(locations).toEqual(original);
  });
});

describe('sortByDistance', () => {
  test('nearest comes first', () => {
    const withDistances = addDistances(locations, userCoords);
    const sorted = sortByDistance(withDistances);
    expect(sorted[0].id).toBe('near');
  });

  // Locations without a distance should be placed at the end.
  test('locations with no distance go last', () => {
    const mixed = [
      { id: 'unknown', distanceKm: null },
      { id: 'close', distanceKm: 2 },
      { id: 'far', distanceKm: 10 },
    ];
    const sorted = sortByDistance(mixed);
    expect(sorted.map((l) => l.id)).toEqual(['close', 'far', 'unknown']);
  });

  test('does not mutate the input', () => {
    const input = [{ id: 'b', distanceKm: 5 }, { id: 'a', distanceKm: 1 }];
    sortByDistance(input);
    expect(input[0].id).toBe('b');
  });
});

describe('filterByType', () => {
  test('filters to one type', () =>
    expect(filterByType(locations, 'Hospital')).toHaveLength(1));
  test('"all" returns everything', () =>
    expect(filterByType(locations, 'all')).toHaveLength(3));
  test('an unmatched type returns nothing', () =>
    expect(filterByType(locations, 'Pharmacy')).toEqual([]));
});

describe('formatDistance', () => {
  // Check that distances are shown in a simple format for the user.
  test('under a kilometre shows metres', () =>
    expect(formatDistance(0.4)).toBe('400 m away'));
  test('over a kilometre shows one decimal place', () =>
    expect(formatDistance(2.35)).toBe('2.4 km away'));
  test('exactly one kilometre shows km', () =>
    expect(formatDistance(1)).toBe('1.0 km away'));
  test('an unknown distance shows nothing', () =>
    expect(formatDistance(null)).toBe(''));
});

describe('shouldShowDistance', () => {
  test('hides distance for nationwide emergency services', () =>
    expect(shouldShowDistance({ type: 'Emergency Service' })).toBe(false));
  test('shows distance for physical locations', () =>
    expect(shouldShowDistance({ type: 'Hospital' })).toBe(true));
});