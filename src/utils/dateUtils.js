// Date and time formatting. Kept as pure functions so they can be tested
// without rendering anything.

// Local date as "YYYY-MM-DD". Built from the local date parts rather than
// toISOString, which converts to UTC - at UTC+8 that turns local midnight
// into the previous day and every date comes out wrong.
export function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString() {
  return toDateString(new Date());
}

// "14:05" in 24-hour form. Padding matters because these are compared as
// strings elsewhere, and "9:30" would sort after "10:30".
export function toTimeString(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Tells the user how old cached information is, so stale data is never
// presented as though it were live.
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

// Short timestamp for the "last updated" line on the dashboard.
export function formatUpdatedAt(isoString) {
  if (!isoString) return 'Never updated';
  const date = new Date(isoString);
  return `Updated ${toTimeString(date)}`;
}

// True if two ISO timestamps fall on the same local day. Used to stop the
// app sending the same notification repeatedly in one day.
export function isSameLocalDay(isoA, isoB) {
  if (!isoA || !isoB) return false;
  return toDateString(new Date(isoA)) === toDateString(new Date(isoB));
}