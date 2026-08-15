/**
 * Helper to safely read and write JSON data to localStorage
 */
export function getStoredItem(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

export function setStoredItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

export function clearStoredData() {
  try {
    localStorage.removeItem('sage_students');
    localStorage.removeItem('sage_cfg');
    localStorage.removeItem('sage_finances');
    localStorage.removeItem('sage_authed');
  } catch (err) {
    console.warn('Error clearing localStorage data:', err);
  }
}
