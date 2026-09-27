// Functions used for formatting dates and times.

// Convert a date into the local YYYY-MM-DD format.
export function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString() {
  return toDateString(new Date());
}

// Convert a time into 24-hour format.
export function toTimeString(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Shows how long ago the saved information was updated.
export function describeAge(isoString) {
  if (!isoString) return '';

  const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// Format the last updated time shown on the dashboard.
export function formatUpdatedAt(isoString) {
  if (!isoString) return 'Never updated';

  const date = new Date(isoString);
  return `Updated ${toTimeString(date)}`;
}

// Check whether two timestamps are from the same local day.
export function isSameLocalDay(isoA, isoB) {
  if (!isoA || !isoB) return false;

  return toDateString(new Date(isoA)) === toDateString(new Date(isoB));
}