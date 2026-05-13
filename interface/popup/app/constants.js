export const PROFILE_STORAGE_KEY = 'cookieProfiles';
export const PROFILE_DEVICE_SESSION_KEY = 'cookieProfileDeviceSession';
export const PROFILE_STORAGE_SETTINGS_KEY = 'cookieProfileStorageSettings';
export const PROFILE_SYNC_KEY = 'cookieProfileSync';
export const UI_SETTINGS_KEY = 'popupUiSettingsV2';
export const PROFILE_PAGE_SIZE = 10;
export const PROFILE_CLOUD_REFRESH_INTERVAL_MS = 15000;

export const DEFAULT_PROFILE_STORAGE_SETTINGS = {
  acceptedInsecureHttpWarning: false,
  configured: false,
  mode: 'local',
  serverUrl: 'http://localhost:8787',
  token: '',
};

export const DEFAULT_UI_SETTINGS = {
  activeTab: 'cookies',
  compactRows: false,
  confirmDeleteAll: true,
  cookieScope: 'local',
  profileStorageOpen: false,
};
