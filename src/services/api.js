// Handles the API requests for flood and haze information.

import {
  classifyPsi,
  classifyFloodAlertCount,
  describePsi,
  describeFloodAlerts,
} from '../utils/riskUtils';

const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const FLOOD_URL =
  'https://api-open.data.gov.sg/v2/real-time/api/weather/flood-alerts';

// Stop the request if the API takes too long to respond.
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Get the highest 24-hour PSI reading from the API response.
export function parsePsiResponse(json) {
  const items = json?.data?.items;
  if (!Array.isArray(items) || items.length === 0) return null;

  const readings = items[0]?.readings?.psi_twenty_four_hourly;
  if (!readings || typeof readings !== 'object') return null;

  const values = Object.values(readings).filter((value) =>
    Number.isFinite(value)
  );
  if (values.length === 0) return null;

  // Use the highest PSI reading from the different regions.
  return Math.max(...values);
}

// Get the number of active flood alerts from the latest record.
export function parseFloodResponse(json) {
  const records = json?.data?.records;
  if (!Array.isArray(records)) return null;

  // No records means there is no usable flood information.
  if (records.length === 0) return null;

  const latest = records[0];
  const readings = latest?.item?.readings;

  // Return unknown if the API response is not in the expected format.
  if (!Array.isArray(readings)) return null;

  return readings.length;
}

// Fetch flood and haze data at the same time.
export async function fetchEnvironmentData() {
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

// Read the PSI result and return null if it cannot be used.
async function readPsi(result) {
  if (result.status !== 'fulfilled') return null;

  const response = result.value;
  if (!response.ok) return null;

  try {
    return parsePsiResponse(await response.json());
  } catch (error) {
    return null;
  }
}

// Read the flood result and return null if it cannot be used.
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