import { icon } from './icon.js';

export function stateTemplates() {
  return `
    <template id="tmp-empty-state">
      <div class="empty-state">
        ${icon('cookie-bite')}
        <h2>No cookies found</h2>
        <p>This page does not have cookies matching the current view.</p>
        <div class="empty-actions">
          <button class="button primary" type="button" data-action="create">
            Create cookie
          </button>
          <button class="button" type="button" data-action="import">
            Import cookies
          </button>
        </div>
      </div>
    </template>
    <template id="tmp-profile-empty">
      <div class="empty-state small">
        ${icon('database')}
        <h2>No profiles saved</h2>
        <p>Save the current tab cookies as a reusable profile.</p>
      </div>
    </template>
  `;
}
