export const profileBulkMethods = {
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
      this.appendBulkProfileOption('', 'No profiles yet');
      return;
    }
    this.state.profiles.forEach(profile => {
      this.appendBulkProfileOption(
        profile.id,
        `${profile.name} - ${this.getProfileGroup(profile)}`
      );
    });
    if (
      selectedValue &&
      this.state.profiles.some(profile => profile.id === selectedValue)
    ) {
      this.els.bulkProfileSelect.value = selectedValue;
    }
  },

  appendBulkProfileOption(value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    this.els.bulkProfileSelect.appendChild(option);
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
};
