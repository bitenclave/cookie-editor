export function buildUrl(serverUrl, path) {
  if (!serverUrl) {
    throw new Error('Enter a server URL');
  }
  return new URL(path, `${serverUrl}/`).toString();
}

export function assertInsecureHttpAllowed(settings) {
  if (
    isInsecureRemoteServer(settings.serverUrl) &&
    !settings.acceptedInsecureHttpWarning
  ) {
    throw new Error('Confirm insecure HTTP cloud sync before transferring');
  }
}

export function isInsecureRemoteServer(serverUrl) {
  try {
    const url = new URL(serverUrl);
    return url.protocol === 'http:' && !isLocalServerHost(url.hostname);
  } catch {
    return false;
  }
}

export function isLocalServerHost(hostname = '') {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export function upgradeToHttps(serverUrl) {
  const url = new URL(serverUrl);
  url.protocol = 'https:';
  return url.toString().replace(/\/+$/, '');
}

export function toPermissionOrigin(serverUrl) {
  const url = new URL(serverUrl);
  return `${url.protocol}//${url.host}/*`;
}
