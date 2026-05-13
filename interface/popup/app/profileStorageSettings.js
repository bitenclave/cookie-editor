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
    let settings = this.readProfileStorageSettings();
    try {
      if (settings.mode === 'cloud') {
        settings = await this.ensureCloudProfileAccess(settings);
      }
      settings.configured = true;
      this.state.profileStorage =
        await this.profileStore.saveSettings(settings);
      await this.loadProfiles();
      this.renderProfileStorageMode();
      this.startProfileAutoRefresh();
      await this.setProfileStorageDisclosureOpen(false);
      this.showSnackbar('Profile storage saved');
    } catch (error) {
      this.showSnackbar(error.message || 'Profile storage failed');
    }
  },

  async testProfileStorageSettings() {
    let settings = this.readProfileStorageSettings();
    try {
      settings = await this.ensureCloudProfileAccess(settings);
      this.state.profileStorage = {
        ...this.state.profileStorage,
        ...settings,
      };
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
      const settings = await this.ensureCloudProfileTransferAllowed(
        this.state.profileStorage
      );
      this.state.profileStorage =
        await this.profileStore.saveSettings(settings);
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
    settings = await this.ensureCloudProfileTransferAllowed(settings);
    await this.profileStore.test(settings);
    return settings;
  },

  async ensureCloudProfileTransferAllowed(settings) {
    if (!settings.serverUrl || !settings.token) {
      throw new Error('Enter server URL and token');
    }
    settings = await this.confirmInsecureProfileServer(settings);
    if (!(await this.profileStore.ensureCloudPermission(settings.serverUrl))) {
      throw new Error('Server permission denied');
    }
    return settings;
  },

  async confirmInsecureProfileServer(settings) {
    if (
      !this.profileStore.isInsecureRemoteServer(settings.serverUrl) ||
      settings.acceptedInsecureHttpWarning
    ) {
      return settings;
    }

    const accepted = await this.confirmDialog({
      title: 'Use unencrypted HTTP?',
      message:
        'Cloud Sync over HTTP can expose profile data and auth proofs on the network unless the server is localhost. Continue with HTTP?',
      confirmLabel: 'Use HTTP',
      cancelLabel: 'Switch to HTTPS',
      variant: 'danger',
    });

    const updatedSettings = this.profileStore.normalizeSettings({
      ...settings,
      acceptedInsecureHttpWarning: accepted,
      serverUrl: accepted
        ? settings.serverUrl
        : this.profileStore.upgradeToHttps(settings.serverUrl),
    });

    this.els.profileServerUrl.value = updatedSettings.serverUrl;
    this.state.profileStorage = {
      ...this.state.profileStorage,
      ...updatedSettings,
    };

    if (!accepted) {
      this.showSnackbar('Server URL changed to HTTPS');
    }

    return updatedSettings;
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
