export const profileStoreMethods = {
  async loadProfiles(options = {}) {
    try {
      const settings = await this.getProfileTransferSettings(options);
      this.applyLoadedProfiles(
        await this.profileStore.getProfiles(settings),
        options
      );
    } catch (error) {
      if (!options.silent) {
        this.state.profiles = [];
        this.renderProfiles();
        this.renderBulkProfileMenu();
        this.showSnackbar(error.message || 'Profiles failed to load');
      }
    }
  },

  applyLoadedProfiles(profiles, options = {}) {
    this.state.profiles = profiles
      .filter(profile => profile && profile.id)
      .map(profile => this.profileStore.normalizeProfile(profile))
      .sort(this.sortProfilesByUpdatedAt);
    if (!options.keepPage) {
      this.state.profilePage = 1;
    }
    this.renderProfiles();
    this.renderBulkProfileMenu();
  },

  async saveProfiles(profiles) {
    const settings = await this.getProfileTransferSettings();
    this.state.profiles = profiles
      .map(profile => this.profileStore.normalizeProfile(profile))
      .sort(this.sortProfilesByUpdatedAt);
    this.state.profiles = await this.profileStore.saveProfiles(
      settings,
      this.state.profiles
    );
    this.state.profiles.sort(this.sortProfilesByUpdatedAt);
    this.state.profilePage = 1;
    this.renderProfiles();
    this.renderBulkProfileMenu();
    await this.profileStore.notifyProfilesChanged(
      this.profileSyncSourceId,
      this.state.profileStorage.mode
    );
  },

  async getProfileTransferSettings(options = {}) {
    if (this.state.profileStorage.mode !== 'cloud') {
      return this.state.profileStorage;
    }
    if (options.silent) {
      return this.state.profileStorage;
    }
    const settings = await this.ensureCloudProfileTransferAllowed(
      this.state.profileStorage
    );
    this.state.profileStorage = await this.profileStore.saveSettings(settings);
    return this.state.profileStorage;
  },

  getVisibleProfiles() {
    let profiles = [...this.state.profiles];
    if (this.state.profileSearch) {
      profiles = profiles.filter(profile => this.profileMatchesSearch(profile));
    }
    if (this.state.profileGroupFilter) {
      profiles = profiles.filter(
        profile =>
          this.getProfileGroup(profile) === this.state.profileGroupFilter
      );
    }
    this.sortVisibleProfiles(profiles);
    return profiles;
  },

  sortVisibleProfiles(profiles) {
    if (this.state.profileSort === 'name') {
      profiles.sort((a, b) => a.name.localeCompare(b.name));
      return;
    }
    if (this.state.profileSort === 'group') {
      profiles.sort((a, b) =>
        this.getProfileGroup(a).localeCompare(this.getProfileGroup(b))
      );
      return;
    }
    if (this.state.profileSort === 'count') {
      profiles.sort(
        (a, b) =>
          this.getProfileCookies(b).length - this.getProfileCookies(a).length
      );
      return;
    }
    profiles.sort(this.sortProfilesByUpdatedAt);
  },

  async saveCurrentCookiesProfile() {
    const name = this.els.newProfileName.value.trim();
    if (!name) {
      this.showSnackbar('Enter a profile name');
      return;
    }
    if (!this.state.cookies.length) {
      this.showSnackbar('No cookies to save');
      return;
    }
    const group =
      this.els.newProfileGroup.value.trim() || this.getCurrentDomain();
    await this.upsertProfile(name, this.state.cookies, group);
    this.els.newProfileName.value = '';
    this.els.newProfileGroup.value = '';
  },

  async upsertProfile(name, cookies, groupName = 'Default') {
    const profiles = [...this.state.profiles];
    const existing = profiles.find(
      profile =>
        profile.name.toLowerCase() === name.toLowerCase() &&
        this.getProfileGroup(profile).toLowerCase() === groupName.toLowerCase()
    );
    if (existing) {
      await this.updateProfile(existing, name, groupName, cookies, profiles);
      return;
    }
    profiles.push(this.createProfile(name, groupName, cookies));
    await this.saveProfiles(profiles);
    this.showSnackbar(`Profile "${name}" saved`);
  },

  async updateProfile(existing, name, groupName, cookies, profiles) {
    const now = new Date().toISOString();
    existing.name = name;
    existing.groupName = groupName || 'Default';
    existing.cookies = cookies.map(cookie =>
      this.normalizeCookieForStorage(cookie)
    );
    existing.updatedAt = now;
    await this.saveProfiles(profiles);
    this.showSnackbar(`Profile "${name}" updated`);
  },

  createProfile(name, groupName, cookies) {
    const now = new Date().toISOString();
    return {
      id: this.createGuid(),
      name,
      groupName: groupName || 'Default',
      cookies: cookies.map(cookie => this.normalizeCookieForStorage(cookie)),
      createdAt: now,
      updatedAt: now,
    };
  },
};
