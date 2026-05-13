export const profileRenderMethods = {
  renderProfiles() {
    this.els.profilesList.replaceChildren();
    this.renderProfileGroupOptions();
    const profiles = this.getVisibleProfiles();
    this.syncProfilePage(profiles.length);
    this.renderProfilePagination(profiles.length);
    if (!profiles.length) {
      this.els.profilesList.appendChild(this.createProfileEmptyState());
      return;
    }
    this.els.profilesList.appendChild(this.createProfilesFragment(profiles));
  },

  createProfilesFragment(profiles) {
    const pageProfiles = this.getProfilePageItems(profiles);
    const fragment = document.createDocumentFragment();
    if (this.shouldRenderProfileGroups()) {
      this.appendProfileGroups(pageProfiles, fragment);
      return fragment;
    }
    for (const profile of pageProfiles) {
      fragment.appendChild(this.createProfileCard(profile));
    }
    return fragment;
  },

  shouldRenderProfileGroups() {
    return this.state.profileSort === 'group' || this.state.profileGroupFilter;
  },

  appendProfileGroups(profiles, target = this.els.profilesList) {
    this.groupProfiles(profiles).forEach(group => {
      target.appendChild(
        this.createProfileGroupHeader(group.name, group.profiles)
      );
      group.profiles.forEach(profile => {
        target.appendChild(this.createProfileCard(profile));
      });
    });
  },

  createProfileEmptyState() {
    const empty = document.importNode(
      document.getElementById('tmp-profile-empty').content,
      true
    );
    if (this.state.profiles.length) {
      empty.querySelector('h2').textContent = 'No matching profiles';
      empty.querySelector('p').textContent = 'Adjust search or filters.';
    }
    return empty;
  },

  syncProfilePage(totalProfiles) {
    const maxPage = Math.max(
      1,
      Math.ceil(totalProfiles / this.state.profilePageSize)
    );
    this.state.profilePage = Math.min(
      Math.max(1, this.state.profilePage),
      maxPage
    );
  },

  getProfilePageItems(profiles) {
    const start = (this.state.profilePage - 1) * this.state.profilePageSize;
    return profiles.slice(start, start + this.state.profilePageSize);
  },

  renderProfilePagination(totalProfiles) {
    if (!this.els.profilePagination) {
      return;
    }
    const totalPages = Math.max(
      1,
      Math.ceil(totalProfiles / this.state.profilePageSize)
    );
    const start =
      totalProfiles === 0
        ? 0
        : (this.state.profilePage - 1) * this.state.profilePageSize + 1;
    const end = Math.min(
      totalProfiles,
      this.state.profilePage * this.state.profilePageSize
    );
    this.els.profilePagination.hidden =
      totalProfiles <= this.state.profilePageSize;
    this.els.profilePaginationStatus.textContent =
      totalProfiles > this.state.profilePageSize
        ? `${start}-${end} of ${totalProfiles}`
        : `${totalProfiles} profile${totalProfiles === 1 ? '' : 's'}`;
    this.els.profilePrevPage.disabled = this.state.profilePage <= 1;
    this.els.profileNextPage.disabled = this.state.profilePage >= totalPages;
  },

  groupProfiles(profiles) {
    const groups = new Map();
    profiles.forEach(profile => {
      const name = this.getProfileGroup(profile);
      groups.set(name, [...(groups.get(name) || []), profile]);
    });
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, groupProfiles]) => ({ name, profiles: groupProfiles }));
  },

  createProfileGroupHeader(groupName, profiles) {
    const header = document.createElement('div');
    header.className = 'profile-group-header';
    const count = profiles.reduce(
      (sum, profile) => sum + this.getProfileCookies(profile).length,
      0
    );
    header.append(this.createIcon('folder-open'));
    const title = document.createElement('span');
    title.textContent = groupName;
    const meta = document.createElement('span');
    meta.textContent = `${profiles.length} profile${profiles.length === 1 ? '' : 's'} - ${count} cookies`;
    header.append(title, meta);
    return header;
  },
};
