import {
  COOKIE_FILTER_BATCH_SIZE,
  MAX_DOMAIN_FILTER_OPTIONS,
} from './config.js';

export const cookieDomainMethods = {
  async renderDomainFilterOptionsAsync(token) {
    if (
      !this.els.cookieDomainOptions ||
      this.cookieDomainOptionsRenderedVersion === this.cookieListVersion
    ) {
      return;
    }
    const options = await this.getDomainFilterOptionsAsync(token);
    if (!options || !this.isCurrentCookieRender(token)) {
      return;
    }
    this.appendDomainFilterOptions(options);
    this.cookieDomainOptionsRenderedVersion = this.cookieListVersion;
  },

  async getDomainFilterOptionsAsync(token) {
    if (this.cookieDomainOptionsCache.version === this.cookieListVersion) {
      return this.cookieDomainOptionsCache.options;
    }
    const options = await this.collectDomainFilterOptionsAsync(token);
    if (!options) {
      return null;
    }
    this.cookieDomainOptionsCache = {
      options,
      version: this.cookieListVersion,
    };
    return options;
  },

  async collectDomainFilterOptionsAsync(token) {
    const domainCounts = new Map();
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
        this.addCookieDomainsToCounts(
          this.state.cookies[batchIndex],
          domainCounts
        );
      }
      if (batchEnd < this.state.cookies.length) {
        await this.yieldToBrowser();
        if (!this.isCurrentCookieRender(token)) {
          return null;
        }
      }
    }
    return this.createDomainFilterOptions(domainCounts);
  },

  updateDomainFilterControls(options = {}) {
    if (!this.els.cookieDomainOptions) {
      return;
    }
    this.syncDomainFilterInput();
    if (options.renderOptions !== false) {
      this.renderDomainFilterOptions();
    }
  },

  syncDomainFilterInput() {
    if (this.els.cookieDomainFilter.value !== this.state.domainFilter) {
      this.els.cookieDomainFilter.value = this.state.domainFilter;
    }
    this.els.clearDomainFilter.hidden = !this.state.domainFilter;
  },

  renderDomainFilterOptions() {
    if (this.cookieDomainOptionsRenderedVersion === this.cookieListVersion) {
      return;
    }
    this.appendDomainFilterOptions(this.getDomainFilterOptions());
    this.cookieDomainOptionsRenderedVersion = this.cookieListVersion;
  },

  getDomainFilterOptions() {
    if (this.cookieDomainOptionsCache.version === this.cookieListVersion) {
      return this.cookieDomainOptionsCache.options;
    }
    const domainCounts = new Map();
    this.state.cookies.forEach(cookie => {
      this.addCookieDomainsToCounts(cookie, domainCounts);
    });
    const options = this.createDomainFilterOptions(domainCounts);
    this.cookieDomainOptionsCache = {
      options,
      version: this.cookieListVersion,
    };
    return options;
  },

  addCookieDomainsToCounts(cookie, domainCounts) {
    this.getCookieRelatedDomains(cookie).forEach(domain => {
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    });
  },

  createDomainFilterOptions(domainCounts) {
    return [...domainCounts.entries()]
      .map(([domain, count]) => ({ count, domain }))
      .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain))
      .slice(0, MAX_DOMAIN_FILTER_OPTIONS);
  },

  appendDomainFilterOptions(options) {
    const fragment = document.createDocumentFragment();
    options.forEach(option => {
      const node = document.createElement('option');
      node.value = option.domain;
      node.label = `${option.count} cookie${option.count === 1 ? '' : 's'}`;
      fragment.appendChild(node);
    });
    this.els.cookieDomainOptions.replaceChildren(fragment);
  },

  cookieMatchesDomainFilter(cookie, domainFilter) {
    return this.domainMatchesRelatedDomain(
      this.normalizeDomain(cookie.domain),
      domainFilter
    );
  },

  domainMatchesRelatedDomain(domain, relatedDomain) {
    return Boolean(
      domain &&
      relatedDomain &&
      (domain === relatedDomain ||
        domain.endsWith(`.${relatedDomain}`) ||
        relatedDomain.endsWith(`.${domain}`))
    );
  },

  getCookieRelatedDomains(cookie) {
    const domain = this.normalizeDomain(cookie.domain);
    if (!domain) {
      return [];
    }
    return [...new Set([domain, this.getBaseCookieDomain(domain)])].filter(
      Boolean
    );
  },

  getBaseCookieDomain(domain) {
    const normalizedDomain = this.normalizeDomain(domain);
    const parts = normalizedDomain.split('.').filter(Boolean);
    if (parts.length <= 2) {
      return normalizedDomain;
    }
    const secondLevelDomains = new Set([
      'co',
      'com',
      'edu',
      'gov',
      'net',
      'org',
    ]);
    const sliceSize = secondLevelDomains.has(parts[parts.length - 2]) ? 3 : 2;
    return parts.slice(-sliceSize).join('.');
  },
};
