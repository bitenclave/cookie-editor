import { icon } from './icon.js';

export function profilesPanelTemplate() {
  return `
    <section class="tab-panel" id="profiles-panel" data-tab="profiles">
      <div class="section-toolbar">
        <label class="search-field compact" for="profile-search">
          ${icon('search')}
          <input
            id="profile-search"
            type="search"
            autocomplete="off"
            placeholder="Search profiles" />
        </label>
        <select id="profile-group-filter" aria-label="Filter profile group">
          <option value="">All groups</option>
        </select>
        <select id="profile-sort" aria-label="Sort profiles">
          <option value="updated">Recently used</option>
          <option value="name">Name</option>
          <option value="group">Group</option>
          <option value="count">Cookie count</option>
        </select>
      </div>
      <div class="profile-create">
        <input id="new-profile-name" type="text" placeholder="Profile name" />
        <input id="new-profile-group" type="text" placeholder="Group" />
        <button class="button primary" id="save-current-profile" type="button">
          Save Current
        </button>
      </div>
      <div id="profiles-list" class="profile-grid"></div>
      <div id="profile-pagination" class="profile-pagination" hidden>
        <span id="profile-pagination-status"></span>
        <div class="profile-pagination-actions">
          <button
            class="icon-button"
            id="profile-prev-page"
            type="button"
            title="Previous profiles"
            aria-label="Previous profiles">
            ${icon('angle-left')}
          </button>
          <button
            class="icon-button"
            id="profile-next-page"
            type="button"
            title="Next profiles"
            aria-label="Next profiles">
            ${icon('angle-right')}
          </button>
        </div>
      </div>
      ${profileStorageTemplate()}
    </section>
  `;
}

function profileStorageTemplate() {
  return `
    <details class="profile-storage" id="profile-storage-section">
      <summary class="profile-storage-summary">
        <span class="profile-storage-summary-title">
          <span class="profile-storage-title">Profile storage</span>
          <span id="profile-storage-status" class="profile-storage-status">
            Local
          </span>
        </span>
        <span class="profile-storage-toggle">
          <span id="profile-storage-toggle-label">Show</span>
          ${icon('chevron-down')}
        </span>
      </summary>
      <div class="profile-storage-body">
        <div class="segmented-control">
          <label>
            <input name="profile-storage-mode" type="radio" value="local" />
            <span>${icon('database')} Local</span>
          </label>
          <label>
            <input name="profile-storage-mode" type="radio" value="cloud" />
            <span>${icon('cloud')} Cloud</span>
          </label>
        </div>
        <div id="profile-cloud-settings" class="profile-cloud-settings" hidden>
          <input
            id="profile-server-url"
            type="url"
            autocomplete="off"
            placeholder="Server URL" />
          <input
            id="profile-server-token"
            type="password"
            autocomplete="off"
            placeholder="Password or token" />
        </div>
        <div class="profile-storage-actions">
          <button class="button primary" id="save-profile-storage" type="button">
            ${icon('save')}
            <span>Save</span>
          </button>
          <button
            class="button profile-cloud-action"
            id="test-profile-storage"
            type="button">
            ${icon('plug')}
            <span>Test</span>
          </button>
          <button
            class="button profile-cloud-action"
            id="refresh-profile-storage"
            type="button">
            ${icon('sync-alt')}
            <span>Refresh</span>
          </button>
          <button
            class="button profile-cloud-action"
            id="upload-local-profiles"
            type="button">
            ${icon('cloud-upload-alt')}
            <span>Upload Local</span>
          </button>
        </div>
      </div>
    </details>
  `;
}
