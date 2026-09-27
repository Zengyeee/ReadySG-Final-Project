import AsyncStorage from '@react-native-async-storage/async-storage';

// Handles saving and loading data from AsyncStorage.
export async function loadData(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);

    // Use the fallback value if there is no saved data yet.
    if (raw === null) return fallback;

    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Could not load ${key}:`, error);
    return fallback;
  }
}

export async function saveData(key, value) {
  try {
    // Convert the data to JSON before saving it.
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key}:`, error);
    return false;
  }
}

// Clears the saved data when the user resets the app.
export async function clearAllData(keys) {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.warn('Could not clear data:', error);
    return false;
  }
}