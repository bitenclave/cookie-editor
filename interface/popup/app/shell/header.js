import { icon } from './icon.js';

export function headerTemplate() {
  return `
    <header class="app-header">
      <div class="title-row">
        <div class="title-copy">
          <h1>Cookie-Editor</h1>
          <p id="current-site">Loading current tab...</p>
        </div>
        <div class="header-actions">
          <div class="scope-toggle" aria-label="Cookie scope">
            <label class="scope-option">
              <input
                type="radio"
                name="cookie-scope"
                value="local"
                checked />
              <span>${icon('location-arrow')} Tab</span>
            </label>
            <label class="scope-option">
              <input type="radio" name="cookie-scope" value="global" />
              <span>${icon('globe')} Global</span>
            </label>
          </div>
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
      <div class="toolbar cookie-controls">
        <label class="search-field" for="cookie-search">
          ${icon('search')}
          <input
            id="cookie-search"
            type="search"
            autocomplete="off"
            placeholder="Search cookies" />
        </label>
        <button
          class="icon-button primary"
          id="add-cookie"
          type="button"
          title="Add cookie">
          ${icon('plus')}
          <span>Add</span>
        </button>
        <button
          class="icon-button danger"
          id="delete-all"
          type="button"
          title="Delete all visible cookies">
          ${icon('trash')}
          <span>Delete All</span>
        </button>
      </div>
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
      <div class="filter-chips cookie-controls" aria-label="Cookie filters">
        <button class="chip" type="button" data-filter="session">
          Session
        </button>
        <button class="chip" type="button" data-filter="persistent">
          Persistent
        </button>
        <button class="chip" type="button" data-filter="secure">Secure</button>
        <button class="chip" type="button" data-filter="httpOnly">
          HttpOnly
        </button>
        <button class="chip" type="button" data-filter="hostOnly">
          HostOnly
        </button>
        <button class="chip" type="button" data-filter="sameSiteNone">
          SameSite=None
        </button>
        <button class="chip" type="button" data-filter="currentDomain">
          Current Domain
        </button>
      </div>
    </header>
  `;
}
