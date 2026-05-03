import { ExportFormats } from '../../lib/options/exportFormats.js';

export const profileRenderingMethods = {
  renderProfiles() {
    this.els.profilesList.replaceChildren();
    this.renderProfileGroupOptions();
    const profiles = this.getVisibleProfiles();
    if (!profiles.length) {
      const empty = document.importNode(
        document.getElementById('tmp-profile-empty').content,
        true
      );
      this.els.profilesList.appendChild(empty);
      return;
    }
    if (this.shouldRenderProfileGroups()) {
      this.appendProfileGroups(profiles);
      return;
    }
    for (const profile of profiles) {
      this.els.profilesList.appendChild(this.createProfileCard(profile));
    }
  },

  shouldRenderProfileGroups() {
    return this.state.profileSort === 'group' || this.state.profileGroupFilter;
  },

  appendProfileGroups(profiles) {
    this.groupProfiles(profiles).forEach(group => {
      this.els.profilesList.appendChild(
        this.createProfileGroupHeader(group.name, group.profiles)
      );
      group.profiles.forEach(profile => {
        this.els.profilesList.appendChild(this.createProfileCard(profile));
      });
    });
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

  createProfileCard(profile) {
    const card = document.createElement('article');
    card.className = 'profile-card';
    card.dataset.profileId = profile.id;
    card.append(
      this.createProfileCardHeader(profile),
      this.createProfileActions(profile)
    );
    if (this.state.openProfileId === profile.id) {
      card.appendChild(this.createProfileDetails(profile));
    }
    return card;
  },

  createProfileCardHeader(profile) {
    const cookies = this.getProfileCookies(profile);
    const header = document.createElement('div');
    header.className = 'profile-card-header';

    const title = document.createElement('div');
    title.className = 'profile-title';
    const name = document.createElement('div');
    name.className = 'profile-name';
    name.textContent = profile.name;
    const domain = document.createElement('span');
    domain.className = 'profile-domain';
    domain.textContent = this.getProfileDomainSummary(profile);
    const group = document.createElement('span');
    group.className = 'profile-group-chip';
    group.textContent = this.getProfileGroup(profile);
    title.append(name, group, domain);

    const meta = document.createElement('span');
    meta.className = 'profile-meta';
    meta.textContent = `${cookies.length} cookie${cookies.length === 1 ? '' : 's'}`;
    header.append(title, meta);
    return header;
  },

  createProfileActions(profile) {
    const isOpen = this.state.openProfileId === profile.id;
    const actions = document.createElement('div');
    actions.className = 'profile-actions';
    actions.append(
      this.createProfileButton(
        isOpen ? 'Hide' : 'View',
        'toggle',
        '',
        isOpen ? 'eye-slash' : 'eye'
      ),
      this.createProfileButton('Apply', 'apply', 'primary', 'check'),
      this.createProfileButton('Update', 'update', '', 'sync-alt'),
      this.createProfileButton('Rename', 'rename', '', 'pen'),
      this.createProfileButton('Group', 'group', '', 'folder'),
      this.createProfileButton('Delete', 'delete', 'danger', 'trash')
    );
    return actions;
  },

  createProfileDetails(profile) {
    const details = document.createElement('div');
    details.className = 'profile-details';

    const summary = document.createElement('div');
    summary.className = 'profile-summary';
    summary.textContent = `Updated ${this.formatProfileDate(profile.updatedAt)}`;

    const list = document.createElement('div');
    list.className = 'profile-cookie-list';
    this.getProfileCookies(profile).forEach(cookie => {
      list.appendChild(this.createProfileCookieRow(cookie));
    });

    const downloads = document.createElement('div');
    downloads.className = 'profile-downloads';
    downloads.append(
      this.createProfileDownloadButton('JSON', ExportFormats.JSON),
      this.createProfileDownloadButton('Netscape .txt', ExportFormats.Netscape),
      this.createProfileDownloadButton(
        'Headers .txt',
        ExportFormats.HeaderString
      )
    );
    details.append(summary, list, downloads);
    return details;
  },

  createProfileCookieRow(cookie) {
    const row = document.createElement('div');
    row.className = 'profile-cookie-row';

    const main = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'profile-cookie-name';
    name.textContent = cookie.name || '(unnamed)';
    const value = document.createElement('div');
    value.className = 'profile-cookie-value';
    value.textContent = cookie.value || '(empty value)';
    main.append(name, value);

    const domain = document.createElement('div');
    domain.className = 'profile-cookie-domain';
    domain.textContent = [cookie.domain, cookie.path].filter(Boolean).join(' ');
    row.append(main, domain);
    return row;
  },

  createProfileDownloadButton(label, format) {
    const button = this.createProfileButton(label, 'download', '', 'download');
    button.dataset.format = format;
    return button;
  },

  createProfileButton(label, action, variant = '', icon = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `button ${variant}`.trim();
    button.dataset.action = action;
    if (icon) {
      button.appendChild(this.createIcon(icon));
    }
    const text = document.createElement('span');
    text.textContent = label;
    button.appendChild(text);
    return button;
  },

  getProfileDomainSummary(profile) {
    const domains = [
      ...new Set(
        this.getProfileCookies(profile)
          .map(cookie => this.normalizeDomain(cookie.domain))
          .filter(Boolean)
      ),
    ];
    if (!domains.length) {
      return 'No domain saved';
    }
    if (domains.length <= 2) {
      return domains.join(', ');
    }
    return `${domains[0]}, ${domains[1]} +${domains.length - 2} more`;
  },

  formatProfileDate(value) {
    if (!value) {
      return 'unknown';
    }
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};
