import { FIELD_ALIASES, FLAG_ALIASES, SEARCH_SYNONYMS } from './config.js';

export const cookieSearchMethods = {
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
};
