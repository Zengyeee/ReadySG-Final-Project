// Everything that talks to the internet lives here. Keeping it out of the
// screens means a screen only has to handle the result, and if an endpoint
// ever changes I only edit this file.

import {
  classifyPsi,
  classifyFloodAlertCount,
  describePsi,
  describeFloodAlerts,
} from '../utils/riskUtils';

const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const FLOOD_URL =
  'https://api-open.data.gov.sg/v2/real-time/api/weather/flood-alerts';

// If the network hangs, fetch waits forever by default, which would leave
// the loading spinner up permanently. AbortController gives up after a set
// time instead.
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    // In a finally block so the timer is cleared whether the fetch worked
    // or threw.
    clearTimeout(timeoutId);
  }
}

// Pulls the highest 24-hour PSI reading out of the response.
//
// Written defensively on purpose. An earlier version searched the whole
// response recursively for anything that looked like a number, which
// worked but would silently find the wrong thing if the shape changed.
// This looks in the exact place the data should be and returns null if it
// is not there, so a surprise response reads as "unavailable" rather than
// as a confidently wrong reading.
export function parsePsiResponse(json) {
  const items = json?.data?.items;
  if (!Array.isArray(items) || items.length === 0) return null;

  const readings = items[0]?.readings?.psi_twenty_four_hourly;
  if (!readings || typeof readings !== 'object') return null;

  const values = Object.values(readings).filter((value) =>
    Number.isFinite(value)
  );
  if (values.length === 0) return null;

  // The highest regional reading is the safest one to show - the national
  // average could understate conditions where the user actually is.
  return Math.max(...values);
}

// Counts active flood alerts.
//
// This took a look at the real response to get right. The endpoint returns
// a list of two-minute observation snapshots, NOT a list of alerts. Each
// record has a "readings" array which is empty when nothing is flooding.
// Counting the records themselves gave 25, which the app reported as High
// flood risk permanently - an emergency app that always cries wolf is
// worse than one that says nothing.
//
// So: take the most recent record and count the readings inside it.
export function parseFloodResponse(json) {
  const records = json?.data?.records;
  if (!Array.isArray(records)) return null;

  // No records at all means the endpoint gave us nothing usable, which is
  // different from a record showing zero alerts.
  if (records.length === 0) return null;

  // Records come back newest first.
  const latest = records[0];
  const readings = latest?.item?.readings;

  // A record without a readings array is a shape we do not recognise, so
  // report unknown rather than assuming zero.
  if (!Array.isArray(readings)) return null;

  // An empty readings array genuinely means no active alerts. That is good
  // news and should read as Low, not as unknown.
  return readings.length;
}

export async function fetchEnvironmentData() {
  // Both requests go out together rather than one after the other, so a
  // slow endpoint does not hold up the other.
  const [psiResult, floodResult] = await Promise.allSettled([
    fetchWithTimeout(PSI_URL),
    fetchWithTimeout(FLOOD_URL),
  ]);

  const psiValue = await readPsi(psiResult);
  const floodCount = await readFlood(floodResult);

  return {
    haze: {
      risk: classifyPsi(psiValue),
      detail: describePsi(psiValue),
      value: psiValue,
    },
    flood: {
      risk: classifyFloodAlertCount(floodCount),
      detail: describeFloodAlerts(floodCount),
      value: floodCount,
    },
    fetchedAt: new Date().toISOString(),
  };
}

// One endpoint failing should not take the other down with it, so each
// reading is handled separately and returns null on its own.
async function readPsi(result) {
  if (result.status !== 'fulfilled') return null;

  const response = result.value;
  // fetch only rejects on a network failure - a 404 or 500 still counts as
  // a resolved promise, so the status has to be checked here.
  if (!response.ok) return null;

  try {
    return parsePsiResponse(await response.json());
  } catch (error) {
    return null;
  }
}

async function readFlood(result) {
  if (result.status !== 'fulfilled') return null;

  const response = result.value;
  if (!response.ok) return null;

  try {
    return parseFloodResponse(await response.json());
  } catch (error) {
    return null;
  }
}