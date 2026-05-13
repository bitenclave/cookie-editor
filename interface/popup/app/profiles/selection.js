export const profileSelectionMethods = {
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
    target.cookies = this.mergeProfileCookies(
      this.getProfileCookies(target),
      cookies
    );
    target.updatedAt = new Date().toISOString();
    await this.saveProfiles(profiles);
    this.showSnackbar(`Profile "${target.name}" updated`);
  },

  mergeProfileCookies(existingCookies, incomingCookies) {
    const merged = new Map();
    [...existingCookies, ...incomingCookies].forEach(cookie => {
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
};
