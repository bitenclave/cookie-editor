import { COOKIE_FILTER_BATCH_SIZE } from './config.js';

export const cookieFilteringMethods = {
  async getVisibleCookiesAsync(token) {
    const context = this.getCookieListContext();
    const visibleCookies = [];
    for (
      let index = 0;
      index < this.state.cookies.length;
      index += COOKIE_FILTER_BATCH_SIZE
    ) {
      const batchEnd = Math.min(
        index + COOKIE_FILTER_BATCH_SIZE,
        this.state.cookies.length
      );
      for (let batchIndex = index; batchIndex < batchEnd; batchIndex += 1) {
        const cookie = this.state.cookies[batchIndex];
        if (this.isCookieVisible(cookie, context)) {
          visibleCookies.push(cookie);
        }
      }
      if (batchEnd < this.state.cookies.length) {
        await this.yieldToBrowser();
        if (!this.isCurrentCookieRender(token)) {
          return null;
        }
      }
    }
    return this.sortFilteredCookies(visibleCookies, context);
  },

  getVisibleCookies() {
    const context = this.getCookieListContext();
    return this.sortFilteredCookies(
      this.state.cookies.filter(cookie =>
        this.isCookieVisible(cookie, context)
      ),
      context
    );
  },

  getCookieListContext() {
    return {
      currentDomain: this.getCurrentDomain(),
      domainFilter: this.normalizeDomain(this.state.domainFilter),
      search: this.parseCookieSearch(this.state.search),
    };
  },

  sortFilteredCookies(cookies, context) {
    if (!context.search.raw && !context.domainFilter) {
      return cookies;
    }
    return cookies
      .map(cookie => ({
        cookie,
        score: this.scoreCookieSearch(cookie, context),
      }))
      .sort((a, b) => b.score - a.score || this.sortCookies(a.cookie, b.cookie))
      .map(result => result.cookie);
  },

  isCookieVisible(cookie, context) {
    if (
      context.domainFilter &&
      !this.cookieMatchesDomainFilter(cookie, context.domainFilter)
    ) {
      return false;
    }
    if (!this.cookieMatchesSearch(cookie, context.search)) {
      return false;
    }
    if (this.state.filters.has('session') && cookie.expirationDate) {
      return false;
    }
    if (this.state.filters.has('persistent') && !cookie.expirationDate) {
      return false;
    }
    if (this.state.filters.has('secure') && !cookie.secure) {
      return false;
    }
    if (this.state.filters.has('httpOnly') && !cookie.httpOnly) {
      return false;
    }
    if (this.state.filters.has('hostOnly') && !cookie.hostOnly) {
      return false;
    }
    if (
      this.state.filters.has('sameSiteNone') &&
      cookie.sameSite !== 'no_restriction'
    ) {
      return false;
    }
    return !(
      this.state.filters.has('currentDomain') &&
      context.currentDomain &&
      !this.cookieMatchesDomainFilter(cookie, context.currentDomain)
    );
  },

  getCookieCountLabel(visibleCount) {
    const totalCount = this.state.cookies.length;
    const suffix = visibleCount === 1 ? '' : 's';
    if (!this.hasActiveCookieFilters() || visibleCount === totalCount) {
      return `${visibleCount} cookie${suffix}`;
    }
    return `${visibleCount} of ${totalCount} cookies`;
  },

  hasActiveCookieFilters() {
    return Boolean(
      this.state.search || this.state.domainFilter || this.state.filters.size
    );
  },
};
