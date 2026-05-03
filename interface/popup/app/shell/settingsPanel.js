import { icon } from './icon.js';

export function settingsPanelTemplate() {
  return `
    <div id="settings-backdrop" class="sidepanel-backdrop" hidden></div>
    <aside
      id="settings-panel"
      class="settings-panel"
      hidden
      aria-hidden="true"
      aria-labelledby="settings-panel-title">
      <div class="settings-panel-content">
        <div class="sidepanel-header">
          <div>
            <h2 id="settings-panel-title">Settings</h2>
            <p>Popup preferences</p>
          </div>
          <button
            class="icon-button"
            id="close-settings"
            type="button"
            aria-label="Close settings">
            ${icon('times')}
          </button>
        </div>
        ${settingsFieldsTemplate()}
      </div>
    </aside>
  `;
}

function settingsFieldsTemplate() {
  return `
    <label class="setting-row">
      Theme
      <select id="theme-select">
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    <label class="setting-row">
      <span>Compact rows</span>
      <input id="compact-toggle" type="checkbox" />
    </label>
    <label class="setting-row">
      <span>Confirm before delete all</span>
      <input id="confirm-delete-all" type="checkbox" checked />
    </label>
    <label class="setting-row">
      Default export
      <select id="default-export-format">
        <option value="ask">Ask</option>
        <option value="json">JSON</option>
        <option value="netscape">Netscape</option>
        <option value="headerstring">Headers</option>
      </select>
    </label>
    <label class="setting-row">
      Export action
      <select id="default-export-action">
        <option value="ask">Ask</option>
        <option value="download">Download</option>
        <option value="copy">Copy</option>
      </select>
    </label>
  `;
}
