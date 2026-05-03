import { icon } from './icon.js';

export function cookiesPanelTemplate() {
  return `
    <section class="tab-panel active" id="cookies-panel" data-tab="cookies">
      <div id="permission-state"></div>
      <div class="list-meta">
        <span id="cookie-count">0 cookies</span>
        <div class="list-actions">
          <button class="text-button" id="export-all" type="button">
            ${icon('file-export')}
            <span>Export all</span>
          </button>
          <button class="text-button" id="select-all" type="button">
            Select all
          </button>
        </div>
      </div>
      <div id="cookie-list" class="cookie-list"></div>
    </section>
  `;
}
