// Risk classification. These are pure functions - they take a value in and
// return a result without touching state or making network calls, which
// makes them straightforward to unit test.

// The most important rule in this file: bad or missing data must never come
// back as "Low". Telling someone their flood risk is low when the app has no
// idea is worse than telling them nothing at all.

// PSI bands follow NEA's published ranges: 0-50 Good, 51-100 Moderate,
// 101 and above Unhealthy.
export function classifyPsi(psi) {
  if (psi === null || psi === undefined) return 'Unavailable';
  if (!Number.isFinite(psi)) return 'Unavailable';
  // A negative PSI is not physically possible, so treat it as bad data
  // rather than rounding it down to Low.
  if (psi < 0) return 'Unavailable';

  if (psi >= 101) return 'High';
  if (psi >= 51) return 'Moderate';
  return 'Low';
}

// Flood risk from the number of active PUB alerts. A null count means the
// response could not be read, which is different from a genuine zero.
export function classifyFloodAlertCount(count) {
  if (count === null || count === undefined) return 'Unavailable';
  if (!Number.isFinite(count)) return 'Unavailable';
  if (count < 0) return 'Unavailable';

  if (count >= 2) return 'High';
  if (count === 1) return 'Moderate';
  return 'Low';
}

export function describePsi(psi) {
  if (psi === null || psi === undefined) return 'PSI reading unavailable';
  return `Highest 24-hr PSI: ${psi}`;
}

export function describeFloodAlerts(count) {
  if (count === null || count === undefined) {
    return 'Flood alert information unavailable';
  }
  if (count === 0) return 'No active PUB flood alerts';
  return `${count} active PUB flood alert${count > 1 ? 's' : ''}`;
}

// True only for the three real measured levels.
export function isKnownRisk(risk) {
  return risk === 'Low' || risk === 'Moderate' || risk === 'High';
}

// Guidance text only exists for the three real levels. When the risk is
// unknown we show Low guidance as a sensible default, but the screen must
// still label the risk itself as Unavailable so the user is never told
// their risk is low.
export function guidanceLevelFor(risk) {
  return isKnownRisk(risk) ? risk : 'Low';
}

// Severity ordering, used to decide whether conditions have worsened since
// the last check and a notification is worth sending.
const RISK_SEVERITY = {
  Unavailable: -1,
  Low: 0,
  Moderate: 1,
  High: 2,
};

export function isMoreSevere(next, previous) {
  return RISK_SEVERITY[next] > RISK_SEVERITY[previous];
}

// A reading that represents "we genuinely do not know".
export function unavailableReading(detail) {
  return { risk: 'Unavailable', detail, value: null };
}