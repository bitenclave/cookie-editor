import { BrowserDetector } from '../../lib/browserDetector.js';
import { Cookie } from '../../lib/cookie.js';
import { GenericStorageHandler } from '../../lib/genericStorageHandler.js';
import { JsonFormat } from '../../lib/jsonFormat.js';
import { NetscapeFormat } from '../../lib/netscapeFormat.js';
import { OptionsHandler } from '../../lib/optionsHandler.js';
import { PermissionHandler } from '../../lib/permissionHandler.js';
import { ThemeHandler } from '../../lib/themeHandler.js';
import { CookieHandlerPopup } from '../../popup/cookieHandlerPopup.js';

export class OptionsPage {
  constructor() {
    this.browserDetector = new BrowserDetector();
    this.storageHandler = new GenericStorageHandler(this.browserDetector);
    this.optionHandler = new OptionsHandler(
      this.browserDetector,
      this.storageHandler
    );
    this.themeHandler = new ThemeHandler(this.optionHandler);
    this.cookieHandler = new CookieHandlerPopup(this.browserDetector);
    this.permissionHandler = new PermissionHandler(this.browserDetector);
    this.inputs = {};
  }

  async init() {
    this.cacheInputs();
    await this.optionHandler.loadOptions();
    this.themeHandler.updateTheme();
    this.setFormValues();
    this.optionHandler.on('optionsChanged', () => this.setFormValues());
    this.setInputEvents();
  }

  cacheInputs() {
    Object.assign(this.inputs, {
      advancedCookie: document.getElementById('advanced-cookie'),
      showDevtools: document.getElementById('devtool-show'),
      animationsEnabled: document.getElementById('animations-enabled'),
      exportAction: document.getElementById('export-action'),
      exportFormat: document.getElementById('export-format'),
      extraInfo: document.getElementById('extra-info'),
      theme: document.getElementById('theme'),
      buttonBarTop: document.getElementById('button-bar-top'),
    });
  }

  setFormValues() {
    console.log('Setting up the form');
    this.handleAnimationsEnabled();
    this.inputs.advancedCookie.checked = this.optionHandler.getCookieAdvanced();
    this.inputs.showDevtools.checked = this.optionHandler.getDevtoolsEnabled();
    this.inputs.animationsEnabled.checked =
      this.optionHandler.getAnimationsEnabled();
    this.inputs.exportAction.value = this.optionHandler.getExportAction();
    this.inputs.exportFormat.value = this.optionHandler.getExportFormat();
    this.inputs.extraInfo.value = this.optionHandler.getExtraInfo();
    this.inputs.theme.value = this.optionHandler.getTheme();
    this.inputs.buttonBarTop.checked = this.optionHandler.getButtonBarTop();
  }

  setInputEvents() {
    this.bindTrustedChange(this.inputs.advancedCookie, () => {
      this.optionHandler.setCookieAdvanced(this.inputs.advancedCookie.checked);
    });
    this.bindTrustedChange(this.inputs.showDevtools, () => {
      this.optionHandler.setDevtoolsEnabled(this.inputs.showDevtools.checked);
    });
    this.bindTrustedChange(this.inputs.animationsEnabled, () => {
      this.optionHandler.setAnimationsEnabled(
        this.inputs.animationsEnabled.checked
      );
      this.handleAnimationsEnabled();
    });
    this.bindTrustedChange(this.inputs.exportFormat, () => {
      this.optionHandler.setExportFormat(this.inputs.exportFormat.value);
    });
    this.bindTrustedChange(this.inputs.exportAction, () => {
      this.optionHandler.setExportAction(this.inputs.exportAction.value);
    });
    this.bindTrustedChange(this.inputs.extraInfo, () => {
      this.optionHandler.setExtraInfo(this.inputs.extraInfo.value);
    });
    this.bindTrustedChange(this.inputs.theme, () => {
      this.optionHandler.setTheme(this.inputs.theme.value);
      this.themeHandler.updateTheme();
    });
    this.bindTrustedChange(this.inputs.buttonBarTop, () => {
      this.optionHandler.setButtonBarTop(this.inputs.buttonBarTop.checked);
    });
    this.bindActionButtons();
  }

  bindTrustedChange(input, handler) {
    input.addEventListener('change', event => {
      if (event.isTrusted) {
        handler();
      }
    });
  }

  bindActionButtons() {
    document
      .getElementById('delete-all')
      .addEventListener('click', async () => {
        await this.deleteAllCookies();
      });
    document
      .getElementById('export-all-json')
      .addEventListener('click', async () => {
        await this.exportCookiesAsJson();
      });
    document
      .getElementById('export-all-netscape')
      .addEventListener('click', async () => {
        await this.exportCookiesAsNetscape();
      });
  }

  async getAllPermissions() {
    const hasPermissions =
      await this.permissionHandler.checkPermissions('<all_urls>');
    if (!hasPermissions) {
      await this.permissionHandler.requestPermission('<all_urls>');
    }
  }

  async getAllCookies() {
    await this.getAllPermissions();
    return new Promise(resolve => {
      this.cookieHandler.getAllCookiesInBrowser(cookies => {
        const loadedCookies = [];
        for (const cookie of cookies) {
          const id = Cookie.hashCode(cookie);
          loadedCookies[id] = new Cookie(id, cookie, this.optionHandler);
        }
        resolve(loadedCookies);
      });
    });
  }

  async deleteAllCookies() {
    const deleteAll = confirm(
      'Are you sure you want to delete ALL your cookies?'
    );
    if (!deleteAll) {
      return;
    }
    const cookies = await this.getAllCookies();
    for (const cookieId in cookies) {
      if (Object.prototype.hasOwnProperty.call(cookies, cookieId)) {
        this.deleteCookie(cookies[cookieId].cookie);
      }
    }
    alert('All your cookies were deleted');
  }

  deleteCookie(cookie) {
    const url = 'https://' + cookie.domain + cookie.path;
    this.cookieHandler.removeCookie(cookie.name, url);
  }

  async exportCookiesAsJson() {
    const cookies = await this.getAllCookies();
    this.copyText(JsonFormat.format(cookies));
    alert('Done!');
  }

  async exportCookiesAsNetscape() {
    const cookies = await this.getAllCookies();
    this.copyText(NetscapeFormat.format(cookies));
    alert('Done!');
  }

  copyText(text) {
    const fakeText = document.createElement('textarea');
    fakeText.classList.add('clipboardCopier');
    fakeText.textContent = text;
    document.body.appendChild(fakeText);
    fakeText.focus();
    fakeText.select();
    document.execCommand('Copy');
    document.body.removeChild(fakeText);
  }

  handleAnimationsEnabled() {
    document.body.classList.toggle(
      'notransition',
      !this.optionHandler.getAnimationsEnabled()
    );
  }
}
