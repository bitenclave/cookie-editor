export const PROFILE_STORAGE_KEY = 'cookieProfiles';
export const PROFILE_STORAGE_SETTINGS_KEY = 'cookieProfileStorageSettings';
export const UI_SETTINGS_KEY = 'popupUiSettingsV2';

export const DEFAULT_PROFILE_STORAGE_SETTINGS = {
  configured: false,
  mode: 'local',
  serverUrl: 'http://localhost:8787',
  token: 'replace-with-a-long-random-token',
};

export const DEFAULT_UI_SETTINGS = {
  activeTab: 'cookies',
  compactRows: false,
  confirmDeleteAll: true,
  cookieScope: 'local',
  profileStorageOpen: false,
};
