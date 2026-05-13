import { Cookie } from '../../lib/cookie.js';

export const utilityMethods = {
  createIcon(icon) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    svg.classList.add('icon');
    use.setAttribute('href', `../sprites/solid.svg#${icon}`);
    svg.appendChild(use);
    return svg;
  },

  getCurrentTabUrl() {
    return this.cookieHandler.currentTab?.url || '';
  },

  isGlobalCookieScope() {
    return this.state.cookieScope === 'global';
  },

  getPermissionTarget() {
    return this.isGlobalCookieScope() ? '<all_urls>' : this.getCurrentTabUrl();
  },

  getCurrentDomain() {
    try {
      return new URL(this.getCurrentTabUrl()).hostname;
    } catch {
      return '';
    }
  },

  normalizeDomain(domain = '') {
    return domain.replace(/^\./, '').toLowerCase();
  },

  getCookieAccessUrl(cookie = {}) {
    const domain = this.normalizeDomain(cookie.domain);
    if (domain) {
      return this.createCookieUrl(domain, cookie);
    }
    return this.getHttpTabUrl();
  },

  createCookieUrl(domain, cookie) {
    const protocol = this.getCookieUrlProtocol(domain, cookie);
    const path = this.getCookieUrlPath(cookie.path);
    return `${protocol}//${domain}${path}`;
  },

  getCookieUrlProtocol(domain, cookie) {
    if (cookie.secure) {
      return 'https:';
    }
    try {
      const currentUrl = new URL(this.getCurrentTabUrl());
      const currentDomain = this.normalizeDomain(currentUrl.hostname);
      if (
        ['http:', 'https:'].includes(currentUrl.protocol) &&
        (currentDomain === domain || currentDomain.endsWith(`.${domain}`))
      ) {
        return currentUrl.protocol;
      }
    } catch {
      // Fall back to HTTPS below.
    }
    return 'https:';
  },

  getCookieUrlPath(path = '/') {
    const normalizedPath = String(path || '/').startsWith('/')
      ? String(path || '/')
      : `/${path}`;
    return encodeURI(normalizedPath.split(/[?#]/)[0] || '/');
  },

  getHttpTabUrl() {
    const currentUrl = this.getCurrentTabUrl();
    try {
      const { protocol } = new URL(currentUrl);
      if (['http:', 'https:'].includes(protocol)) {
        return currentUrl;
      }
    } catch {
      return '';
    }
    return '';
  },

  getCookieId(cookie) {
    return String(Cookie.hashCode(cookie));
  },

  getCookieById(id) {
    return this.state.cookieById.get(String(id));
  },

  normalizeCookieForStorage(cookie, options = {}) {
    const normalized = {
      domain: cookie.domain || '',
      expirationDate: cookie.expirationDate || null,
      hostOnly: Boolean(cookie.hostOnly),
      httpOnly: Boolean(cookie.httpOnly),
      name: cookie.name || '',
      path: cookie.path || '/',
      sameSite:
        cookie.sameSite === 'unspecified' ? null : cookie.sameSite || null,
      secure: Boolean(cookie.secure),
      session: Boolean(cookie.session || !cookie.expirationDate),
      value: cookie.value || '',
      storeId: options.preserveStoreId ? cookie.storeId || null : null,
    };
    this.applyParsedExpiration(cookie, normalized);
    return normalized;
  },

  applyParsedExpiration(cookie, normalized) {
    if (!cookie.expiration || normalized.expirationDate) {
      return;
    }
    const expiration = parseInt(cookie.expiration, 10);
    if (!Number.isNaN(expiration) && expiration > 0) {
      normalized.expirationDate = expiration;
      normalized.session = false;
    }
  },

  formatDateTimeLocal(expirationDate) {
    if (!expirationDate) {
      return '';
    }
    const date = new Date(expirationDate * 1000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  },

  sortCookiesByName(a, b) {
    return (a.name || '').localeCompare(b.name || '');
  },

  sortProfilesByUpdatedAt(a, b) {
    return (
      getProfileDateValue(b.updatedAt || b.createdAt) -
        getProfileDateValue(a.updatedAt || a.createdAt) ||
      (a.name || '').localeCompare(b.name || '')
    );
  },

  copyText(text) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  },

  downloadText(filename, text, contentType) {
    const blob = new Blob([text], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  },

  sanitizeFileName(value) {
    return (
      String(value || 'cookies')
        .trim()
        .replace(/[<>:"/\\|?*]/g, '-')
        .split('')
        .map(char => (char.charCodeAt(0) < 32 ? '-' : char))
        .join('')
        .replace(/\s+/g, '-')
        .slice(0, 80) || 'cookies'
    );
  },

  getDateStamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  },

  createGuid() {
    if (crypto?.randomUUID) {
      return crypto.randomUUID();
    }
    if (!crypto?.getRandomValues) {
      throw new Error('Secure browser crypto is unavailable');
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join('-');
  },
};

function getProfileDateValue(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
