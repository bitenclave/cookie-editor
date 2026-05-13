export const cookieRowMethods = {
  createCookieRow(cookie) {
    const id = this.getCookieId(cookie);
    const row = document.createElement('article');
    row.className = 'cookie-row';
    row.dataset.id = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'cookie-select';
    checkbox.checked = this.state.selected.has(id);
    checkbox.setAttribute('aria-label', `Select ${cookie.name}`);
    row.appendChild(checkbox);

    row.appendChild(this.createCookieMainButton(cookie));
    return row;
  },

  createCookieMainButton(cookie) {
    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'cookie-main text-button';
    main.dataset.action = 'edit';

    const nameLine = document.createElement('div');
    nameLine.className = 'cookie-name-line';
    const name = document.createElement('span');
    name.className = 'cookie-name';
    name.textContent = cookie.name || '(unnamed)';
    nameLine.append(name, this.createBadges(cookie));

    const value = document.createElement('div');
    value.className = 'cookie-value';
    value.textContent = cookie.value || '(empty value)';

    const meta = document.createElement('div');
    meta.className = 'cookie-meta';
    meta.textContent = [cookie.domain, cookie.path].filter(Boolean).join('  ');
    main.append(nameLine, value, meta);
    return main;
  },

  createBadges(cookie) {
    const badges = document.createElement('div');
    badges.className = 'badge-row';
    const badgeMap = [
      ['secure', cookie.secure, 'shield-alt', 'Secure'],
      ['httpOnly', cookie.httpOnly, 'lock', 'HttpOnly'],
      ['session', cookie.session || !cookie.expirationDate, 'clock', 'Session'],
      ['hostOnly', cookie.hostOnly, 'unlink', 'HostOnly'],
      [
        'sameSite',
        cookie.sameSite,
        'fingerprint',
        `SameSite ${cookie.sameSite}`,
      ],
    ];
    for (const [className, enabled, icon, title] of badgeMap) {
      if (enabled) {
        badges.appendChild(this.createBadge(className, icon, title));
      }
    }
    return badges;
  },

  createBadge(className, icon, title) {
    const badge = document.createElement('span');
    badge.className = `badge ${className}`;
    badge.title = title;
    badge.appendChild(this.createIcon(icon));
    return badge;
  },
};
