import AsyncStorage from '@react-native-async-storage/async-storage';

// Wrapper around AsyncStorage. Two reasons this file exists:
// 1. AsyncStorage only stores strings, so every read and write needs
//    JSON.parse and JSON.stringify. Doing that in one place means I cannot
//    forget it somewhere.
// 2. If a read fails or the stored data is corrupted, a fallback is
//    returned instead of letting the whole app crash on startup.

export async function loadData(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    // getItem returns null when the key has never been written, which is
    // normal on first launch rather than an error.
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not load ${key}:`, error);
    return fallback;
  }
}

export async function saveData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key}:`, error);
    return false;
  }
}

// Used by the reset option in Settings.
export async function clearAllData(keys) {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.warn('Could not clear data:', error);
    return false;
  }
}