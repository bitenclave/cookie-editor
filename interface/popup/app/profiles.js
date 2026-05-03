export const profileMethods = {
  async loadProfiles() {
    try {
      this.state.profiles = (
        await this.profileStore.getProfiles(this.state.profileStorage)
      )
        .filter(profile => profile && profile.id)
        .sort(this.sortProfilesByUpdatedAt);
      this.renderProfiles();
    } catch (error) {
      this.state.profiles = [];
      this.showSnackbar(error.message || 'Profiles failed to load');
    }
  },

  async saveProfiles(profiles) {
    this.state.profiles = profiles.sort(this.sortProfilesByUpdatedAt);
    this.state.profiles = await this.profileStore.saveProfiles(
      this.state.profileStorage,
      this.state.profiles
    );
    this.state.profiles.sort(this.sortProfilesByUpdatedAt);
    this.renderProfiles();
    this.renderBulkProfileMenu();
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
    if (this.state.profileSort === 'name') {
      profiles.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.state.profileSort === 'group') {
      profiles.sort((a, b) =>
        this.getProfileGroup(a).localeCompare(this.getProfileGroup(b))
      );
    } else if (this.state.profileSort === 'count') {
      profiles.sort(
        (a, b) =>
          this.getProfileCookies(b).length - this.getProfileCookies(a).length
      );
    } else {
      profiles.sort(this.sortProfilesByUpdatedAt);
    }
    return profiles;
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
    existing.name = name;
    existing.groupName = groupName || 'Default';
    existing.cookies = cookies.map(cookie =>
      this.normalizeCookieForStorage(cookie)
    );
    existing.updatedAt = new Date().toISOString();
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

  async createProfileFromSelection() {
    const cookies = this.getSelectedCookies();
    if (!cookies.length) {
      this.showSnackbar('Select cookies first');
      return;
    }
    const defaultName = this.getDefaultProfileName(cookies);
    const name = await this.promptDialog({
      title: 'New profile',
      inputLabel: 'Profile name',
      defaultValue: defaultName,
      confirmLabel: 'Create',
    });
    if (!name || !name.trim()) {
      return;
    }
    const groupName = this.getDefaultProfileGroup(cookies);
    const profileName = this.getUniqueProfileName(name.trim(), groupName);
    await this.saveProfiles([
      ...this.state.profiles,
      this.createProfile(profileName, groupName, cookies),
    ]);
    this.showSnackbar(`Profile "${profileName}" saved`);
    this.closeBulkProfileMenu();
  },

  async updateProfileFromSelection(
    profileId = this.els.bulkProfileSelect.value
  ) {
    const profile = this.state.profiles.find(item => item.id === profileId);
    const cookies = this.getSelectedCookies();
    if (!cookies.length) {
      this.showSnackbar('Select cookies first');
      return;
    }
    if (!profile) {
      await this.createProfileFromSelection();
      return;
    }
    await this.mergeSelectedCookiesIntoProfile(profile, cookies);
    this.closeBulkProfileMenu();
  },

  async mergeSelectedCookiesIntoProfile(profile, cookies) {
    const profiles = [...this.state.profiles];
    const target = profiles.find(item => item.id === profile.id);
    if (!target) {
      return;
    }
    const mergedCookies = this.mergeProfileCookies(
      this.getProfileCookies(target),
      cookies
    );
    target.cookies = mergedCookies;
    target.updatedAt = new Date().toISOString();
    await this.saveProfiles(profiles);
    this.showSnackbar(`Profile "${target.name}" updated`);
  },

  mergeProfileCookies(existingCookies, incomingCookies) {
    const merged = new Map();
    existingCookies.forEach(cookie => {
      const normalized = this.normalizeCookieForStorage(cookie);
      merged.set(this.getCookieId(normalized), normalized);
    });
    incomingCookies.forEach(cookie => {
      const normalized = this.normalizeCookieForStorage(cookie);
      merged.set(this.getCookieId(normalized), normalized);
    });
    return [...merged.values()];
  },

  getDefaultProfileName(cookies) {
    const domain = this.getProfileNameDomain(cookies);
    if (!domain) {
      return 'Selected cookies';
    }
    return `${domain} cookies`;
  },

  getUniqueProfileName(name, groupName) {
    const existingNames = new Set(
      this.state.profiles
        .filter(
          profile =>
            this.getProfileGroup(profile).toLowerCase() ===
            groupName.toLowerCase()
        )
        .map(profile => profile.name.toLowerCase())
    );
    if (!existingNames.has(name.toLowerCase())) {
      return name;
    }
    let index = 2;
    while (existingNames.has(`${name} (${index})`.toLowerCase())) {
      index++;
    }
    return `${name} (${index})`;
  },

  getDefaultProfileGroup(cookies) {
    return (
      this.getProfileNameDomain(cookies) || this.getCurrentDomain() || 'Global'
    );
  },

  getProfileNameDomain(cookies) {
    const domains = [
      ...new Set(
        cookies
          .map(cookie => this.getBaseCookieDomain(cookie.domain))
          .filter(Boolean)
      ),
    ];
    if (domains.length === 1) {
      return domains[0];
    }
    if (this.state.domainFilter) {
      return this.state.domainFilter;
    }
    return this.isGlobalCookieScope() ? 'Global' : this.getCurrentDomain();
  },

  toggleBulkProfileMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    this.state.bulkProfileMenuOpen
      ? this.closeBulkProfileMenu()
      : this.openBulkProfileMenu();
  },

  openBulkProfileMenu() {
    this.renderBulkProfileMenu();
    this.state.bulkProfileMenuOpen = true;
    this.els.bulkProfileMenu.hidden = false;
    this.els.bulkProfile.setAttribute('aria-expanded', 'true');
  },

  closeBulkProfileMenu() {
    if (!this.els.bulkProfileMenu) {
      return;
    }
    this.state.bulkProfileMenuOpen = false;
    this.els.bulkProfileMenu.hidden = true;
    this.els.bulkProfile.setAttribute('aria-expanded', 'false');
  },

  renderBulkProfileMenu() {
    if (!this.els.bulkProfileSelect) {
      return;
    }
    const selectedValue = this.els.bulkProfileSelect.value;
    this.els.bulkProfileSelect.replaceChildren();
    if (!this.state.profiles.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No profiles yet';
      this.els.bulkProfileSelect.appendChild(option);
      return;
    }
    this.state.profiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = `${profile.name} - ${this.getProfileGroup(profile)}`;
      this.els.bulkProfileSelect.appendChild(option);
    });
    if (
      selectedValue &&
      this.state.profiles.some(profile => profile.id === selectedValue)
    ) {
      this.els.bulkProfileSelect.value = selectedValue;
    }
  },

  async handleBulkProfileAction(event) {
    const button = event.target.closest('[data-profile-action]');
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (button.dataset.profileAction === 'create') {
      await this.createProfileFromSelection();
      return;
    }
    if (button.dataset.profileAction === 'update') {
      await this.updateProfileFromSelection();
    }
  },

  async handleProfileAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }
    const profile = this.getProfileFromActionButton(button);
    if (!profile) {
      return;
    }
    await this.runProfileAction(profile, button);
  },

  getProfileFromActionButton(button) {
    const card = button.closest('.profile-card');
    return this.state.profiles.find(item => item.id === card.dataset.profileId);
  },

  async runProfileAction(profile, button) {
    switch (button.dataset.action) {
      case 'toggle':
        this.state.openProfileId =
          this.state.openProfileId === profile.id ? null : profile.id;
        this.renderProfiles();
        break;
      case 'apply':
        this.importCookies(this.getProfileCookies(profile));
        break;
      case 'update':
        await this.upsertProfile(
          profile.name,
          this.state.cookies,
          this.getProfileGroup(profile)
        );
        break;
      case 'rename':
        await this.renameProfile(profile);
        break;
      case 'group':
        await this.moveProfile(profile);
        break;
      case 'delete':
        await this.deleteProfile(profile);
        break;
      case 'download':
        this.downloadProfile(profile, button.dataset.format);
        break;
    }
  },

  async renameProfile(profile) {
    const name = await this.promptDialog({
      title: 'Rename profile',
      inputLabel: 'Profile name',
      defaultValue: profile.name,
      confirmLabel: 'Rename',
    });
    if (!name || !name.trim()) {
      return;
    }
    const profiles = this.state.profiles.map(item =>
      item.id === profile.id
        ? { ...item, name: name.trim(), updatedAt: new Date().toISOString() }
        : item
    );
    await this.saveProfiles(profiles);
    this.showSnackbar('Profile renamed');
  },

  async moveProfile(profile) {
    const groupName = await this.promptDialog({
      title: 'Move profile',
      inputLabel: 'Profile group',
      defaultValue: this.getProfileGroup(profile),
      confirmLabel: 'Move',
    });
    if (!groupName || !groupName.trim()) {
      return;
    }
    const profiles = this.state.profiles.map(item =>
      item.id === profile.id
        ? {
            ...item,
            groupName: groupName.trim(),
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    await this.saveProfiles(profiles);
    this.showSnackbar('Profile group updated');
  },

  async deleteProfile(profile) {
    const snapshot = {
      ...profile,
      cookies: [...this.getProfileCookies(profile)],
    };
    if (this.state.openProfileId === profile.id) {
      this.state.openProfileId = null;
    }
    await this.saveProfiles(
      this.state.profiles.filter(item => item.id !== profile.id)
    );
    this.showSnackbar(`Profile "${profile.name}" deleted`, async () => {
      await this.saveProfiles([...this.state.profiles, snapshot]);
      this.showSnackbar('Profile restored');
    });
  },

  getProfileCookies(profile) {
    return Array.isArray(profile.cookies) ? profile.cookies : [];
  },

  getProfileGroup(profile) {
    return profile.groupName || profile.group || 'Default';
  },

  profileMatchesSearch(profile) {
    const search = this.state.profileSearch;
    const cookieText = this.getProfileCookies(profile)
      .map(cookie =>
        [cookie.name, cookie.domain, cookie.path].filter(Boolean).join(' ')
      )
      .join(' ');
    return [profile.name, this.getProfileGroup(profile), cookieText]
      .join(' ')
      .toLowerCase()
      .includes(search);
  },
};
