const TOKEN_CRYPTO_VERSION = 1;
const TOKEN_KDF_ITERATIONS = 310000;
const AUTH_TIMESTAMP_HEADER = 'X-Auth-Timestamp';
const AUTH_NONCE_HEADER = 'X-Auth-Nonce';
const AUTH_SIGNATURE_HEADER = 'X-Auth-Signature';
const DEVICE_ID_HEADER = 'X-Device-ID';

export class ProfileTokenCrypto {
  constructor(deviceIdentity) {
    this.deviceIdentity = deviceIdentity;
  }

  async encryptToken(token) {
    if (!token) {
      return null;
    }
    this.assertWebCrypto();
    const deviceId = await this.deviceIdentity.getSessionDeviceId();
    const salt = this.getRandomBytes(16);
    const iv = this.getRandomBytes(12);
    const key = await this.deriveTokenKey(deviceId, salt, ['encrypt']);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(token)
    );

    return {
      ciphertext: this.base64Encode(ciphertext),
      iv: this.base64Encode(iv),
      kdf: 'PBKDF2-SHA-256',
      iterations: TOKEN_KDF_ITERATIONS,
      salt: this.base64Encode(salt),
      version: TOKEN_CRYPTO_VERSION,
    };
  }

  async decryptToken(encryptedToken, deviceId) {
    if (encryptedToken.version !== TOKEN_CRYPTO_VERSION) {
      throw new Error('Stored sync token uses an unsupported format');
    }
    this.assertWebCrypto();
    try {
      const salt = this.base64Decode(encryptedToken.salt);
      const iv = this.base64Decode(encryptedToken.iv);
      const ciphertext = this.base64Decode(encryptedToken.ciphertext);
      const key = await this.deriveTokenKey(deviceId, salt, ['decrypt'], {
        iterations: this.normalizeKdfIterations(encryptedToken.iterations),
      });
      const token = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      return new TextDecoder().decode(token).trim();
    } catch (error) {
      throw new Error('Stored sync token could not be decrypted', {
        cause: error,
      });
    }
  }

  async deriveTokenKey(deviceId, salt, usages, options = {}) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(deviceId),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        hash: 'SHA-256',
        iterations: options.iterations || TOKEN_KDF_ITERATIONS,
        name: 'PBKDF2',
        salt,
      },
      keyMaterial,
      { length: 256, name: 'AES-GCM' },
      false,
      usages
    );
  }

  async createAuthHeaders(settings, requestUrl, options) {
    if (!settings.token) {
      throw new Error('Enter server URL and token');
    }
    this.assertWebCrypto();
    const url = new URL(requestUrl);
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body === undefined ? '' : String(options.body);
    const bodyHash = await this.sha256Hex(body);
    const timestamp = String(Date.now());
    const nonce = this.base64UrlEncode(this.getRandomBytes(16));
    const deviceId = await this.deviceIdentity.getSessionDeviceId();
    const signature = await this.signRequest({
      bodyHash,
      deviceId,
      method,
      nonce,
      path: `${url.pathname}${url.search}`,
      timestamp,
      token: settings.token,
    });

    return {
      [AUTH_NONCE_HEADER]: nonce,
      [AUTH_SIGNATURE_HEADER]: signature,
      [AUTH_TIMESTAMP_HEADER]: timestamp,
      [DEVICE_ID_HEADER]: deviceId,
    };
  }

  async signRequest({
    bodyHash,
    deviceId,
    method,
    nonce,
    path,
    timestamp,
    token,
  }) {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(token),
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['sign']
    );
    const payload = [method, path, timestamp, nonce, bodyHash, deviceId].join(
      '\n'
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload)
    );
    return this.hexEncode(signature);
  }

  async sha256Hex(value) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value)
    );
    return this.hexEncode(digest);
  }

  normalizeKdfIterations(value) {
    const iterations = Number(value);
    return Number.isFinite(iterations) &&
      iterations >= 100000 &&
      iterations <= 1000000
      ? iterations
      : TOKEN_KDF_ITERATIONS;
  }

  getRandomBytes(length) {
    this.assertWebCrypto();
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  assertWebCrypto() {
    if (!crypto?.subtle || !crypto?.getRandomValues) {
      throw new Error('Secure browser crypto is unavailable');
    }
  }

  base64Encode(value) {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    let binary = '';
    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  base64Decode(value) {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }

  base64UrlEncode(value) {
    return this.base64Encode(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  hexEncode(value) {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
