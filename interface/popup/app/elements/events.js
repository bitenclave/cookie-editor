export const elementEventMethods = {
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
      this.queueRenderCookies();
    });
    this.els.cookieDomainFilter.addEventListener('input', event => {
      this.state.domainFilter = this.normalizeDomain(event.target.value.trim());
      this.queueRenderCookies();
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
    this.bindCookieScrollEvents();
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
      this.state.profilePage = 1;
      this.renderProfiles();
    });
    this.els.profileGroupFilter.addEventListener('change', event => {
      this.state.profileGroupFilter = event.target.value;
      this.state.profilePage = 1;
      this.renderProfiles();
    });
    this.els.profileSort.addEventListener('change', event => {
      this.state.profileSort = event.target.value;
      this.state.profilePage = 1;
      this.renderProfiles();
    });
    this.els.saveCurrentProfile.addEventListener('click', () =>
      this.saveCurrentCookiesProfile()
    );
    this.els.profilesList.addEventListener('click', event =>
      this.handleProfileAction(event)
    );
    this.els.profilePrevPage.addEventListener('click', () => {
      this.state.profilePage -= 1;
      this.renderProfiles();
    });
    this.els.profileNextPage.addEventListener('click', () => {
      this.state.profilePage += 1;
      this.renderProfiles();
    });
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
