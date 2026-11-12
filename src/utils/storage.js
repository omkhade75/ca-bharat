// LocalStorage Storage Management for CA Bharat AI Demo State

const STORAGE_KEYS = {
  CLIENTS: 'ca_bharat_clients_v2',
  DOCUMENTS: 'ca_bharat_documents_v2',
  TAX_CASES: 'ca_bharat_tax_cases_v2',
  CONSENTS: 'ca_bharat_consents_v2',
  TEAM: 'ca_bharat_team_v2',
  AUDIT_LOGS: 'ca_bharat_audit_logs_v2',
  NOTIFICATIONS: 'ca_bharat_notifications_v2',
  SETTINGS: 'ca_bharat_settings_v2',
  ACTIVE_AY: 'ca_bharat_active_ay_v2',
  ACTIVE_CLIENT_ID: 'ca_bharat_active_client_id_v2',
}

export function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.warn(`Error reading from localStorage key: ${key}`, err)
  }
  return defaultValue
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`Error saving to localStorage key: ${key}`, err)
  }
}

export function clearDemoStorage() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  // Also clean up legacy v1 keys if present
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('ca_bharat_')) {
        localStorage.removeItem(k)
      }
    }
  } catch {
    // Ignore storage clear errors
  }
}

export { STORAGE_KEYS }
