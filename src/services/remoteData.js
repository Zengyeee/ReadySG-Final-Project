// Wraps a fetch so its result gets cached. This is what lets the app show
// the last known readings when there is no connection, instead of showing
// nothing at all.

import { loadData, saveData } from './storage';

export async function fetchWithCache(cacheKey, fetchFunction) {
  try {
    const data = await fetchFunction();

    // Storing when it was fetched means the screen can say how old the
    // information is rather than presenting stale data as though it were
    // live.
    const fetchedAt = new Date().toISOString();
    await saveData(cacheKey, { fetchedAt, data });

    return { data, isFromCache: false, fetchedAt, error: null };
  } catch (error) {
    // The fetch failed, so fall back to whatever was saved last time.
    const cached = await loadData(cacheKey, null);

    if (cached && cached.data) {
      return {
        data: cached.data,
        isFromCache: true,
        fetchedAt: cached.fetchedAt,
        error: error.message,
      };
    }

    // Nothing live and nothing cached. This is the genuine failure case,
    // which only happens if the very first fetch fails.
    return { data: null, isFromCache: false, fetchedAt: null, error: error.message };
  }
}