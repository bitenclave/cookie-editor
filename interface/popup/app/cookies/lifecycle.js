import { COOKIE_CHANGE_FLUSH_MS } from './config.js';

export const cookieLifecycleMethods = {
  queueRefreshCookies(delay = 120) {
    window.clearTimeout(this.cookieRefreshTimer);
    this.cookieRefreshTimer = window.setTimeout(
      () => this.refreshCookies(),
      delay
    );
  },

  queueRenderCookies(delay = 80) {
    window.clearTimeout(this.cookieRenderTimer);
    this.cookieRenderTimer = window.setTimeout(
      () => this.renderCookies(),
      delay
    );
  },

  async refreshCookies() {
    window.clearTimeout(this.cookieRefreshTimer);
    const tab = this.cookieHandler.currentTab;
    if (!tab) {
      return;
    }

    const token = ++this.cookieRefreshToken;
    const scope = this.state.cookieScope;
    this.cookieHandler.setCookieScope?.(scope);
    this.updateCurrentSite();
    this.els.permissionState.replaceChildren();
    if (this.shouldShowRefreshLoading(scope)) {
      this.showCookieLoadingState(this.getCookieLoadingMessage(scope));
    }
    await this.yieldToBrowser();
    if (!this.isCurrentCookieRefresh(token, scope, tab)) {
      return;
    }

    if (this.shouldBlockCookieRefresh(scope, tab)) {
      this.setCookies([], scope);
      this.showPermissionImpossible();
      this.renderCookies();
      return;
    }

    const permissionTarget = this.getPermissionTargetForScope(scope, tab);
    const hasPermission =
      await this.permissionHandler.checkPermissions(permissionTarget);
    if (!this.isCurrentCookieRefresh(token, scope, tab)) {
      return;
    }
    if (!hasPermission) {
      this.setCookies([], scope);
      this.showPermissionPrompt(permissionTarget);
      this.renderCookies();
      return;
    }

    const cookies = await this.getCookiesForScope(scope, tab);
    if (!this.isCurrentCookieRefresh(token, scope, tab)) {
      return;
    }
    if (this.setCookies(cookies, scope)) {
      this.state.selected.clear();
      this.renderCookies();
      this.updateExportOutput();
      return;
    }
    this.setCookieBusy(false);
    if (!this.state.cookies.length) {
      this.renderCookies();
    }
  },

  shouldShowRefreshLoading(scope) {
    return !this.state.cookies.length || this.cookieCacheScope !== scope;
  },

  getCookieLoadingMessage(scope) {
    return scope === 'global'
      ? 'Loading all browser cookies...'
      : 'Loading cookies for this tab...';
  },

  shouldBlockCookieRefresh(scope, tab) {
    return (
      scope !== 'global' &&
      !this.permissionHandler.canHavePermissions(tab.url || '')
    );
  },

  isCurrentCookieRefresh(token, scope, tab) {
    const currentTab = this.cookieHandler.currentTab;
    return Boolean(
      token === this.cookieRefreshToken &&
      scope === this.state.cookieScope &&
      currentTab &&
      currentTab.id === tab.id &&
      currentTab.url === tab.url &&
      (currentTab.cookieStoreId || '') === (tab.cookieStoreId || '')
    );
  },

  getPermissionTargetForScope(scope, tab) {
    return scope === 'global' ? '<all_urls>' : tab.url || '';
  },

  getCookiesForScope(scope, tab) {
    return new Promise(resolve => {
      const getCookies =
        scope === 'global'
          ? this.cookieHandler.getAllCookiesInBrowser.bind(this.cookieHandler)
          : callback => this.cookieHandler.getAllCookiesForTab(tab, callback);
      getCookies(cookies => resolve(cookies || []));
    });
  },

  setCookies(cookies, scope) {
    const sortedCookies = cookies.sort((a, b) =>
      this.sortCookiesForScope(a, b, scope)
    );
    const signature = this.getCookieCollectionSignature(sortedCookies);
    if (
      signature === this.cookieCacheSignature &&
      scope === this.cookieCacheScope
    ) {
      return false;
    }
    this.state.cookies = sortedCookies;
    this.state.cookieById = new Map(
      this.state.cookies.map(cookie => [this.getCookieId(cookie), cookie])
    );
    this.cookieCacheScope = scope;
    this.cookieCacheSignature = signature;
    this.cookieListVersion += 1;
    this.cookieDomainOptionsRenderedVersion = -1;
    return true;
  },

  handleCookieChange(changeInfo) {
    if (!this.canPatchCookieChange(changeInfo)) {
      this.queueRefreshCookies(400);
      return;
    }
    this.pendingCookieChanges.push(changeInfo);
    window.clearTimeout(this.cookieChangeFlushTimer);
    this.cookieChangeFlushTimer = window.setTimeout(
      () => this.flushCookieChanges(),
      COOKIE_CHANGE_FLUSH_MS
    );
  },

  canPatchCookieChange(changeInfo) {
    return Boolean(
      changeInfo?.cookie &&
      this.cookieCacheScope === this.state.cookieScope &&
      this.cookieCacheSignature
    );
  },

  flushCookieChanges() {
    const changes = this.pendingCookieChanges.splice(0);
    if (!changes.length) {
      return;
    }
    const cookieById = new Map(this.state.cookieById);
    let changed = false;
    changes.forEach(changeInfo => {
      changed = this.applyCookieChange(cookieById, changeInfo) || changed;
    });
    if (!changed) {
      return;
    }
    if (this.setCookies([...cookieById.values()], this.state.cookieScope)) {
      this.queueRenderCookies();
      this.updateExportOutput();
    }
  },

  applyCookieChange(cookieById, changeInfo) {
    const id = this.getCookieId(changeInfo.cookie);
    const existing = cookieById.get(id);
    if (changeInfo.removed) {
      return cookieById.delete(id);
    }
    if (
      existing &&
      this.getCookieSignature(existing) ===
        this.getCookieSignature(changeInfo.cookie)
    ) {
      return false;
    }
    cookieById.set(id, changeInfo.cookie);
    return true;
  },

  getCookieCollectionSignature(cookies) {
    return cookies.map(cookie => this.getCookieSignature(cookie)).join('\n');
  },

  getCookieSignature(cookie) {
    return JSON.stringify([
      this.getCookieId(cookie),
      cookie.value || '',
      cookie.expirationDate || '',
      cookie.secure || false,
      cookie.httpOnly || false,
      cookie.sameSite || '',
      cookie.session || false,
    ]);
  },

  sortCookies(a, b) {
    return this.sortCookiesForScope(a, b, this.state.cookieScope);
  },

  sortCookiesForScope(a, b, scope) {
    if (scope !== 'global') {
      return this.sortCookiesByName(a, b);
    }
    return (
      this.normalizeDomain(a.domain).localeCompare(
        this.normalizeDomain(b.domain)
      ) ||
      (a.path || '').localeCompare(b.path || '') ||
      this.sortCookiesByName(a, b)
    );
  },
};
