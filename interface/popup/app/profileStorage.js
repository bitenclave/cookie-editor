import {
  DEFAULT_PROFILE_STORAGE_SETTINGS,
  PROFILE_STORAGE_KEY,
  PROFILE_STORAGE_SETTINGS_KEY,
} from './constants.js';

export class ProfileStorage {
  constructor(storageHandler, browserDetector) {
    this.storageHandler = storageHandler;
    this.browserDetector = browserDetector;
  }

  async loadSettings() {
    return this.normalizeSettings(
      await this.storageHandler.getLocal(PROFILE_STORAGE_SETTINGS_KEY)
    );
  }

  async saveSettings(settings) {
    const normalized = this.normalizeSettings(settings);
    await this.storageHandler.setLocal(
      PROFILE_STORAGE_SETTINGS_KEY,
      normalized
    );
    return normalized;
  }

  async getProfiles(settings) {
    if (settings.mode === 'cloud') {
      return this.fetchRemoteProfiles(settings);
    }
    return this.getLocalProfiles();
  }

  async saveProfiles(settings, profiles) {
    if (settings.mode === 'cloud') {
      return this.replaceRemoteProfiles(settings, profiles);
    }
    await this.setLocalProfiles(profiles);
    return profiles;
  }

  async getLocalProfiles() {
    return (await this.storageHandler.getLocal(PROFILE_STORAGE_KEY)) || [];
  }

  async setLocalProfiles(profiles) {
    await this.storageHandler.setLocal(PROFILE_STORAGE_KEY, profiles);
  }

  async test(settings) {
    await this.fetchRemoteProfiles(settings);
  }

  async pushLocalProfiles(settings) {
    const profiles = await this.getLocalProfiles();
    await this.replaceRemoteProfiles(settings, profiles);
    return profiles.length;
  }

  async ensureCloudPermission(serverUrl) {
    const api = this.browserDetector.getApi();
    if (!api.permissions) {
      return true;
    }
    const origin = this.toPermissionOrigin(serverUrl);
    if (await api.permissions.contains({ origins: [origin] })) {
      return true;
    }
    return api.permissions.request({ origins: [origin] });
  }

  async fetchRemoteProfiles(settings) {
    const data = await this.request(settings, '/api/profiles');
    return (data.profiles || []).map(profile => this.normalizeProfile(profile));
  }

  async replaceRemoteProfiles(settings, profiles) {
    const data = await this.request(settings, '/api/profiles', {
      method: 'PUT',
      body: JSON.stringify({
        profiles: profiles.map(profile => this.toRemoteProfile(profile)),
      }),
    });
    return (data.profiles || []).map(profile => this.normalizeProfile(profile));
  }

  async request(settings, path, options = {}) {
    const response = await fetch(this.buildUrl(settings.serverUrl, path), {
      ...options,
      headers: {
        Authorization: `Bearer ${settings.token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return response.json();
  }

  normalizeSettings(settings = {}) {
    const normalizedSettings = {
      ...DEFAULT_PROFILE_STORAGE_SETTINGS,
      ...(settings || {}),
    };

    return {
      ...normalizedSettings,
      mode: normalizedSettings.mode === 'cloud' ? 'cloud' : 'local',
      serverUrl: String(normalizedSettings.serverUrl || '')
        .trim()
        .replace(/\/+$/, ''),
      token: String(normalizedSettings.token || '').trim(),
    };
  }

  normalizeProfile(profile) {
    return {
      ...profile,
      groupName: profile.groupName || profile.group || 'Default',
      cookies: Array.isArray(profile.cookies) ? profile.cookies : [],
    };
  }

  toRemoteProfile(profile) {
    return {
      id: this.isUuid(profile.id) ? profile.id : undefined,
      name: profile.name,
      group: profile.groupName || profile.group || 'Default',
      cookies: Array.isArray(profile.cookies) ? profile.cookies : [],
      tags: Array.isArray(profile.tags) ? profile.tags : [],
    };
  }

  buildUrl(serverUrl, path) {
    if (!serverUrl) {
      throw new Error('Enter a server URL');
    }
    return new URL(path, `${serverUrl}/`).toString();
  }

  toPermissionOrigin(serverUrl) {
    const url = new URL(serverUrl);
    return `${url.protocol}//${url.host}/*`;
  }

  isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || '')
    );
  }
}
