// Distance calculations for the Nearby Support screen. Pure functions, so
// the sorting logic can be tested without needing a real GPS fix.

// Earth's mean radius in kilometres.
const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Haversine formula - the standard way to find the great-circle distance
// between two points on a sphere. Straight-line Pythagoras would be wrong
// over any real distance because the Earth is curved.
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

// Adds a distance to each location. A null coordinates argument means the
// user has not granted location permission, in which case every distance
// is null rather than 0 - zero would wrongly suggest they are right there.
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

// Sorts by distance, nearest first. Locations with no distance go to the
// end rather than being treated as nearby.
export function sortByDistance(locations) {
  return [...locations].sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}

export function filterByType(locations, type) {
  if (type === 'all') return locations;
  return locations.filter((location) => location.type === type);
}

// Formats a distance for display. Metres under 1 km reads better than
// "0.4 km", and rounding avoids implying more precision than we have.
export function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) return '';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

// Emergency services are nationwide, so a distance to them is meaningless.
export function shouldShowDistance(location) {
  return location.type !== 'Emergency Service';
}