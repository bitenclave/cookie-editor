import { dialogTemplate } from './dialog.js';
import { editorOverlayTemplate } from './editorOverlay.js';
import { headerTemplate } from './header.js';
import { bulkBarTemplate, tabNavTemplate } from './navigation.js';
import { tabPanelsTemplate } from './panels.js';
import { settingsPanelTemplate } from './settingsPanel.js';
import { snackbarTemplate } from './snackbar.js';
import { stateTemplates } from './stateTemplates.js';

export function renderAppShell() {
  if (document.querySelector('.app-shell')) {
    return;
  }
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <div class="app-shell cookies-active">
        ${headerTemplate()}
        ${tabPanelsTemplate()}
        ${bulkBarTemplate()}
        ${tabNavTemplate()}
      </div>
      ${editorOverlayTemplate()}
      ${settingsPanelTemplate()}
      ${dialogTemplate()}
      ${snackbarTemplate()}
      ${stateTemplates()}
    `
  );
}
