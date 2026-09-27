// Functions used to calculate and sort distances for nearby support locations.

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Calculate the distance between two locations using their coordinates.
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

// Add the distance from the user to each support location.
export function addDistances(locations, coordinates) {
  if (!coordinates) {
    return locations.map((location) => ({ ...location, distanceKm: null }));
  }

  return locations.map((location) => ({
    ...location,
    distanceKm: calculateDistanceKm(
      coordinates.latitude,
      coordinates.longitude,
      location.latitude,
      location.longitude
    ),
  }));
}

// Sort the locations from nearest to furthest.
export function sortByDistance(locations) {
  return [...locations].sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}

// Filter the support locations by their type.
export function filterByType(locations, type) {
  if (type === 'all') return locations;
  return locations.filter((location) => location.type === type);
}

// Format the distance in metres or kilometres.
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return '';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

// Emergency services do not need a distance because they are nationwide.
export function shouldShowDistance(location) {
  return location.type !== 'Emergency Service';
}