import { PROFILE_STORAGE_SETTINGS_KEY } from '../constants.js';
import { normalizeSettings } from './normalizers.js';

export class ProfileStorageSettingsStore {
  constructor(storageHandler, tokenCrypto, deviceIdentity) {
    this.storageHandler = storageHandler;
    this.tokenCrypto = tokenCrypto;
    this.deviceIdentity = deviceIdentity;
  }

  async load() {
    const storedSettings =
      (await this.storageHandler.getLocal(PROFILE_STORAGE_SETTINGS_KEY)) || {};
    const token = await this.readStoredToken(storedSettings);
    const normalized = normalizeSettings({
      ...storedSettings,
      token,
    });

    if (this.shouldMigrateStoredSettings(storedSettings, token)) {
      await this.save(normalized);
    }

    return normalized;
  }

  async save(settings) {
    const normalized = normalizeSettings(settings);
    const storedSettings = await this.serialize(normalized);
    await this.storageHandler.setLocal(
      PROFILE_STORAGE_SETTINGS_KEY,
      storedSettings
    );
    return normalized;
  }

  async readStoredToken(storedSettings) {
    if (!storedSettings.encryptedToken) {
      return String(storedSettings.token || '').trim();
    }

    const deviceIds = await this.getTokenDeviceIdCandidates(storedSettings);
    for (const deviceId of deviceIds) {
      const token = await this.tryDecryptToken(
        storedSettings.encryptedToken,
        deviceId
      );
      if (token) {
        return token;
      }
    }
    return '';
  }

  async getTokenDeviceIdCandidates(storedSettings) {
    return [
      ...new Set([
        this.deviceIdentity.normalizeDeviceId(storedSettings.deviceId) ||
          (await this.deviceIdentity.getExistingSessionDeviceId({
            includeLegacy: true,
          })),
        this.deviceIdentity.createDeviceId(),
      ]),
    ].filter(Boolean);
  }

  async tryDecryptToken(encryptedToken, deviceId) {
    try {
      return await this.tokenCrypto.decryptToken(encryptedToken, deviceId);
    } catch {
      return '';
    }
  }

  shouldMigrateStoredSettings(storedSettings, token) {
    return (
      Object.prototype.hasOwnProperty.call(storedSettings, 'token') ||
      Object.prototype.hasOwnProperty.call(storedSettings, 'deviceId') ||
      Boolean(storedSettings.encryptedToken && !token)
    );
  }

  async serialize(settings) {
    const storedSettings = {
      ...settings,
      encryptedToken: await this.tokenCrypto.encryptToken(settings.token),
    };
    delete storedSettings.deviceId;
    delete storedSettings.token;
    return storedSettings;
  }
}
