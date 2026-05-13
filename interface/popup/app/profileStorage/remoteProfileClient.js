import { normalizeProfile, toRemoteProfile } from './normalizers.js';
import { assertInsecureHttpAllowed, buildUrl } from './security.js';

export class RemoteProfileClient {
  constructor(tokenCrypto) {
    this.tokenCrypto = tokenCrypto;
  }

  async fetchProfiles(settings) {
    const data = await this.request(settings, '/api/profiles');
    return (data.profiles || []).map(profile => normalizeProfile(profile));
  }

  async replaceProfiles(settings, profiles) {
    const data = await this.request(settings, '/api/profiles', {
      method: 'PUT',
      body: JSON.stringify({
        profiles: profiles.map(profile => toRemoteProfile(profile)),
      }),
    });
    return (data.profiles || []).map(profile => normalizeProfile(profile));
  }

  async request(settings, path, options = {}) {
    assertInsecureHttpAllowed(settings);
    const requestUrl = buildUrl(settings.serverUrl, path);
    const authHeaders = await this.tokenCrypto.createAuthHeaders(
      settings,
      requestUrl,
      options
    );
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return response.json();
  }
}
