const FIELD_ALIASES = {
  d: 'domain',
  domain: 'domain',
  host: 'domain',
  n: 'name',
  name: 'name',
  p: 'path',
  path: 'path',
  samesite: 'sameSite',
  store: 'storeId',
  storeid: 'storeId',
  v: 'value',
  value: 'value',
};

const FLAG_ALIASES = {
  exact: 'hostOnly',
  host: 'hostOnly',
  hostonly: 'hostOnly',
  http: 'httpOnly',
  httponly: 'httpOnly',
  http_only: 'httpOnly',
  none: 'sameSiteNone',
  persistent: 'persistent',
  secure: 'secure',
  session: 'session',
  temporary: 'session',
};

const SEARCH_SYNONYMS = {
  ads: ['ad', 'ads', 'advertising', 'doubleclick', 'fbp', 'fr', 'gcl'],
  analytics: ['analytics', '_ga', '_gid', '_gat', 'gtag', 'utm'],
  auth: ['auth', 'csrf', 'jwt', 'login', 'sid', 'token', 'xsrf'],
  identity: ['id', 'uid', 'user', 'visitor'],
  prefs: ['consent', 'lang', 'locale', 'pref', 'settings', 'theme'],
  security: ['csrf', 'httponly', 'secure', 'token', 'xsrf'],
  tracking: ['analytics', 'fbp', 'ga', 'gid', 'track', 'tracking', 'utm'],
};

export const cookieMethods = {
  async refreshCookies() {
    if (!this.cookieHandler.currentTab) {
      return;
    }

    this.cookieHandler.setCookieScope?.(this.state.cookieScope);
    this.updateCurrentSite();
    this.state.selected.clear();
    this.els.permissionState.replaceChildren();

    if (
      !this.isGlobalCookieScope() &&
      !this.permissionHandler.canHavePermissions(this.getCurrentTabUrl())
    ) {
      this.state.cookies = [];
      this.showPermissionImpossible();
      this.renderCookies();
      return;
    }

    const permissionTarget = this.getPermissionTarget();
    const hasPermission =
      await this.permissionHandler.checkPermissions(permissionTarget);
    if (!hasPermission) {
      this.state.cookies = [];
      this.showPermissionPrompt(permissionTarget);
      this.renderCookies();
      return;
    }

    const cookies = await this.getAllCookies();
    this.state.cookies = cookies.sort((a, b) => this.sortCookies(a, b));
    this.renderCookies();
    this.updateExportOutput();
  },

  getAllCookies() {
    return new Promise(resolve => {
      const getCookies = this.isGlobalCookieScope()
        ? this.cookieHandler.getAllCookiesInBrowser.bind(this.cookieHandler)
        : this.cookieHandler.getAllCookies.bind(this.cookieHandler);
      getCookies(cookies => resolve(cookies || []));
    });
  },

  sortCookies(a, b) {
    if (!this.isGlobalCookieScope()) {
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

  renderCookies() {
    const visibleCookies = this.getVisibleCookies();
    this.updateDomainFilterControls();
    this.els.cookieList.replaceChildren();
    this.els.cookieCount.textContent = this.getCookieCountLabel(
      visibleCookies.length
    );
    this.updateSelectAllLabel(visibleCookies);

    if (!visibleCookies.length) {
      this.renderEmptyCookieState();
      return;
    }
    for (const cookie of visibleCookies) {
      this.els.cookieList.appendChild(this.createCookieRow(cookie));
    }
    this.updateBulkBar();
  },

  updateSelectAllLabel(visibleCookies) {
    const allSelected =
      visibleCookies.length &&
      visibleCookies.every(cookie =>
        this.state.selected.has(this.getCookieId(cookie))
      );
    this.els.selectAll.textContent = allSelected ? 'Clear all' : 'Select all';
  },

  renderEmptyCookieState() {
    const empty = document
      .importNode(document.getElementById('tmp-empty-state').content, true)
      .querySelector('.empty-state');
    empty.querySelector('p').textContent = this.isGlobalCookieScope()
      ? 'No cookies match the current global view.'
      : 'This page does not have cookies matching the current view.';
    empty
      .querySelector('[data-action="create"]')
      .addEventListener('click', () => {
        this.openCookieEditor();
      });
    empty
      .querySelector('[data-action="import"]')
      .addEventListener('click', () => {
        this.setActiveTab('tools');
        this.els.importInput.focus();
      });
    this.els.cookieList.appendChild(empty);
    this.updateBulkBar();
  },

  createCookieRow(cookie) {
    const id = this.getCookieId(cookie);
    const row = document.createElement('article');
    row.className = 'cookie-row';
    row.dataset.id = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'cookie-select';
    checkbox.checked = this.state.selected.has(id);
    checkbox.setAttribute('aria-label', `Select ${cookie.name}`);
    row.appendChild(checkbox);

    row.appendChild(this.createCookieMainButton(cookie));
    return row;
  },

  createCookieMainButton(cookie) {
    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'cookie-main text-button';
    main.dataset.action = 'edit';

    const nameLine = document.createElement('div');
    nameLine.className = 'cookie-name-line';
    const name = document.createElement('span');
    name.className = 'cookie-name';
    name.textContent = cookie.name || '(unnamed)';
    nameLine.append(name, this.createBadges(cookie));

    const value = document.createElement('div');
    value.className = 'cookie-value';
    value.textContent = cookie.value || '(empty value)';

    const meta = document.createElement('div');
    meta.className = 'cookie-meta';
    meta.textContent = [cookie.domain, cookie.path].filter(Boolean).join('  ');
    main.append(nameLine, value, meta);
    return main;
  },

  createBadges(cookie) {
    const badges = document.createElement('div');
    badges.className = 'badge-row';
    const badgeMap = [
      ['secure', cookie.secure, 'shield-alt', 'Secure'],
      ['httpOnly', cookie.httpOnly, 'lock', 'HttpOnly'],
      ['session', cookie.session || !cookie.expirationDate, 'clock', 'Session'],
      ['hostOnly', cookie.hostOnly, 'unlink', 'HostOnly'],
      [
        'sameSite',
        cookie.sameSite,
        'fingerprint',
        `SameSite ${cookie.sameSite}`,
      ],
    ];
    for (const [className, enabled, icon, title] of badgeMap) {
      if (enabled) {
        badges.appendChild(this.createBadge(className, icon, title));
      }
    }
    return badges;
  },

  createBadge(className, icon, title) {
    const badge = document.createElement('span');
    badge.className = `badge ${className}`;
    badge.title = title;
    badge.innerHTML = `<svg class="icon"><use href="../sprites/solid.svg#${icon}"></use></svg>`;
    return badge;
  },

  getVisibleCookies() {
    const context = {
      currentDomain: this.getCurrentDomain(),
      domainFilter: this.normalizeDomain(this.state.domainFilter),
      search: this.parseCookieSearch(this.state.search),
    };
    return this.state.cookies
      .filter(cookie => this.isCookieVisible(cookie, context))
      .sort((a, b) => this.sortVisibleCookies(a, b, context));
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

  sortVisibleCookies(a, b, context) {
    if (!context.search.raw && !context.domainFilter) {
      return this.sortCookies(a, b);
    }
    return (
      this.scoreCookieSearch(b, context) - this.scoreCookieSearch(a, context) ||
      this.sortCookies(a, b)
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

  parseCookieSearch(search = '') {
    const raw = search.trim().toLowerCase();
    const query = {
      fields: [],
      flags: [],
      raw,
      terms: [],
    };
    if (!raw) {
      return query;
    }
    const tokens = raw.match(/"[^"]+"|'[^']+'|\S+/g) || [];
    tokens.forEach(token => this.addCookieSearchToken(query, token));
    return query;
  },

  addCookieSearchToken(query, rawToken) {
    let token = rawToken.replace(/^["']|["']$/g, '');
    const negative = token.startsWith('-') || token.startsWith('!');
    if (negative) {
      token = token.slice(1);
    }
    const separator = token.indexOf(':');
    if (separator > 0) {
      const field = FIELD_ALIASES[token.slice(0, separator)];
      const value = token.slice(separator + 1);
      if (field && value) {
        query.fields.push({ field, negative, value });
        return;
      }
    }
    const normalizedFlag = FLAG_ALIASES[token.replace(/[-\s]/g, '')];
    if (normalizedFlag) {
      query.flags.push({ flag: normalizedFlag, negative });
      return;
    }
    if (token) {
      query.terms.push({ negative, value: token });
    }
  },

  cookieMatchesSearch(cookie, query) {
    if (!query.raw) {
      return true;
    }
    return (
      query.fields.every(field => this.cookieMatchesField(cookie, field)) &&
      query.flags.every(flag => this.cookieMatchesSearchFlag(cookie, flag)) &&
      query.terms.every(term => this.cookieMatchesSearchTerm(cookie, term))
    );
  },

  cookieMatchesField(cookie, fieldQuery) {
    const value = this.getCookieFieldValue(cookie, fieldQuery.field);
    const matches =
      fieldQuery.field === 'domain'
        ? this.cookieDomainMatchesSearch(value, fieldQuery.value)
        : value.includes(fieldQuery.value);
    return fieldQuery.negative ? !matches : matches;
  },

  getCookieFieldValue(cookie, field) {
    if (field === 'domain') {
      return this.normalizeDomain(cookie.domain);
    }
    return String(cookie[field] || '').toLowerCase();
  },

  cookieDomainMatchesSearch(domain, searchValue) {
    const normalizedSearch = this.normalizeDomain(searchValue);
    return this.domainMatchesRelatedDomain(domain, normalizedSearch);
  },

  cookieMatchesSearchFlag(cookie, flagQuery) {
    const matches = this.cookieHasSearchFlag(cookie, flagQuery.flag);
    return flagQuery.negative ? !matches : matches;
  },

  cookieHasSearchFlag(cookie, flag) {
    switch (flag) {
      case 'hostOnly':
        return Boolean(cookie.hostOnly);
      case 'httpOnly':
        return Boolean(cookie.httpOnly);
      case 'persistent':
        return Boolean(cookie.expirationDate);
      case 'sameSiteNone':
        return cookie.sameSite === 'no_restriction';
      case 'secure':
        return Boolean(cookie.secure);
      case 'session':
        return !cookie.expirationDate;
      default:
        return false;
    }
  },

  cookieMatchesSearchTerm(cookie, termQuery) {
    const matches = this.cookieSearchValues(cookie).some(value =>
      this.searchValueMatches(value, termQuery.value)
    );
    return termQuery.negative ? !matches : matches;
  },

  searchValueMatches(value, term) {
    if (value.includes(term)) {
      return true;
    }
    return this.getSemanticTerms(term).some(semanticTerm =>
      value.includes(semanticTerm)
    );
  },

  getSemanticTerms(term) {
    return SEARCH_SYNONYMS[term] || [];
  },

  cookieSearchValues(cookie) {
    const values = [
      cookie.name,
      cookie.value,
      cookie.domain,
      this.normalizeDomain(cookie.domain),
      this.getBaseCookieDomain(cookie.domain),
      cookie.path,
      cookie.sameSite,
      cookie.storeId,
    ];
    if (cookie.secure) {
      values.push('secure encrypted https');
    }
    if (cookie.httpOnly) {
      values.push('httponly http only server protected');
    }
    if (cookie.hostOnly) {
      values.push('hostonly exact host tab domain');
    }
    if (cookie.expirationDate) {
      values.push('persistent saved expires');
    } else {
      values.push('session temporary');
    }
    if (cookie.sameSite === 'no_restriction') {
      values.push('samesite none cross site third party');
    }
    return values.filter(Boolean).map(value => String(value).toLowerCase());
  },

  scoreCookieSearch(cookie, context) {
    let score = 0;
    if (
      context.domainFilter &&
      this.normalizeDomain(cookie.domain) === context.domainFilter
    ) {
      score += 20;
    }
    context.search.terms.forEach(term => {
      if (!term.negative) {
        score += this.scoreCookieSearchTerm(cookie, term.value);
      }
    });
    context.search.fields.forEach(field => {
      if (!field.negative && this.cookieMatchesField(cookie, field)) {
        score += field.field === 'domain' ? 14 : 10;
      }
    });
    context.search.flags.forEach(flag => {
      if (!flag.negative && this.cookieHasSearchFlag(cookie, flag.flag)) {
        score += 4;
      }
    });
    return score;
  },

  scoreCookieSearchTerm(cookie, term) {
    const name = String(cookie.name || '').toLowerCase();
    const domain = this.normalizeDomain(cookie.domain);
    const path = String(cookie.path || '').toLowerCase();
    if (name === term) {
      return 18;
    }
    if (domain === term) {
      return 16;
    }
    if (name.includes(term)) {
      return 12;
    }
    if (domain.includes(term)) {
      return 10;
    }
    if (path.includes(term)) {
      return 6;
    }
    return 2;
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

  updateDomainFilterControls() {
    if (!this.els.cookieDomainOptions) {
      return;
    }
    this.syncDomainFilterInput();
    this.renderDomainFilterOptions();
  },

  syncDomainFilterInput() {
    if (this.els.cookieDomainFilter.value !== this.state.domainFilter) {
      this.els.cookieDomainFilter.value = this.state.domainFilter;
    }
    this.els.clearDomainFilter.hidden = !this.state.domainFilter;
  },

  renderDomainFilterOptions() {
    const options = this.getDomainFilterOptions();
    this.els.cookieDomainOptions.replaceChildren();
    options.forEach(option => {
      const node = document.createElement('option');
      node.value = option.domain;
      node.label = `${option.count} cookie${option.count === 1 ? '' : 's'}`;
      this.els.cookieDomainOptions.appendChild(node);
    });
  },

  getDomainFilterOptions() {
    const domainCounts = new Map();
    this.state.cookies.forEach(cookie => {
      this.getCookieRelatedDomains(cookie).forEach(domain => {
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      });
    });
    return [...domainCounts.entries()]
      .map(([domain, count]) => ({ count, domain }))
      .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain))
      .slice(0, 200);
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

  handleFilterClick(event) {
    const button = event.target.closest('.chip');
    if (!button) {
      return;
    }
    const filter = button.dataset.filter;
    const isActive = this.state.filters.has(filter);
    this.state.filters[isActive ? 'delete' : 'add'](filter);
    button.classList.toggle('active', !isActive);
    this.renderCookies();
  },

  handleCookieListClick(event) {
    const editTarget = event.target.closest('[data-action="edit"]');
    if (!editTarget) {
      return;
    }
    const cookie = this.getCookieById(
      editTarget.closest('.cookie-row').dataset.id
    );
    if (cookie) {
      this.openCookieEditor(cookie);
    }
  },

  handleCookieListChange(event) {
    if (!event.target.classList.contains('cookie-select')) {
      return;
    }
    const id = event.target.closest('.cookie-row').dataset.id;
    this.state.selected[event.target.checked ? 'add' : 'delete'](id);
    this.updateBulkBar();
  },

  toggleSelectAll() {
    const visibleCookies = this.getVisibleCookies();
    const allSelected =
      visibleCookies.length &&
      visibleCookies.every(cookie =>
        this.state.selected.has(this.getCookieId(cookie))
      );
    visibleCookies.forEach(cookie => {
      this.state.selected[allSelected ? 'delete' : 'add'](
        this.getCookieId(cookie)
      );
    });
    this.renderCookies();
  },

  clearSelection() {
    this.state.selected.clear();
    this.renderCookies();
  },

  updateBulkBar() {
    const count = this.state.selected.size;
    this.els.bulkCount.textContent = `${count} selected`;
    this.els.bulkBar.classList.toggle('visible', count > 0);
    if (!count) {
      this.closeBulkProfileMenu();
      return;
    }
    this.renderBulkProfileMenu();
  },
};
