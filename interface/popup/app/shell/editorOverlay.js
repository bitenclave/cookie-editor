import { icon } from './icon.js';

export function editorOverlayTemplate() {
  return `
    <div id="sidepanel-backdrop" class="sidepanel-backdrop" hidden></div>
    <aside
      id="cookie-sidepanel"
      class="cookie-sidepanel"
      hidden
      aria-hidden="true"
      aria-labelledby="sidepanel-title">
      <form id="cookie-form" class="cookie-form">
        ${editorHeaderTemplate()}
        ${editorFieldsTemplate()}
        ${editorSwitchesTemplate()}
        ${editorActionsTemplate()}
      </form>
    </aside>
  `;
}

function editorHeaderTemplate() {
  return `
    <div class="sidepanel-header">
      <div>
        <h2 id="sidepanel-title">Edit Cookie</h2>
        <p id="sidepanel-subtitle">Current tab</p>
      </div>
      <button
        class="icon-button"
        id="close-sidepanel"
        type="button"
        aria-label="Close editor">
        ${icon('times')}
      </button>
    </div>
  `;
}

function editorFieldsTemplate() {
  return `
    <input id="cookie-id" name="id" type="hidden" />
    <label>
      Name
      <input id="cookie-name" name="name" type="text" required />
    </label>
    <label>
      Value
      <textarea id="cookie-value" name="value" required></textarea>
    </label>
    <label>
      Domain
      <input id="cookie-domain" name="domain" type="text" />
    </label>
    <label>
      Path
      <input id="cookie-path" name="path" type="text" />
    </label>
    <label>
      Expiration
      <input id="cookie-expiration" name="expiration" type="datetime-local" />
    </label>
    <label>
      SameSite
      <select id="cookie-sameSite" name="sameSite">
        <option value="">Unspecified</option>
        <option value="no_restriction">None</option>
        <option value="lax">Lax</option>
        <option value="strict">Strict</option>
      </select>
    </label>
  `;
}

function editorSwitchesTemplate() {
  return `
    <div class="switch-grid">
      ${switchTemplate('cookie-hostOnly', 'hostOnly', 'HostOnly')}
      ${switchTemplate('cookie-session', 'session', 'Session')}
      ${switchTemplate('cookie-secure', 'secure', 'Secure')}
      ${switchTemplate('cookie-httpOnly', 'httpOnly', 'HttpOnly')}
    </div>
  `;
}

function switchTemplate(id, name, label) {
  return `
    <label>
      <input id="${id}" name="${name}" type="checkbox" />
      ${label}
    </label>
  `;
}

function editorActionsTemplate() {
  return `
    <div class="sidepanel-actions">
      <button class="button danger ghost" id="delete-cookie" type="button">
        Delete
      </button>
      <button class="button ghost" id="cancel-cookie" type="button">
        Cancel
      </button>
      <button class="button primary" type="submit">Save</button>
    </div>
  `;
}
