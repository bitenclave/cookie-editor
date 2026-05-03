export const elementMethods = {
  cacheElements() {
    Object.assign(this.els, {
      appShell: document.querySelector('.app-shell'),
      currentSite: document.getElementById('current-site'),
      openOptions: document.getElementById('open-options'),
      cookieSearch: document.getElementById('cookie-search'),
      cookieDomainFilter: document.getElementById('cookie-domain-filter'),
      cookieDomainOptions: document.getElementById('cookie-domain-options'),
      clearDomainFilter: document.getElementById('clear-domain-filter'),
      cookieScope: document.querySelectorAll('input[name="cookie-scope"]'),
      addCookie: document.getElementById('add-cookie'),
      deleteAll: document.getElementById('delete-all'),
      filterChips: document.querySelector('.filter-chips'),
      permissionState: document.getElementById('permission-state'),
      cookieCount: document.getElementById('cookie-count'),
      exportAll: document.getElementById('export-all'),
      selectAll: document.getElementById('select-all'),
      cookieList: document.getElementById('cookie-list'),
      tabButtons: document.querySelectorAll('.tab-button'),
      tabPanels: document.querySelectorAll('.tab-panel'),
      bulkBar: document.getElementById('bulk-bar'),
      bulkCount: document.getElementById('bulk-count'),
      bulkProfile: document.getElementById('bulk-profile'),
      bulkProfileMenu: document.getElementById('bulk-profile-menu'),
      bulkProfileSelect: document.getElementById('bulk-profile-select'),
      bulkExport: document.getElementById('bulk-export'),
      bulkDelete: document.getElementById('bulk-delete'),
      bulkClear: document.getElementById('bulk-clear'),
      sidepanel: document.getElementById('cookie-sidepanel'),
      sidepanelBackdrop: document.getElementById('sidepanel-backdrop'),
      sidepanelTitle: document.getElementById('sidepanel-title'),
      sidepanelSubtitle: document.getElementById('sidepanel-subtitle'),
      settingsPanel: document.getElementById('settings-panel'),
      settingsBackdrop: document.getElementById('settings-backdrop'),
      closeSettings: document.getElementById('close-settings'),
      cookieForm: document.getElementById('cookie-form'),
      closeSidepanel: document.getElementById('close-sidepanel'),
      cancelCookie: document.getElementById('cancel-cookie'),
      deleteCookie: document.getElementById('delete-cookie'),
      profileSearch: document.getElementById('profile-search'),
      profileGroupFilter: document.getElementById('profile-group-filter'),
      profileSort: document.getElementById('profile-sort'),
      newProfileName: document.getElementById('new-profile-name'),
      newProfileGroup: document.getElementById('new-profile-group'),
      saveCurrentProfile: document.getElementById('save-current-profile'),
      profilesList: document.getElementById('profiles-list'),
      profileStorageDisclosure: document.getElementById(
        'profile-storage-section'
      ),
      profileStorageToggleLabel: document.getElementById(
        'profile-storage-toggle-label'
      ),
      profileStorageMode: document.querySelectorAll(
        'input[name="profile-storage-mode"]'
      ),
      profileCloudSettings: document.getElementById('profile-cloud-settings'),
      profileCloudActions: document.querySelectorAll('.profile-cloud-action'),
      profileServerUrl: document.getElementById('profile-server-url'),
      profileServerToken: document.getElementById('profile-server-token'),
      profileStorageStatus: document.getElementById('profile-storage-status'),
      saveProfileStorage: document.getElementById('save-profile-storage'),
      testProfileStorage: document.getElementById('test-profile-storage'),
      refreshProfileStorage: document.getElementById('refresh-profile-storage'),
      uploadLocalProfiles: document.getElementById('upload-local-profiles'),
      exportFormat: document.getElementById('export-format'),
      exportScope: document.getElementById('export-scope'),
      copyExport: document.getElementById('copy-export'),
      downloadExportButtons: document.querySelectorAll(
        '[data-download-export]'
      ),
      exportOutput: document.getElementById('export-output'),
      dropzone: document.getElementById('dropzone'),
      importInput: document.getElementById('import-input'),
      importDetected: document.getElementById('import-detected'),
      importPreviewCount: document.getElementById('import-preview-count'),
      importPreview: document.getElementById('import-preview'),
      runImport: document.getElementById('run-import'),
      themeSelect: document.getElementById('theme-select'),
      compactToggle: document.getElementById('compact-toggle'),
      confirmDeleteAll: document.getElementById('confirm-delete-all'),
      defaultExportAction: document.getElementById('default-export-action'),
      defaultExportFormat: document.getElementById('default-export-format'),
      dialogLayer: document.getElementById('app-dialog-layer'),
      dialogBackdrop: document.getElementById('app-dialog-backdrop'),
      dialog: document.getElementById('app-dialog'),
      dialogTitle: document.getElementById('app-dialog-title'),
      dialogMessage: document.getElementById('app-dialog-message'),
      dialogInputRow: document.getElementById('app-dialog-input-row'),
      dialogInputLabel: document.getElementById('app-dialog-input-label'),
      dialogInput: document.getElementById('app-dialog-input'),
      dialogForm: document.getElementById('app-dialog'),
      dialogCancel: document.getElementById('app-dialog-cancel'),
      dialogConfirm: document.getElementById('app-dialog-confirm'),
      snackbar: document.getElementById('snackbar'),
      snackbarMessage: document.getElementById('snackbar-message'),
      snackbarUndo: document.getElementById('snackbar-undo'),
      snackbarClose: document.getElementById('snackbar-close'),
    });
  },

  bindEvents() {
    this.els.openOptions.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.openSettingsPanel();
    });
    this.els.closeSettings.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlays();
    });
    this.els.settingsBackdrop.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlays();
    });
    this.bindCookieEvents();
    this.bindEditorEvents();
    this.bindProfileEvents();
    this.bindExportEvents();
    this.bindImportEvents();
    this.bindSettingsEvents();
    this.bindDialogEvents();
    this.els.snackbarClose.addEventListener('click', () => this.hideSnackbar());
  },

  bindCookieEvents() {
    this.els.cookieSearch.addEventListener('input', event => {
      this.state.search = event.target.value.trim().toLowerCase();
      this.renderCookies();
    });
    this.els.cookieDomainFilter.addEventListener('input', event => {
      this.state.domainFilter = this.normalizeDomain(event.target.value.trim());
      this.renderCookies();
    });
    this.els.clearDomainFilter.addEventListener('click', () => {
      this.state.domainFilter = '';
      this.renderCookies();
      this.els.cookieDomainFilter.focus();
    });
    this.els.cookieScope.forEach(input => {
      input.addEventListener('change', event =>
        this.changeCookieScope(event.target.value)
      );
    });
    this.els.addCookie.addEventListener('click', () => this.openCookieEditor());
    this.els.deleteAll.addEventListener('click', () => this.deleteAllCookies());
    this.els.exportAll.addEventListener('click', () => this.exportAllCookies());
    this.els.filterChips.addEventListener('click', event =>
      this.handleFilterClick(event)
    );
    this.els.selectAll.addEventListener('click', () => this.toggleSelectAll());
    this.els.cookieList.addEventListener('click', event =>
      this.handleCookieListClick(event)
    );
    this.els.cookieList.addEventListener('change', event =>
      this.handleCookieListChange(event)
    );
    this.els.bulkClear.addEventListener('click', () => this.clearSelection());
    this.els.bulkProfile.addEventListener('click', event =>
      this.toggleBulkProfileMenu(event)
    );
    this.els.bulkProfileMenu.addEventListener('click', event =>
      this.handleBulkProfileAction(event)
    );
    this.els.bulkDelete.addEventListener('click', () =>
      this.deleteSelectedCookies()
    );
    this.els.bulkExport.addEventListener('click', () =>
      this.exportSelectedCookies()
    );
    document.addEventListener('click', event => {
      if (!this.state.bulkProfileMenuOpen) {
        return;
      }
      if (event.target.closest('.bulk-profile-wrapper')) {
        return;
      }
      this.closeBulkProfileMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.closeBulkProfileMenu();
      }
    });
  },

  bindEditorEvents() {
    this.els.closeSidepanel.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlays();
    });
    this.els.cancelCookie.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlays();
    });
    this.els.sidepanelBackdrop.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlays();
    });
    this.els.cookieForm.addEventListener('submit', event =>
      this.saveCookieFromForm(event)
    );
    this.els.deleteCookie.addEventListener('click', () =>
      this.deleteCookieFromEditor()
    );
    this.els.cookieForm.elements.session.addEventListener('change', () =>
      this.syncSessionField()
    );
    this.els.cookieForm.elements.hostOnly.addEventListener('change', () =>
      this.syncHostOnlyField()
    );
  },

  bindProfileEvents() {
    this.els.profileSearch.addEventListener('input', event => {
      this.state.profileSearch = event.target.value.trim().toLowerCase();
      this.renderProfiles();
    });
    this.els.profileGroupFilter.addEventListener('change', event => {
      this.state.profileGroupFilter = event.target.value;
      this.renderProfiles();
    });
    this.els.profileSort.addEventListener('change', event => {
      this.state.profileSort = event.target.value;
      this.renderProfiles();
    });
    this.els.saveCurrentProfile.addEventListener('click', () =>
      this.saveCurrentCookiesProfile()
    );
    this.els.profilesList.addEventListener('click', event =>
      this.handleProfileAction(event)
    );
    this.els.profileStorageDisclosure.addEventListener('toggle', () =>
      this.handleProfileStorageDisclosureToggle()
    );
    this.els.profileStorageMode.forEach(input => {
      input.addEventListener('change', event =>
        this.changeProfileStorageMode(event.target.value)
      );
    });
    this.els.saveProfileStorage.addEventListener('click', () =>
      this.saveProfileStorageSettings()
    );
    this.els.testProfileStorage.addEventListener('click', () =>
      this.testProfileStorageSettings()
    );
    this.els.refreshProfileStorage.addEventListener('click', () =>
      this.refreshProfileStorage()
    );
    this.els.uploadLocalProfiles.addEventListener('click', () =>
      this.uploadLocalProfiles()
    );
  },

  bindExportEvents() {
    this.els.exportFormat.addEventListener('change', () =>
      this.updateExportOutput()
    );
    this.els.exportScope.addEventListener('change', () =>
      this.updateExportOutput()
    );
    this.els.copyExport.addEventListener('click', () =>
      this.copyExportOutput()
    );
    this.els.downloadExportButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.downloadExport(button.dataset.downloadExport);
      });
    });
  },

  bindImportEvents() {
    this.els.importInput.addEventListener('input', () =>
      this.updateImportPreview()
    );
    this.els.runImport.addEventListener('click', () =>
      this.importPreviewCookies()
    );
    this.els.dropzone.addEventListener('dragover', event =>
      this.handleDragOver(event)
    );
    this.els.dropzone.addEventListener('dragleave', () => {
      this.els.dropzone.classList.remove('active');
    });
    this.els.dropzone.addEventListener('drop', event => this.handleDrop(event));
  },

  bindSettingsEvents() {
    this.els.tabButtons.forEach(button => {
      button.addEventListener('click', () =>
        this.setActiveTab(button.dataset.tab)
      );
    });
    this.els.themeSelect.addEventListener('change', event => {
      this.optionHandler.setTheme(event.target.value);
      this.themeHandler.updateTheme();
    });
    this.els.compactToggle.addEventListener('change', event => {
      this.state.uiSettings.compactRows = event.target.checked;
      this.saveUiSettings();
      document.body.classList.toggle('compact', event.target.checked);
    });
    this.els.confirmDeleteAll.addEventListener('change', event => {
      this.state.uiSettings.confirmDeleteAll = event.target.checked;
      this.saveUiSettings();
    });
    this.els.defaultExportFormat.addEventListener('change', event => {
      this.optionHandler.setExportFormat(event.target.value);
      this.syncExportFormatSelect();
      this.updateExportOutput();
    });
    this.els.defaultExportAction.addEventListener('change', event => {
      this.optionHandler.setExportAction(event.target.value);
    });
  },
};
