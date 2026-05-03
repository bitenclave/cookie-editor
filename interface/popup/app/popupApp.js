import { BrowserDetector } from '../../lib/browserDetector.js';
import { GenericStorageHandler } from '../../lib/genericStorageHandler.js';
import { OptionsHandler } from '../../lib/optionsHandler.js';
import { PermissionHandler } from '../../lib/permissionHandler.js';
import { ThemeHandler } from '../../lib/themeHandler.js';
import { CookieHandlerPopup } from '../cookieHandlerPopup.js';
import { DEFAULT_UI_SETTINGS, UI_SETTINGS_KEY } from './constants.js';
import { cookieMethods } from './cookies.js';
import { dialogMethods } from './dialogs.js';
import { editorMethods } from './editor.js';
import { elementMethods } from './elements.js';
import { exportMethods } from './exports.js';
import { importMethods } from './imports.js';
import { overlayMethods } from './overlays.js';
import { permissionMethods } from './permissions.js';
import { profileRenderingMethods } from './profileRendering.js';
import { profileMethods } from './profiles.js';
import { ProfileStorage } from './profileStorage.js';
import { profileStorageSettingsMethods } from './profileStorageSettings.js';
import { settingsMethods } from './settings.js';
import { utilityMethods } from './utils.js';

export class PopupApp {
  constructor() {
    this.browserDetector = new BrowserDetector();
    this.storageHandler = new GenericStorageHandler(this.browserDetector);
    this.optionHandler = new OptionsHandler(
      this.browserDetector,
      this.storageHandler
    );
    this.themeHandler = new ThemeHandler(this.optionHandler);
    this.permissionHandler = new PermissionHandler(this.browserDetector);
    this.cookieHandler = new CookieHandlerPopup(this.browserDetector);
    this.profileStore = new ProfileStorage(
      this.storageHandler,
      this.browserDetector
    );
    this.els = {};
    this.state = this.createInitialState();
  }

  createInitialState() {
    return {
      activeTab: DEFAULT_UI_SETTINGS.activeTab,
      cookies: [],
      selected: new Set(),
      search: '',
      domainFilter: '',
      cookieScope: DEFAULT_UI_SETTINGS.cookieScope,
      filters: new Set(),
      profiles: [],
      profileSearch: '',
      profileGroupFilter: '',
      profileSort: 'updated',
      openProfileId: null,
      bulkProfileMenuOpen: false,
      profileStorage: {},
      uiSettings: { ...DEFAULT_UI_SETTINGS },
      importPreview: [],
      currentEditorId: null,
      activeOverlay: null,
      overlayHideTimer: null,
      overlayToken: 0,
      dialog: null,
    };
  }

  async init() {
    this.cacheElements();
    this.bindEvents();
    await this.optionHandler.loadOptions();
    this.state.uiSettings = {
      ...DEFAULT_UI_SETTINGS,
      ...((await this.storageHandler.getLocal(UI_SETTINGS_KEY)) || {}),
    };
    this.state.cookieScope = ['local', 'global'].includes(
      this.state.uiSettings.cookieScope
    )
      ? this.state.uiSettings.cookieScope
      : DEFAULT_UI_SETTINGS.cookieScope;
    this.state.uiSettings.cookieScope = this.state.cookieScope;
    this.state.activeTab = ['cookies', 'profiles', 'tools'].includes(
      this.state.uiSettings.activeTab
    )
      ? this.state.uiSettings.activeTab
      : DEFAULT_UI_SETTINGS.activeTab;
    this.state.uiSettings.activeTab = this.state.activeTab;
    this.themeHandler.updateTheme();
    this.hydrateSettings();
    await this.loadProfileStorageSettings();
    await this.loadProfiles();
    this.renderProfiles();
    this.setActiveTab(this.state.activeTab, { persist: false });
    this.bindServiceEvents();

    if (this.cookieHandler.isReady) {
      this.refreshCookies();
    }
    setTimeout(() => document.body.classList.remove('notransition'), 50);
  }

  bindServiceEvents() {
    this.optionHandler.on('optionsChanged', oldOptions => {
      this.onOptionsChanged(oldOptions);
    });
    this.cookieHandler.on('cookiesChanged', () => this.refreshCookies());
    this.cookieHandler.on('ready', () => this.refreshCookies());
  }

  onOptionsChanged(oldOptions) {
    if (oldOptions.theme !== this.optionHandler.getTheme()) {
      this.themeHandler.updateTheme();
    }
    if (oldOptions.exportFormat !== this.optionHandler.getExportFormat()) {
      this.els.defaultExportFormat.value = this.optionHandler.getExportFormat();
      this.syncExportFormatSelect();
    }
    if (oldOptions.exportAction !== this.optionHandler.getExportAction()) {
      this.els.defaultExportAction.value = this.optionHandler.getExportAction();
    }
  }
}

Object.assign(
  PopupApp.prototype,
  elementMethods,
  cookieMethods,
  dialogMethods,
  editorMethods,
  exportMethods,
  importMethods,
  profileMethods,
  profileRenderingMethods,
  profileStorageSettingsMethods,
  settingsMethods,
  overlayMethods,
  permissionMethods,
  utilityMethods
);
