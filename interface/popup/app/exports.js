import { HeaderstringFormat } from '../../lib/headerstringFormat.js';
import { JsonFormat } from '../../lib/jsonFormat.js';
import { NetscapeFormat } from '../../lib/netscapeFormat.js';
import { ExportActions } from '../../lib/options/exportActions.js';
import { ExportFormats } from '../../lib/options/exportFormats.js';

export const exportMethods = {
  exportAllCookies() {
    this.handleDefaultExport(this.state.cookies, 'all');
  },

  handleDefaultExport(cookies, scope) {
    if (!cookies.length) {
      this.showSnackbar('No cookies to export');
      return;
    }
    const format = this.optionHandler.getExportFormat();
    const action = this.optionHandler.getExportAction();
    if (format === ExportFormats.Ask || action === ExportActions.Ask) {
      this.openExportTools(scope, format);
      return;
    }

    const domain = this.getCurrentDomain() || 'cookies';
    const fileBaseName = `cookie-editor-${this.sanitizeFileName(
      domain
    )}-${this.getDateStamp()}`;
    if (action === ExportActions.Copy) {
      this.copyCookies(cookies, format);
      return;
    }
    this.downloadCookies(cookies, format, fileBaseName);
  },

  exportSelectedCookies() {
    const cookies = this.getSelectedCookies();
    if (cookies.length) {
      this.handleDefaultExport(cookies, 'selected');
    }
  },

  openExportTools(scope, format) {
    this.setActiveTab('tools');
    this.els.exportScope.value = scope;
    if (format !== ExportFormats.Ask) {
      this.els.exportFormat.value = format;
    }
    this.updateExportOutput({ force: true });
    (format === ExportFormats.Ask
      ? this.els.exportFormat
      : this.els.copyExport
    ).focus();
  },

  updateExportOutput(options = {}) {
    if (!this.els.exportOutput) {
      return;
    }
    if (!options.force && this.state.activeTab !== 'tools') {
      return;
    }
    const cookies = this.getCookiesForExport();
    this.els.exportOutput.value = this.formatCookies(
      cookies,
      this.els.exportFormat.value
    );
  },

  getCookiesForExport() {
    const scope = this.els.exportScope.value;
    if (scope === 'selected') {
      return this.getSelectedCookies();
    }
    if (scope === 'currentDomain') {
      const currentDomain = this.getCurrentDomain();
      return this.state.cookies.filter(cookie =>
        this.normalizeDomain(cookie.domain).endsWith(currentDomain)
      );
    }
    return this.getVisibleCookies();
  },

  formatCookies(cookies, format) {
    const cookieMap = {};
    cookies.forEach(cookie => {
      cookieMap[this.getCookieId(cookie)] = {
        cookie: this.normalizeCookieForStorage(cookie),
      };
    });
    switch (format) {
      case ExportFormats.HeaderString:
        return HeaderstringFormat.format(cookieMap);
      case ExportFormats.Netscape:
        return NetscapeFormat.format(cookieMap);
      case ExportFormats.JSON:
      default:
        return JsonFormat.format(cookieMap);
    }
  },

  copyExportOutput() {
    this.updateExportOutput({ force: true });
    if (!this.els.exportOutput.value) {
      this.showSnackbar('No cookies to export');
      return;
    }
    this.copyText(this.els.exportOutput.value);
    this.showSnackbar('Export copied to clipboard');
  },

  copyCookies(cookies, format) {
    if (!cookies.length) {
      this.showSnackbar('No cookies to export');
      return;
    }
    const meta = this.getExportFileMeta(format);
    this.copyText(this.formatCookies(cookies, format));
    this.showSnackbar(`${meta.label} copied to clipboard`);
  },

  downloadExport(format) {
    const cookies = this.getCookiesForExport();
    const domain = this.getCurrentDomain() || 'cookies';
    this.downloadCookies(
      cookies,
      format,
      `cookie-editor-${this.sanitizeFileName(domain)}-${this.getDateStamp()}`
    );
  },

  downloadProfile(profile, format) {
    this.downloadCookies(
      this.getProfileCookies(profile),
      format,
      `cookie-profile-${this.sanitizeFileName(profile.name)}-${this.getDateStamp()}`
    );
  },

  downloadCookies(cookies, format, fileBaseName) {
    if (!cookies.length) {
      this.showSnackbar('No cookies to export');
      return;
    }
    const meta = this.getExportFileMeta(format);
    this.downloadText(
      `${fileBaseName}.${meta.extension}`,
      this.formatCookies(cookies, format),
      meta.contentType
    );
    this.showSnackbar(`${meta.label} downloaded`);
  },

  getExportFileMeta(format) {
    switch (format) {
      case ExportFormats.Netscape:
        return this.getTextExportMeta('Netscape export');
      case ExportFormats.HeaderString:
        return this.getTextExportMeta('Headers export');
      case ExportFormats.JSON:
      default:
        return {
          contentType: 'application/json;charset=utf-8',
          extension: 'json',
          label: 'JSON export',
        };
    }
  },

  getTextExportMeta(label) {
    return {
      contentType: 'text/plain;charset=utf-8',
      extension: 'txt',
      label,
    };
  },
};
