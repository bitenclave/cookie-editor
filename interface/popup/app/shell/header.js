import { icon } from './icon.js';

export function headerTemplate() {
  return `
    <header class="app-header">
      ${titleRowTemplate()}
      ${cookieToolbarTemplate()}
      ${domainFilterTemplate()}
      ${filterChipsTemplate()}
    </header>
  `;
}

function titleRowTemplate() {
  return `
    <div class="title-row">
      <div class="title-copy">
        <h1>Cookie-Editor</h1>
        <p id="current-site">Loading current tab...</p>
      </div>
      <div class="header-actions">
        ${scopeToggleTemplate()}
        <button
          class="icon-button"
          id="open-options"
          type="button"
          aria-label="Open settings"
          title="Settings">
          ${icon('cog')}
        </button>
      </div>
    </div>
  `;
}

function scopeToggleTemplate() {
  return `
    <div class="scope-toggle" aria-label="Cookie scope">
      <label class="scope-option">
        <input type="radio" name="cookie-scope" value="local" checked />
        <span>${icon('location-arrow')} Tab</span>
      </label>
      <label class="scope-option">
        <input type="radio" name="cookie-scope" value="global" />
        <span>${icon('globe')} Global</span>
      </label>
    </div>
  `;
}

function cookieToolbarTemplate() {
  return `
    <div class="toolbar cookie-controls">
      <label class="search-field" for="cookie-search">
        ${icon('search')}
        <input
          id="cookie-search"
          type="search"
          autocomplete="off"
          placeholder="Search cookies" />
      </label>
      ${headerButtonTemplate('add-cookie', 'primary', 'plus', 'Add')}
      ${headerButtonTemplate('delete-all', 'danger', 'trash', 'Delete All')}
    </div>
  `;
}

function headerButtonTemplate(id, variant, iconName, label) {
  return `
    <button
      class="icon-button ${variant}"
      id="${id}"
      type="button"
      title="${label === 'Add' ? 'Add cookie' : 'Delete all visible cookies'}">
      ${icon(iconName)}
      <span>${label}</span>
    </button>
  `;
}

function domainFilterTemplate() {
  return `
    <div class="domain-filter-row cookie-controls">
      <label class="domain-filter-field" for="cookie-domain-filter">
        ${icon('globe')}
        <input
          id="cookie-domain-filter"
          type="search"
          list="cookie-domain-options"
          autocomplete="off"
          placeholder="All domains" />
      </label>
      <datalist id="cookie-domain-options"></datalist>
      <button
        class="icon-button"
        id="clear-domain-filter"
        type="button"
        aria-label="Clear domain filter"
        title="Clear domain filter"
        hidden>
        ${icon('times')}
      </button>
    </div>
  `;
}

function filterChipsTemplate() {
  return `
    <div class="filter-chips cookie-controls" aria-label="Cookie filters">
      ${filterChipTemplate('session', 'Session')}
      ${filterChipTemplate('persistent', 'Persistent')}
      ${filterChipTemplate('secure', 'Secure')}
      ${filterChipTemplate('httpOnly', 'HttpOnly')}
      ${filterChipTemplate('hostOnly', 'HostOnly')}
      ${filterChipTemplate('sameSiteNone', 'SameSite=None')}
      ${filterChipTemplate('currentDomain', 'Current Domain')}
    </div>
  `;
}

function filterChipTemplate(filter, label) {
  return `<button class="chip" type="button" data-filter="${filter}">${label}</button>`;
}
