export const profileStorageSettingsMethods = {
  async loadProfileStorageSettings() {
    this.state.profileStorage = await this.profileStore.loadSettings();
    this.hydrateProfileStorageSettings();
  },

  hydrateProfileStorageSettings() {
    this.els.profileStorageMode.forEach(input => {
      input.checked = input.value === this.state.profileStorage.mode;
    });
    this.els.profileServerUrl.value = this.state.profileStorage.serverUrl;
    this.els.profileServerToken.value = this.state.profileStorage.token;
    this.renderProfileStorageMode();
    this.syncProfileStorageDisclosure();
  },

  renderProfileStorageMode() {
    const isCloud = this.state.profileStorage.mode === 'cloud';
    this.els.profileCloudSettings.hidden = !isCloud;
    this.els.profileCloudActions.forEach(action => {
      action.hidden = !isCloud;
    });
    this.els.profileStorageStatus.textContent = isCloud ? 'Cloud' : 'Local';
    this.els.profileStorageStatus.classList.toggle('cloud', isCloud);
  },

  syncProfileStorageDisclosure() {
    this.els.profileStorageDisclosure.open =
      !this.state.profileStorage.configured ||
      this.state.uiSettings.profileStorageOpen;
    this.updateProfileStorageDisclosureLabel();
  },

  async handleProfileStorageDisclosureToggle() {
    this.updateProfileStorageDisclosureLabel();
    this.state.uiSettings.profileStorageOpen =
      this.els.profileStorageDisclosure.open;
    await this.saveUiSettings();
  },

  updateProfileStorageDisclosureLabel() {
    this.els.profileStorageToggleLabel.textContent = this.els
      .profileStorageDisclosure.open
      ? 'Hide'
      : 'Show';
  },

  changeProfileStorageMode(mode) {
    this.state.profileStorage.mode = mode === 'cloud' ? 'cloud' : 'local';
    this.renderProfileStorageMode();
  },

  async saveProfileStorageSettings() {
    const settings = this.readProfileStorageSettings();
    try {
      if (settings.mode === 'cloud') {
        await this.ensureCloudProfileAccess(settings);
      }
      settings.configured = true;
      this.state.profileStorage =
        await this.profileStore.saveSettings(settings);
      await this.loadProfiles();
      this.renderProfileStorageMode();
      await this.setProfileStorageDisclosureOpen(false);
      this.showSnackbar('Profile storage saved');
    } catch (error) {
      this.showSnackbar(error.message || 'Profile storage failed');
    }
  },

  async testProfileStorageSettings() {
    const settings = this.readProfileStorageSettings();
    try {
      await this.ensureCloudProfileAccess(settings);
      this.showSnackbar('Cloud server connected');
    } catch (error) {
      this.showSnackbar(error.message || 'Cloud server failed');
    }
  },

  async refreshProfileStorage() {
    try {
      await this.loadProfiles();
      this.showSnackbar('Profiles refreshed');
    } catch (error) {
      this.showSnackbar(error.message || 'Refresh failed');
    }
  },

  async uploadLocalProfiles() {
    if (
      !(await this.confirmDialog({
        title: 'Replace cloud profiles?',
        message:
          'This will overwrite the cloud profile list with local profiles.',
        confirmLabel: 'Replace',
        variant: 'danger',
      }))
    ) {
      return;
    }
    try {
      const count = await this.profileStore.pushLocalProfiles(
        this.state.profileStorage
      );
      await this.loadProfiles();
      this.showSnackbar(
        `${count} local profile${count === 1 ? '' : 's'} uploaded`
      );
    } catch (error) {
      this.showSnackbar(error.message || 'Upload failed');
    }
  },

  readProfileStorageSettings() {
    return this.profileStore.normalizeSettings({
      ...this.state.profileStorage,
      mode: this.getSelectedProfileStorageMode(),
      serverUrl: this.els.profileServerUrl.value,
      token: this.els.profileServerToken.value,
    });
  },

  getSelectedProfileStorageMode() {
    return (
      [...this.els.profileStorageMode].find(input => input.checked)?.value ||
      'local'
    );
  },

  async setProfileStorageDisclosureOpen(isOpen) {
    this.els.profileStorageDisclosure.open = isOpen;
    this.state.uiSettings.profileStorageOpen = isOpen;
    this.updateProfileStorageDisclosureLabel();
    await this.saveUiSettings();
  },

  async ensureCloudProfileAccess(settings) {
    if (!settings.serverUrl || !settings.token) {
      throw new Error('Enter server URL and token');
    }
    if (!(await this.profileStore.ensureCloudPermission(settings.serverUrl))) {
      throw new Error('Server permission denied');
    }
    await this.profileStore.test(settings);
  },

  renderProfileGroupOptions() {
    const groups = this.getProfileGroups();
    const current = this.state.profileGroupFilter;
    this.els.profileGroupFilter.replaceChildren(new Option('All groups', ''));
    groups.forEach(group => {
      this.els.profileGroupFilter.appendChild(new Option(group, group));
    });
    this.state.profileGroupFilter = groups.includes(current) ? current : '';
    this.els.profileGroupFilter.value = this.state.profileGroupFilter;
  },

  getProfileGroups() {
    return [
      ...new Set(
        this.state.profiles.map(profile => this.getProfileGroup(profile))
      ),
    ].sort((a, b) => a.localeCompare(b));
  },
};
