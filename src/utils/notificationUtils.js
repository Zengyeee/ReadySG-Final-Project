import { isMoreSevere } from './riskUtils';
import { isSameLocalDay } from './dateUtils';

// Checks whether the user should receive a risk notification.
export function shouldNotify({
  nextRisk,
  previousRisk,
  lastNotified,
  type,
  now = new Date().toISOString(),
  enabled = true,
}) {
  if (!enabled) return false;

  // Only send notifications for Moderate or High risk.
  if (nextRisk !== 'Moderate' && nextRisk !== 'High') return false;

  // Only notify when the risk becomes more serious.
  if (!isMoreSevere(nextRisk, previousRisk)) return false;

  const record = lastNotified?.[type];

  // Send the notification if there is no previous record.
  if (!record) return true;

  // Avoid sending the same risk notification many times in one day.
  if (record.risk === nextRisk && isSameLocalDay(record.at, now)) {
    return false;
  }

  return true;
}

// Store the last notification that was sent.
export function recordNotification(
  lastNotified,
  type,
  risk,
  now = new Date().toISOString()
) {
  return {
    ...lastNotified,
    [type]: { risk, at: now },
  };
}

// Create the notification message based on the risk type and level.
export function buildRiskMessage(type, risk) {
  const label = type === 'flood' ? 'Flood' : 'Haze';

  if (risk === 'High') {
    return {
      title: `${label} risk is now High`,
      body:
        type === 'flood'
          ? 'Avoid low-lying areas and do not walk through flood water. Open ReadySG for guidance.'
          : 'Reduce outdoor activity and consider wearing a mask. Open ReadySG for guidance.',
    };
  }

  return {
    title: `${label} risk has risen to Moderate`,
    body:
      type === 'flood'
        ? 'Conditions have changed. Check your travel plans in ReadySG.'
        : 'Air quality has worsened. Check the guidance in ReadySG.',
  };
}