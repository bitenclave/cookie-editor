import { GenericCookieHandler } from '../lib/genericCookieHandler.js';

/**
 * implements Cookie API handling for the popup and other similar interfaces.
 */
export class CookieHandlerPopup extends GenericCookieHandler {
  /**
   * Constructs and initializes the cookie handler.
   * @param {BrowserDetector} browserDetector
   */
  constructor(browserDetector) {
    super(browserDetector);
    console.log('Constructing PopupCookieHandler');
    this.isReady = false;
    this.currentTabId = null;
    this.watchAllCookieChanges = false;

    if (this.browserDetector.supportsPromises()) {
      this.browserDetector
        .getApi()
        .tabs.query({ active: true, currentWindow: true })
        .then(this.init);
    } else {
      this.browserDetector
        .getApi()
        .tabs.query({ active: true, currentWindow: true }, this.init);
    }
  }

  /**
   * Initialise the cookie handler after getting our first contact with the
   * current tab.
   * @param {*} tabInfo Info about the current tab.
   */
  init = tabInfo => {
    this.currentTabId = tabInfo[0].id;
    this.currentTab = tabInfo[0];
    const api = this.browserDetector.getApi();
    api.tabs.onUpdated.addListener(this.onTabsChanged);
    api.tabs.onActivated.addListener(this.onTabActivated);
    if (!this.browserDetector.isSafari()) {
      api.cookies.onChanged.addListener(this.onCookiesChanged);
    }

    this.emit('ready');
    this.isReady = true;
  };

  /**
   * Handles events that is triggered when a cookie changes.
   * @param {object} changeInfo An object containing details of the change that
   *     occurred.
   */
  onCookiesChanged = changeInfo => {
    if (this.watchAllCookieChanges) {
      this.emit('cookiesChanged', changeInfo);
      return;
    }

    if (this.cookieChangeAppliesToCurrentTab(changeInfo)) {
      this.emit('cookiesChanged', changeInfo);
    }
  };

  cookieChangeAppliesToCurrentTab(changeInfo) {
    if (!this.currentTab?.url || !changeInfo?.cookie) {
      return false;
    }
    if (!this.cookieStoresMatch(changeInfo.cookie)) {
      return false;
    }
    try {
      const tabHost = new URL(this.currentTab.url).hostname.toLowerCase();
      const cookieDomain = String(changeInfo.cookie.domain || '')
        .replace(/^\./, '')
        .toLowerCase();
      return Boolean(
        tabHost &&
        cookieDomain &&
        (tabHost === cookieDomain ||
          (!changeInfo.cookie.hostOnly && tabHost.endsWith(`.${cookieDomain}`)))
      );
    } catch {
      return false;
    }
  }

  cookieStoresMatch(cookie) {
    return (
      !cookie.storeId ||
      cookie.storeId === (this.currentTab.cookieStoreId || '0')
    );
  }

  /**
   * Updates how broadly cookie change events should refresh the popup.
   * @param {string} scope
   */
  setCookieScope(scope) {
    this.watchAllCookieChanges = scope === 'global';
  }

  /**
   * Handles the event that is fired when a tab is updated.
   * @param {object} tabId Id of the tab that changed.
   * @param {object} changeInfo Properties of the tab that changed.
   * @param {object} _tab
   */
  onTabsChanged = (tabId, changeInfo, _tab) => {
    if (
      tabId === this.currentTabId &&
      (changeInfo.url || changeInfo.status === 'complete')
    ) {
      console.log('tabChanged!');
      if (this.browserDetector.supportsPromises()) {
        this.browserDetector
          .getApi()
          .tabs.query({ active: true, currentWindow: true })
          .then(this.updateCurrentTab);
      } else {
        this.browserDetector
          .getApi()
          .tabs.query(
            { active: true, currentWindow: true },
            this.updateCurrentTab
          );
      }
    }
  };

  /**
   * Event handler for when a tab is being activated.
   * @param {object} activeInfo Info about the event.
   */
  onTabActivated = activeInfo => {
    if (this.browserDetector.supportsPromises()) {
      this.browserDetector
        .getApi()
        .tabs.query({ active: true, currentWindow: true })
        .then(this.updateCurrentTab);
    } else {
      this.browserDetector
        .getApi()
        .tabs.query(
          { active: true, currentWindow: true },
          this.updateCurrentTab
        );
    }
  };

  /**
   * Emits a signal that the current tab changed if needed.
   * @param {object} tabInfo Info about the new current tab.
   */
  updateCurrentTab = tabInfo => {
    const newTab =
      tabInfo[0].id !== this.currentTabId ||
      tabInfo[0].url !== this.currentTab.url;
    this.currentTabId = tabInfo[0].id;
    this.currentTab = tabInfo[0];

    if (newTab && this.isReady) {
      this.emit('cookiesChanged');
    }
  };
}
