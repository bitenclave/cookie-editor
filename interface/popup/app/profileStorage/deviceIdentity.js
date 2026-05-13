import { PROFILE_DEVICE_SESSION_KEY } from '../constants.js';

const DEVICE_ID_VERSION = 2;

export class ProfileDeviceIdentity {
  constructor(storageHandler) {
    this.storageHandler = storageHandler;
    this.sessionDeviceId = '';
  }

  normalizeDeviceId(deviceId) {
    return String(deviceId || '').trim();
  }

  async getSessionDeviceId() {
    const existingDeviceId = await this.getExistingSessionDeviceId();
    if (existingDeviceId) {
      return existingDeviceId;
    }
    this.sessionDeviceId = this.createDeviceId();
    await this.storageHandler.setSession(PROFILE_DEVICE_SESSION_KEY, {
      deviceId: this.sessionDeviceId,
      version: DEVICE_ID_VERSION,
    });
    return this.sessionDeviceId;
  }

  async getExistingSessionDeviceId(options = {}) {
    if (this.sessionDeviceId) {
      return this.sessionDeviceId;
    }
    const session = await this.storageHandler.getSession(
      PROFILE_DEVICE_SESSION_KEY
    );
    if (options.includeLegacy) {
      const legacyDeviceId = this.normalizeDeviceId(
        session?.deviceId || session
      );
      if (legacyDeviceId) {
        return legacyDeviceId;
      }
    }
    const deviceId = this.normalizeDeviceId(
      session?.version === DEVICE_ID_VERSION ? session.deviceId : ''
    );
    if (deviceId === this.createDeviceId()) {
      this.sessionDeviceId = deviceId;
    }
    return this.sessionDeviceId;
  }

  createDeviceId() {
    return this.mixDeviceFingerprint(this.getDeviceFingerprintData())
      .map(value => this.toHex8(value))
      .join('');
  }

  getDeviceFingerprintData() {
    const currentScreen = window.screen || {};
    const userAgentData = navigator.userAgentData || {};
    const screenWidth = Number(currentScreen.width) || 0;
    const screenHeight = Number(currentScreen.height) || 0;
    const screenLongSide = Math.max(screenWidth, screenHeight);
    const screenShortSide = Math.min(screenWidth, screenHeight);
    const languages = Array.isArray(navigator.languages)
      ? navigator.languages.join(',')
      : '';

    return [
      ['ua', navigator.userAgent],
      ['uaBrands', this.formatUserAgentBrands(userAgentData.brands)],
      ['uaMobile', userAgentData.mobile],
      ['uaPlatform', userAgentData.platform],
      ['platform', navigator.platform],
      ['vendor', navigator.vendor],
      ['language', navigator.language],
      ['languages', languages],
      ['screen', `${screenLongSide}x${screenShortSide}`],
      ['colorDepth', currentScreen.colorDepth],
      ['pixelDepth', currentScreen.pixelDepth],
      ['pixelRatio', this.roundFingerprintNumber(window.devicePixelRatio, 2)],
      ['timezone', this.getTimeZone()],
      ['timezoneOffset', new Date().getTimezoneOffset()],
      ['hardwareConcurrency', navigator.hardwareConcurrency],
      ['deviceMemory', navigator.deviceMemory],
      ['touchPoints', navigator.maxTouchPoints],
      ['pointer', this.getPrimaryPointerType()],
    ]
      .map(([key, value]) => `${key}=${this.normalizeFingerprintValue(value)}`)
      .join('|');
  }

  mixDeviceFingerprint(data) {
    let a = 0x6a09e667 | 0;
    let b = 0xbb67ae85 | 0;
    let c = 0x3c6ef372 | 0;
    let d = 0xa54ff53a | 0;

    for (let index = 0; index < data.length; index++) {
      const value = data.charCodeAt(index);
      a = (a ^ value ^ d) + this.rotateLeft(b, 5);
      b = (b ^ value ^ a) + this.rotateLeft(c, 7);
      c = (c ^ value ^ b) + this.rotateLeft(d, 11);
      d = (d ^ value ^ c) + this.rotateLeft(a, 13);

      a = (a + 0x9e3779b9) | 0;
      b = (b + 0x7f4a7c15) | 0;
      c = (c + 0x94d049bb) | 0;
      d = (d + 0x2545f491) | 0;
    }

    return [a ^ c, b ^ d, c ^ a ^ data.length, d ^ b ^ (data.length << 16)];
  }

  rotateLeft(value, bits) {
    return (value << bits) | (value >>> (32 - bits));
  }

  toHex8(value) {
    return (value >>> 0).toString(16).padStart(8, '0');
  }

  formatUserAgentBrands(brands) {
    if (!Array.isArray(brands)) {
      return '';
    }
    return brands
      .map(brand => `${brand.brand || ''}:${brand.version || ''}`)
      .sort()
      .join(',');
  }

  getTimeZone() {
    try {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      return '';
    }
  }

  getPrimaryPointerType() {
    if (window.matchMedia?.('(pointer: coarse)').matches) {
      return 'coarse';
    }
    if (window.matchMedia?.('(pointer: fine)').matches) {
      return 'fine';
    }
    return 'unknown';
  }

  normalizeFingerprintValue(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  roundFingerprintNumber(value, precision) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return '';
    }
    return number.toFixed(precision);
  }
}
