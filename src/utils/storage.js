// LocalStorage Storage Management for CA Bharat AI Demo State

const STORAGE_KEYS = {
  CLIENTS: 'ca_bharat_clients_v4',
  DOCUMENTS: 'ca_bharat_documents_v4',
  TAX_CASES: 'ca_bharat_tax_cases_v4',
  CONSENTS: 'ca_bharat_consents_v4',
  TEAM: 'ca_bharat_team_v4',
  AUDIT_LOGS: 'ca_bharat_audit_logs_v4',
  NOTIFICATIONS: 'ca_bharat_notifications_v4',
  SETTINGS: 'ca_bharat_settings_v4',
  ACTIVE_AY: 'ca_bharat_active_ay_v4',
  ACTIVE_CLIENT_ID: 'ca_bharat_active_client_id_v4',
}

export function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      const rawStr = JSON.stringify(parsed)
      // Guard against legacy mock names from prior versions
      if (rawStr.includes('Rahul') || rawStr.includes('Vikram M') || rawStr.includes('Dr. Suresh') || rawStr.includes('Priya V')) {
        localStorage.removeItem(key)
        return defaultValue
      }
      return parsed
    }
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
  // Also clean up any legacy keys if present
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
