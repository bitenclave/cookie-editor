import { HeaderstringFormat } from '../../lib/headerstringFormat.js';
import { JsonFormat } from '../../lib/jsonFormat.js';
import { NetscapeFormat } from '../../lib/netscapeFormat.js';

export const importMethods = {
  updateImportPreview() {
    const rawInput = this.els.importInput.value.trim();
    if (!rawInput) {
      this.state.importPreview = [];
      this.els.importDetected.textContent = 'No format detected';
      this.renderImportPreview();
      return;
    }

    try {
      const parsed = this.parseCookieInput(rawInput);
      this.state.importPreview = parsed.cookies.map(cookie =>
        this.normalizeCookieForStorage(cookie)
      );
      this.els.importDetected.textContent = `Detected ${parsed.format}`;
    } catch {
      this.state.importPreview = [];
      this.els.importDetected.textContent = 'Invalid cookie input';
    }
    this.renderImportPreview();
  },

  renderImportPreview() {
    this.els.importPreview.replaceChildren();
    this.els.importPreviewCount.textContent = `${this.state.importPreview.length} cookie${
      this.state.importPreview.length === 1 ? '' : 's'
    }`;
    this.state.importPreview.slice(0, 5).forEach(cookie => {
      const row = document.createElement('div');
      row.className = 'preview-row';
      row.textContent = `${cookie.name || '(unnamed)'}  ${
        cookie.domain || this.getCurrentDomain() || ''
      }`;
      this.els.importPreview.appendChild(row);
    });
  },

  async importPreviewCookies() {
    if (!this.state.importPreview.length) {
      this.updateImportPreview();
    }
    if (!this.state.importPreview.length) {
      this.showSnackbar('Paste valid cookies before importing');
      return;
    }
    await this.importCookies(this.state.importPreview);
  },

  async importCookies(cookies) {
    const preparedCookies = cookies.map(cookie => ({
      ...cookie,
      domain: cookie.domain || this.getCurrentDomain() || '',
      path: cookie.path || '/',
    }));
    if (!(await this.ensureImportPermissions(preparedCookies))) {
      return false;
    }
    const errors = await Promise.all(
      preparedCookies.map(cookie => this.saveCookie(cookie))
    );
    const firstError = errors.find(Boolean);
    if (firstError) {
      this.showSnackbar(firstError);
      return false;
    }
    this.showSnackbar(
      `${preparedCookies.length} cookie${
        preparedCookies.length === 1 ? '' : 's'
      } imported`
    );
    this.refreshCookies();
    return true;
  },

  async ensureImportPermissions(cookies) {
    if (!this.importNeedsGlobalPermission(cookies)) {
      return true;
    }
    try {
      if (await this.permissionHandler.checkPermissions('<all_urls>')) {
        return true;
      }
      if (await this.permissionHandler.requestPermission('<all_urls>')) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    this.showSnackbar('All-sites permission is required for this import');
    return false;
  },

  importNeedsGlobalPermission(cookies) {
    if (this.isGlobalCookieScope()) {
      return true;
    }
    const currentDomain = this.normalizeDomain(this.getCurrentDomain());
    return cookies.some(cookie => {
      const domain = this.normalizeDomain(cookie.domain);
      if (!domain) {
        return false;
      }
      if (!currentDomain) {
        return true;
      }
      return !(
        domain === currentDomain ||
        domain.endsWith(`.${currentDomain}`) ||
        currentDomain.endsWith(`.${domain}`)
      );
    });
  },

  parseCookieInput(rawInput) {
    const parsers = [
      ['JSON', JsonFormat.parse],
      ['Netscape', NetscapeFormat.parse],
      ['Header String', HeaderstringFormat.parse],
    ];
    for (const [format, parser] of parsers) {
      try {
        const cookies = parser(rawInput);
        if (Array.isArray(cookies) && cookies.length) {
          return { format, cookies };
        }
      } catch {
        // Try the next parser.
      }
    }
    throw new Error('Unsupported cookie format');
  },
};
