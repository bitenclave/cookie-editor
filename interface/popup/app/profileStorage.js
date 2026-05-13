import { PROFILE_STORAGE_KEY, PROFILE_SYNC_KEY } from './constants.js';
import { ProfileDeviceIdentity } from './profileStorage/deviceIdentity.js';
import {
  normalizeProfile,
  normalizeSettings,
  toRemoteProfile,
} from './profileStorage/normalizers.js';
import { RemoteProfileClient } from './profileStorage/remoteProfileClient.js';
import {
  buildUrl,
  isInsecureRemoteServer,
  toPermissionOrigin,
  upgradeToHttps,
} from './profileStorage/security.js';
import { ProfileStorageSettingsStore } from './profileStorage/settingsStore.js';
import { ProfileTokenCrypto } from './profileStorage/tokenCrypto.js';

export class ProfileStorage {
  constructor(storageHandler, browserDetector) {
    this.storageHandler = storageHandler;
    this.browserDetector = browserDetector;

    this.deviceIdentity = new ProfileDeviceIdentity(storageHandler);
    this.tokenCrypto = new ProfileTokenCrypto(this.deviceIdentity);
    this.settingsStore = new ProfileStorageSettingsStore(
      storageHandler,
      this.tokenCrypto,
      this.deviceIdentity
    );
    this.remoteClient = new RemoteProfileClient(this.tokenCrypto);
  }

  loadSettings() {
    return this.settingsStore.load();
  }

  saveSettings(settings) {
    return this.settingsStore.save(settings);
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
    const profiles = await this.storageHandler.getLocal(PROFILE_STORAGE_KEY);
    return (profiles || []).map(profile => normalizeProfile(profile));
  }

  async setLocalProfiles(profiles) {
    await this.storageHandler.setLocal(
      PROFILE_STORAGE_KEY,
      profiles.map(profile => normalizeProfile(profile))
    );
  }

  async notifyProfilesChanged(sourceId, mode) {
    await this.storageHandler.setLocal(PROFILE_SYNC_KEY, {
      at: new Date().toISOString(),
      mode,
      sourceId,
    });
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

  fetchRemoteProfiles(settings) {
    return this.remoteClient.fetchProfiles(settings);
  }

  replaceRemoteProfiles(settings, profiles) {
    return this.remoteClient.replaceProfiles(settings, profiles);
  }

  request(settings, path, options = {}) {
    return this.remoteClient.request(settings, path, options);
  }

  normalizeSettings(settings = {}) {
    return normalizeSettings(settings);
  }

  normalizeProfile(profile = {}) {
    return normalizeProfile(profile);
  }

  toRemoteProfile(profile) {
    return toRemoteProfile(profile);
  }

  buildUrl(serverUrl, path) {
    return buildUrl(serverUrl, path);
  }

  isInsecureRemoteServer(serverUrl) {
    return isInsecureRemoteServer(serverUrl);
  }

  upgradeToHttps(serverUrl) {
    return upgradeToHttps(serverUrl);
  }

  toPermissionOrigin(serverUrl) {
    return toPermissionOrigin(serverUrl);
  }
}
