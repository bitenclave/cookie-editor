export const profileActionMethods = {
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
        this.toggleProfileDetails(profile);
        break;
      case 'apply':
        if (await this.importCookies(this.getProfileCookies(profile))) {
          await this.touchProfile(profile);
        }
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

  toggleProfileDetails(profile) {
    this.state.openProfileId =
      this.state.openProfileId === profile.id ? null : profile.id;
    this.renderProfiles();
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
    await this.updateProfileFields(
      profile.id,
      item => ({ ...item, name: name.trim() }),
      'Profile renamed'
    );
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
    await this.updateProfileFields(
      profile.id,
      item => ({ ...item, groupName: groupName.trim() }),
      'Profile group updated'
    );
  },

  async updateProfileFields(profileId, updater, message) {
    const updatedAt = new Date().toISOString();
    const profiles = this.state.profiles.map(item =>
      item.id === profileId ? { ...updater(item), updatedAt } : item
    );
    await this.saveProfiles(profiles);
    this.showSnackbar(message);
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
      await this.saveProfiles([
        ...this.state.profiles,
        { ...snapshot, updatedAt: new Date().toISOString() },
      ]);
      this.showSnackbar('Profile restored');
    });
  },

  async touchProfile(profile) {
    const updatedAt = new Date().toISOString();
    await this.saveProfiles(
      this.state.profiles.map(item =>
        item.id === profile.id ? { ...item, updatedAt } : item
      )
    );
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
