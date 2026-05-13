import { dialogTemplate } from './dialog.js';
import { editorOverlayTemplate } from './editorOverlay.js';
import { headerTemplate } from './header.js';
import { bulkBarTemplate, tabNavTemplate } from './navigation.js';
import { tabPanelsTemplate } from './panels.js';
import { settingsPanelTemplate } from './settingsPanel.js';
import { snackbarTemplate } from './snackbar.js';
import { stateTemplates } from './stateTemplates.js';

export function renderAppShell() {
  const existingShell = document.querySelector('.app-shell');
  if (existingShell) {
    return existingShell;
  }

  const shell = document.createElement('div');
  shell.className = 'app-shell cookies-active';
  shell.innerHTML = `
    ${headerTemplate()}
    ${tabPanelsTemplate()}
    ${bulkBarTemplate()}
    ${tabNavTemplate()}
  `;
  document.body.prepend(shell);
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      ${editorOverlayTemplate()}
      ${settingsPanelTemplate()}
      ${dialogTemplate()}
      ${snackbarTemplate()}
      ${stateTemplates()}
    `
  );
  return shell;
}
