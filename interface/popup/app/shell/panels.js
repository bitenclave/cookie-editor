import { cookiesPanelTemplate } from './cookiesPanel.js';
import { profilesPanelTemplate } from './profilesPanel.js';
import { toolsPanelTemplate } from './toolsPanel.js';

export function tabPanelsTemplate() {
  return `
    <main class="tab-panels">
      ${cookiesPanelTemplate()}
      ${profilesPanelTemplate()}
      ${toolsPanelTemplate()}
    </main>
  `;
}
