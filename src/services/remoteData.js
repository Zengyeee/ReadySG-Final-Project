// Handles caching so the app can use the last saved data when offline.

import { loadData, saveData } from './storage';

export async function fetchWithCache(cacheKey, fetchFunction) {
  try {
    const data = await fetchFunction();

    // Save the data together with the time it was fetched.
    const fetchedAt = new Date().toISOString();
    await saveData(cacheKey, { fetchedAt, data });

    return { data, isFromCache: false, fetchedAt, error: null };
  } catch (error) {
    // Use the last saved data if the latest request fails.
    const cached = await loadData(cacheKey, null);

    if (cached && cached.data) {
      return {
        data: cached.data,
        isFromCache: true,
        fetchedAt: cached.fetchedAt,
        error: error.message,
      };
    }

    // Return no data if both the request and cache are unavailable.
    return { data: null, isFromCache: false, fetchedAt: null, error: error.message };
  }
}