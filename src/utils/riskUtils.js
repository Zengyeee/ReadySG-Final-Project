// Functions used to classify flood and haze risk levels.

// Classify the PSI reading into a risk level.
export function classifyPsi(psi) {
  if (psi === null || psi === undefined) return 'Unavailable';
  if (!Number.isFinite(psi)) return 'Unavailable';

  // Negative PSI values should be treated as invalid data.
  if (psi < 0) return 'Unavailable';

  if (psi >= 101) return 'High';
  if (psi >= 51) return 'Moderate';
  return 'Low';
}

// Classify flood risk based on the number of active alerts.
export function classifyFloodAlertCount(count) {
  if (count === null || count === undefined) return 'Unavailable';
  if (!Number.isFinite(count)) return 'Unavailable';
  if (count < 0) return 'Unavailable';

  if (count >= 2) return 'High';
  if (count === 1) return 'Moderate';
  return 'Low';
}

// Create the text shown for the current PSI reading.
export function describePsi(psi) {
  if (psi === null || psi === undefined) return 'PSI reading unavailable';
  return `Highest 24-hr PSI: ${psi}`;
}

// Create the text shown for current flood alerts.
export function describeFloodAlerts(count) {
  if (count === null || count === undefined) {
    return 'Flood alert information unavailable';
  }
  if (count === 0) return 'No active PUB flood alerts';
  return `${count} active PUB flood alert${count > 1 ? 's' : ''}`;
}

// Check whether the risk is a known level.
export function isKnownRisk(risk) {
  return risk === 'Low' || risk === 'Moderate' || risk === 'High';
}

// Use Low guidance when the current risk is unavailable.
export function guidanceLevelFor(risk) {
  return isKnownRisk(risk) ? risk : 'Low';
}

// Values used to compare the different risk levels.
const RISK_SEVERITY = {
  Unavailable: -1,
  Low: 0,
  Moderate: 1,
  High: 2,
};

// Check whether the new risk is more serious than the previous risk.
export function isMoreSevere(next, previous) {
  return RISK_SEVERITY[next] > RISK_SEVERITY[previous];
}

// Create a result when the risk information is unavailable.
export function unavailableReading(detail) {
  return { risk: 'Unavailable', detail, value: null };
}