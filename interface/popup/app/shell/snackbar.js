import { icon } from './icon.js';

export function snackbarTemplate() {
  return `
    <div id="snackbar" class="snackbar" role="status" aria-live="polite">
      <span id="snackbar-message"></span>
      <button id="snackbar-undo" type="button">Undo</button>
      <button
        id="snackbar-close"
        class="icon-button"
        type="button"
        aria-label="Dismiss">
        ${icon('times')}
      </button>
    </div>
  `;
}
