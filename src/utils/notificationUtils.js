import { isMoreSevere } from './riskUtils';
import { isSameLocalDay } from './dateUtils';

// Decides whether a notification is worth sending, and what it should say.
// Both are pure functions kept out of the service file, so the tests never
// have to import expo-notifications - which prints warnings on load and
// would need mocking in a Node environment.
//
// Three rules govern whether to notify, each preventing a specific
// annoyance:
//   1. Only notify when risk has actually got worse. Being told the risk
//      dropped to Low is not urgent.
//   2. Never notify about Low risk. There is nothing to act on.
//   3. Only once per risk level per day. Without this, every refresh
//      during a hazy afternoon would fire another notification, and the
//      user would switch them off entirely.
export function shouldNotify({
  nextRisk,
  previousRisk,
  lastNotified,
  type,
  now = new Date().toISOString(),
  enabled = true,
}) {
  if (!enabled) return false;

  // Only Moderate and High are worth interrupting someone for.
  if (nextRisk !== 'Moderate' && nextRisk !== 'High') return false;

  // Nothing to report if conditions have not worsened.
  if (!isMoreSevere(nextRisk, previousRisk)) return false;

  const record = lastNotified?.[type];

  // Never notified about this before, so send it.
  if (!record) return true;

  // Already told them about this exact level today.
  if (record.risk === nextRisk && isSameLocalDay(record.at, now)) {
    return false;
  }

  return true;
}

// Records that a notification was sent, so the daily rule has something to
// check against next time.
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

// The message text. Written to be actionable rather than alarming - a
// notification that only says "risk is high" leaves the user with nothing
// to do about it.
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