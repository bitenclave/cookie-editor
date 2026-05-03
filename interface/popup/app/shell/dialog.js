export function dialogTemplate() {
  return `
    <div id="app-dialog-layer" class="dialog-layer" hidden>
      <div id="app-dialog-backdrop" class="dialog-backdrop"></div>
      <form
        id="app-dialog"
        class="app-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby="app-dialog-message">
        <div>
          <h2 id="app-dialog-title">Confirm action</h2>
          <p id="app-dialog-message"></p>
        </div>
        <label id="app-dialog-input-row" class="dialog-input-row" hidden>
          <span id="app-dialog-input-label"></span>
          <input id="app-dialog-input" type="text" autocomplete="off" />
        </label>
        <div class="dialog-actions">
          <button
            class="button ghost"
            id="app-dialog-cancel"
            type="button">
            Cancel
          </button>
          <button
            class="button primary"
            id="app-dialog-confirm"
            type="submit">
            OK
          </button>
        </div>
      </form>
    </div>
  `;
}
