import { ExportFormats } from '../../lib/options/exportFormats.js';
import { UI_SETTINGS_KEY } from './constants.js';

const MAIN_TABS = ['cookies', 'profiles', 'tools'];

export const settingsMethods = {
  hydrateSettings() {
    document.body.classList.toggle(
      'compact',
      this.state.uiSettings.compactRows
    );
    this.els.themeSelect.value = this.optionHandler.getTheme();
    this.els.compactToggle.checked = this.state.uiSettings.compactRows;
    this.els.confirmDeleteAll.checked = this.state.uiSettings.confirmDeleteAll;
    this.els.defaultExportAction.value = this.optionHandler.getExportAction();
    this.els.defaultExportFormat.value = this.optionHandler.getExportFormat();
    this.syncCookieScopeToggle();
    this.syncExportFormatSelect();
  },

  syncCookieScopeToggle() {
    this.els.cookieScope.forEach(input => {
      input.checked = input.value === this.state.cookieScope;
    });
  },

  async changeCookieScope(scope) {
    if (
      !['local', 'global'].includes(scope) ||
      scope === this.state.cookieScope
    ) {
      return;
    }
    this.state.cookieScope = scope;
    this.state.uiSettings.cookieScope = scope;
    this.state.domainFilter = '';
    this.state.selected.clear();
    this.syncCookieScopeToggle();
    this.updateCurrentSite();
    await this.saveUiSettings();
    this.refreshCookies();
  },

  syncExportFormatSelect() {
    this.els.exportFormat.value =
      this.optionHandler.getExportFormat() === ExportFormats.Ask
        ? ExportFormats.JSON
        : this.optionHandler.getExportFormat();
  },

  async saveUiSettings() {
    await this.storageHandler.setLocal(UI_SETTINGS_KEY, this.state.uiSettings);
  },

  setActiveTab(tab, options = {}) {
    if (!MAIN_TABS.includes(tab)) {
      return;
    }
    this.state.activeTab = tab;
    if (options.persist !== false) {
      this.state.uiSettings.activeTab = tab;
      this.saveUiSettings();
    }
    this.els.appShell.classList.toggle('cookies-active', tab === 'cookies');
    this.els.tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });
    this.els.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.tab === tab);
    });
    if (tab === 'profiles') {
      this.renderProfiles();
    }
    if (tab === 'tools') {
      this.updateExportOutput();
      this.updateImportPreview();
    }
  },

  handleDragOver(event) {
    event.preventDefault();
    this.els.dropzone.classList.add('active');
  },

  handleDrop(event) {
    event.preventDefault();
    this.els.dropzone.classList.remove('active');
    const file = event.dataTransfer.files[0];
    if (!file) {
      return;
    }
    file.text().then(text => {
      this.els.importInput.value = text;
      this.updateImportPreview();
    });
  },

  updateCurrentSite() {
    this.els.currentSite.textContent = this.isGlobalCookieScope()
      ? 'Global scope - all domains'
      : this.getCurrentDomain() || this.getCurrentTabUrl();
  },
};
