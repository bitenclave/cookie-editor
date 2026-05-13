import { BrowserDetector } from '../../lib/browserDetector.js';
import { GenericStorageHandler } from '../../lib/genericStorageHandler.js';
import { OptionsHandler } from '../../lib/optionsHandler.js';
import { PermissionHandler } from '../../lib/permissionHandler.js';
import { ThemeHandler } from '../../lib/themeHandler.js';
import { CookieHandlerPopup } from '../cookieHandlerPopup.js';
import {
  DEFAULT_UI_SETTINGS,
  PROFILE_CLOUD_REFRESH_INTERVAL_MS,
  PROFILE_PAGE_SIZE,
  PROFILE_STORAGE_KEY,
  PROFILE_STORAGE_SETTINGS_KEY,
  PROFILE_SYNC_KEY,
  UI_SETTINGS_KEY,
} from './constants.js';
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
    this.profileSyncSourceId = this.createGuid();
    this.profileCloudRefreshTimer = null;
    this.profileRefreshDebounceTimer = null;
    this.profileRefreshInFlight = false;
    this.cookieRefreshToken = 0;
    this.cookieRenderToken = 0;
    this.cookieRefreshTimer = null;
    this.cookieRenderTimer = null;
    this.cookieChangeFlushTimer = null;
    this.cookieListVersion = 0;
    this.cookieCacheScope = '';
    this.cookieCacheSignature = '';
    this.cookieDomainOptionsCache = { options: [], version: -1 };
    this.cookieDomainOptionsRenderedVersion = -1;
    this.cookieRenderWindow = null;
    this.cookieRenderMoreStatus = null;
    this.pendingCookieChanges = [];
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
      cookieById: new Map(),
      profileSearch: '',
      profileGroupFilter: '',
      profileSort: 'updated',
      profilePage: 1,
      profilePageSize: PROFILE_PAGE_SIZE,
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
    this.cookieHandler.on('cookiesChanged', changeInfo =>
      this.handleCookieChange(changeInfo)
    );
    this.cookieHandler.on('ready', () => this.refreshCookies());
    this.bindProfileStorageChangeEvents();
    document.addEventListener('visibilitychange', () =>
      this.handleProfileVisibilityChange()
    );
    this.startProfileAutoRefresh();
  }

  bindProfileStorageChangeEvents() {
    const storage = this.browserDetector.getApi().storage;
    if (!storage?.onChanged) {
      return;
    }
    storage.onChanged.addListener((changes, areaName) =>
      this.handleProfileStorageChange(changes, areaName)
    );
  }

  handleProfileStorageChange(changes, areaName) {
    if (areaName && areaName !== 'local') {
      return;
    }
    if (changes[PROFILE_STORAGE_SETTINGS_KEY]) {
      this.queueProfileRefresh({ reloadSettings: true });
      return;
    }
    if (
      changes[PROFILE_STORAGE_KEY] &&
      this.state.profileStorage.mode !== 'cloud'
    ) {
      this.applyLoadedProfiles(changes[PROFILE_STORAGE_KEY].newValue || [], {
        keepPage: true,
      });
      return;
    }
    const sync = changes[PROFILE_SYNC_KEY]?.newValue;
    if (sync?.sourceId && sync.sourceId !== this.profileSyncSourceId) {
      this.queueProfileRefresh();
    }
  }

  queueProfileRefresh(options = {}) {
    window.clearTimeout(this.profileRefreshDebounceTimer);
    this.profileRefreshDebounceTimer = window.setTimeout(
      () => this.refreshProfilesSilently(options),
      150
    );
  }

  async refreshProfilesSilently(options = {}) {
    if (this.profileRefreshInFlight) {
      return;
    }
    this.profileRefreshInFlight = true;
    try {
      if (options.reloadSettings) {
        await this.loadProfileStorageSettings();
        this.startProfileAutoRefresh();
      }
      await this.loadProfiles({ keepPage: true, silent: true });
    } catch (error) {
      console.error(error);
    } finally {
      this.profileRefreshInFlight = false;
    }
  }

  startProfileAutoRefresh() {
    window.clearInterval(this.profileCloudRefreshTimer);
    this.profileCloudRefreshTimer = null;
    if (this.state.profileStorage.mode !== 'cloud') {
      return;
    }
    this.profileCloudRefreshTimer = window.setInterval(() => {
      if (!document.hidden) {
        this.refreshProfilesSilently();
      }
    }, PROFILE_CLOUD_REFRESH_INTERVAL_MS);
  }

  handleProfileVisibilityChange() {
    if (!document.hidden && this.state.profileStorage.mode === 'cloud') {
      this.refreshProfilesSilently();
    }
  }

  onOptionsChanged(oldOptions) {
    if (oldOptions?.theme !== this.optionHandler.getTheme()) {
      this.themeHandler.updateTheme();
    }
    if (oldOptions?.exportFormat !== this.optionHandler.getExportFormat()) {
      this.els.defaultExportFormat.value = this.optionHandler.getExportFormat();
      this.syncExportFormatSelect();
    }
    if (oldOptions?.exportAction !== this.optionHandler.getExportAction()) {
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
