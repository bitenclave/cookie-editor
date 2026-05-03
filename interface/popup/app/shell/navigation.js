import { icon } from './icon.js';

export function bulkBarTemplate() {
  return `
    <div id="bulk-bar" class="bulk-bar" aria-live="polite">
      <span id="bulk-count">0 selected</span>
      <div class="bulk-profile-wrapper">
        <button
          class="text-button"
          id="bulk-profile"
          type="button"
          aria-haspopup="menu"
          aria-expanded="false">
          Profile
        </button>
        <div
          class="bulk-profile-menu"
          id="bulk-profile-menu"
          role="menu"
          hidden>
          <button
            class="bulk-profile-menu-item"
            type="button"
            role="menuitem"
            data-profile-action="create">
            New profile
          </button>
          <label class="bulk-profile-picker" for="bulk-profile-select">
            Update profile
            <select id="bulk-profile-select"></select>
          </label>
          <button
            class="bulk-profile-menu-item primary"
            type="button"
            role="menuitem"
            data-profile-action="update">
            Update
          </button>
        </div>
      </div>
      <button class="text-button" id="bulk-export" type="button">
        Export
      </button>
      <button class="text-button danger" id="bulk-delete" type="button">
        Delete
      </button>
      <button
        class="icon-button"
        id="bulk-clear"
        type="button"
        aria-label="Clear">
        ${icon('times')}
      </button>
    </div>
  `;
}

export function tabNavTemplate() {
  return `
    <nav class="tab-nav" aria-label="Popup sections">
      ${tabButtonTemplate('cookies', 'cookie-bite', 'Cookies', true)}
      ${tabButtonTemplate('profiles', 'database', 'Profiles')}
      ${tabButtonTemplate('tools', 'wrench', 'Tools')}
    </nav>
  `;
}

function tabButtonTemplate(tab, iconName, label, active = false) {
  const activeClass = active ? ' active' : '';
  return `
    <button class="tab-button${activeClass}" type="button" data-tab="${tab}">
      ${icon(iconName)}
      <span>${label}</span>
    </button>
  `;
}
