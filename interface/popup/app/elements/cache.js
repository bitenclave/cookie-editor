const ID_ELEMENTS = {
  addCookie: 'add-cookie',
  bulkBar: 'bulk-bar',
  bulkClear: 'bulk-clear',
  bulkCount: 'bulk-count',
  bulkDelete: 'bulk-delete',
  bulkExport: 'bulk-export',
  bulkProfile: 'bulk-profile',
  bulkProfileMenu: 'bulk-profile-menu',
  bulkProfileSelect: 'bulk-profile-select',
  cancelCookie: 'cancel-cookie',
  clearDomainFilter: 'clear-domain-filter',
  closeSettings: 'close-settings',
  closeSidepanel: 'close-sidepanel',
  compactToggle: 'compact-toggle',
  confirmDeleteAll: 'confirm-delete-all',
  cookieCount: 'cookie-count',
  cookieDomainFilter: 'cookie-domain-filter',
  cookieDomainOptions: 'cookie-domain-options',
  cookieForm: 'cookie-form',
  cookieList: 'cookie-list',
  cookieSearch: 'cookie-search',
  copyExport: 'copy-export',
  currentSite: 'current-site',
  defaultExportAction: 'default-export-action',
  defaultExportFormat: 'default-export-format',
  deleteAll: 'delete-all',
  deleteCookie: 'delete-cookie',
  dialog: 'app-dialog',
  dialogBackdrop: 'app-dialog-backdrop',
  dialogCancel: 'app-dialog-cancel',
  dialogConfirm: 'app-dialog-confirm',
  dialogForm: 'app-dialog',
  dialogInput: 'app-dialog-input',
  dialogInputLabel: 'app-dialog-input-label',
  dialogInputRow: 'app-dialog-input-row',
  dialogLayer: 'app-dialog-layer',
  dialogMessage: 'app-dialog-message',
  dialogTitle: 'app-dialog-title',
  dropzone: 'dropzone',
  exportAll: 'export-all',
  exportFormat: 'export-format',
  exportOutput: 'export-output',
  exportScope: 'export-scope',
  importDetected: 'import-detected',
  importInput: 'import-input',
  importPreview: 'import-preview',
  importPreviewCount: 'import-preview-count',
  newProfileGroup: 'new-profile-group',
  newProfileName: 'new-profile-name',
  openOptions: 'open-options',
  permissionState: 'permission-state',
  profileCloudSettings: 'profile-cloud-settings',
  profileGroupFilter: 'profile-group-filter',
  profileNextPage: 'profile-next-page',
  profilePagination: 'profile-pagination',
  profilePaginationStatus: 'profile-pagination-status',
  profilePrevPage: 'profile-prev-page',
  profileSearch: 'profile-search',
  profileServerToken: 'profile-server-token',
  profileServerUrl: 'profile-server-url',
  profileSort: 'profile-sort',
  profileStorageDisclosure: 'profile-storage-section',
  profileStorageStatus: 'profile-storage-status',
  profileStorageToggleLabel: 'profile-storage-toggle-label',
  profilesList: 'profiles-list',
  refreshProfileStorage: 'refresh-profile-storage',
  runImport: 'run-import',
  saveCurrentProfile: 'save-current-profile',
  saveProfileStorage: 'save-profile-storage',
  selectAll: 'select-all',
  settingsBackdrop: 'settings-backdrop',
  settingsPanel: 'settings-panel',
  sidepanel: 'cookie-sidepanel',
  sidepanelBackdrop: 'sidepanel-backdrop',
  sidepanelSubtitle: 'sidepanel-subtitle',
  sidepanelTitle: 'sidepanel-title',
  snackbar: 'snackbar',
  snackbarClose: 'snackbar-close',
  snackbarMessage: 'snackbar-message',
  snackbarUndo: 'snackbar-undo',
  testProfileStorage: 'test-profile-storage',
  themeSelect: 'theme-select',
  uploadLocalProfiles: 'upload-local-profiles',
};

const QUERY_ELEMENTS = {
  appShell: '.app-shell',
  filterChips: '.filter-chips',
};

const QUERY_ALL_ELEMENTS = {
  cookieScope: 'input[name="cookie-scope"]',
  downloadExportButtons: '[data-download-export]',
  profileCloudActions: '.profile-cloud-action',
  profileStorageMode: 'input[name="profile-storage-mode"]',
  tabButtons: '.tab-button',
  tabPanels: '.tab-panel',
};

function collectElements(selectors, finder) {
  return Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => [key, finder(selector)])
  );
}

export const elementCacheMethods = {
  cacheElements() {
    Object.assign(
      this.els,
      collectElements(ID_ELEMENTS, id => document.getElementById(id)),
      collectElements(QUERY_ELEMENTS, selector =>
        document.querySelector(selector)
      ),
      collectElements(QUERY_ALL_ELEMENTS, selector =>
        document.querySelectorAll(selector)
      )
    );
  },
};
