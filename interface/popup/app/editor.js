export const editorMethods = {
  openCookieEditor(cookie = null) {
    this.state.currentEditorId = cookie ? this.getCookieId(cookie) : null;
    this.els.cookieForm.reset();
    this.els.cookieForm.elements.id.value = this.state.currentEditorId || '';
    this.els.sidepanelTitle.textContent = cookie
      ? 'Edit Cookie'
      : 'Create Cookie';
    this.els.sidepanelSubtitle.textContent = cookie
      ? [cookie.domain, cookie.path].filter(Boolean).join('  ')
      : this.getCurrentDomain() || 'Current tab';
    this.els.deleteCookie.hidden = !cookie;
    this.fillCookieForm(cookie);
    this.syncSessionField();
    this.syncHostOnlyField();
    this.openSidepanel();
  },

  fillCookieForm(cookie) {
    const form = this.els.cookieForm.elements;
    const fallbackDomain = this.getCurrentDomain();
    form.name.value = cookie?.name || '';
    form.value.value = cookie?.value || '';
    form.domain.value = cookie?.domain || fallbackDomain || '';
    form.path.value = cookie?.path || '/';
    form.expiration.value = this.formatDateTimeLocal(cookie?.expirationDate);
    form.sameSite.value =
      cookie?.sameSite === 'unspecified' ? '' : cookie?.sameSite || '';
    form.hostOnly.checked = Boolean(
      cookie?.hostOnly || (!cookie && fallbackDomain)
    );
    form.session.checked = Boolean(
      !cookie || cookie.session || !cookie.expirationDate
    );
    form.secure.checked = Boolean(cookie?.secure);
    form.httpOnly.checked = Boolean(cookie?.httpOnly);
  },

  syncSessionField() {
    const isSession = this.els.cookieForm.elements.session.checked;
    this.els.cookieForm.elements.expiration.disabled = isSession;
    if (isSession) {
      this.els.cookieForm.elements.expiration.value = '';
    }
  },

  syncHostOnlyField() {
    this.els.cookieForm.elements.domain.disabled =
      this.els.cookieForm.elements.hostOnly.checked;
  },

  saveCookieFromForm(event) {
    event.preventDefault();
    const originalCookie = this.state.currentEditorId
      ? this.getCookieById(this.state.currentEditorId)
      : null;
    const formCookie = this.getCookieFromForm(originalCookie);
    const save = () => this.persistCookieForm(formCookie, originalCookie);

    if (this.shouldRemoveBeforeSaving(originalCookie, formCookie)) {
      this.removeCookie(originalCookie).then(save);
      return;
    }
    save();
  },

  shouldRemoveBeforeSaving(originalCookie, formCookie) {
    return (
      originalCookie &&
      (originalCookie.name !== formCookie.name ||
        originalCookie.domain !== formCookie.domain ||
        originalCookie.path !== formCookie.path ||
        originalCookie.hostOnly !== formCookie.hostOnly)
    );
  },

  persistCookieForm(formCookie, originalCookie) {
    this.saveCookie(formCookie).then(error => {
      if (error) {
        this.showSnackbar(error);
        return;
      }
      this.closeCookieEditor();
      this.showSnackbar(originalCookie ? 'Cookie updated' : 'Cookie created');
      this.refreshCookies();
    });
  },

  getCookieFromForm(originalCookie = null) {
    const form = this.els.cookieForm.elements;
    const cookie = this.getBaseFormCookie(form, originalCookie);
    if (form.session.checked) {
      cookie.expirationDate = null;
      return cookie;
    }
    cookie.expirationDate = form.expiration.value
      ? new Date(form.expiration.value).getTime() / 1000
      : null;
    cookie.session = !cookie.expirationDate;
    return cookie;
  },

  getBaseFormCookie(form, originalCookie) {
    return {
      ...originalCookie,
      name: form.name.value.trim(),
      value: form.value.value,
      domain: form.hostOnly.checked ? '' : form.domain.value.trim(),
      path: form.path.value.trim() || '/',
      sameSite: form.sameSite.value || null,
      hostOnly: form.hostOnly.checked,
      session: form.session.checked,
      secure: form.secure.checked,
      httpOnly: form.httpOnly.checked,
    };
  },

  saveCookie(cookie) {
    return new Promise(resolve => {
      const url = this.getCookieAccessUrl(cookie);
      if (!url) {
        resolve('Cookie needs a domain or an HTTP(S) current tab');
        return;
      }
      this.cookieHandler.saveCookie(cookie, url, error => {
        resolve(error || null);
      });
    });
  },

  removeCookie(cookie) {
    return new Promise(resolve => {
      const url = this.getCookieAccessUrl(cookie);
      if (!url) {
        resolve();
        return;
      }
      this.cookieHandler.removeCookie(
        cookie.name,
        url,
        () => {
          resolve();
        },
        false,
        cookie.storeId
      );
    });
  },

  deleteCookieFromEditor() {
    const cookie = this.getCookieById(this.state.currentEditorId);
    if (!cookie) {
      return;
    }
    this.deleteCookiesWithUndo([cookie], 'Cookie deleted');
    this.closeCookieEditor();
  },

  deleteSelectedCookies() {
    const cookies = this.getSelectedCookies();
    if (!cookies.length) {
      return;
    }
    this.deleteCookiesWithUndo(
      cookies,
      `${cookies.length} cookie${cookies.length === 1 ? '' : 's'} deleted`
    );
  },

  async deleteAllCookies() {
    const cookies = this.getVisibleCookies();
    if (!cookies.length) {
      this.showSnackbar('There are no cookies to delete');
      return;
    }
    const scopeLabel = this.isGlobalCookieScope()
      ? 'the current global view'
      : 'the current tab';
    if (
      this.state.uiSettings.confirmDeleteAll &&
      !(await this.confirmDialog({
        title: 'Delete all cookies?',
        message: `This will delete ${cookies.length} cookie${
          cookies.length === 1 ? '' : 's'
        } for ${scopeLabel}.`,
        confirmLabel: 'Delete all',
        variant: 'danger',
      }))
    ) {
      return;
    }
    this.deleteCookiesWithUndo(cookies, 'All cookies deleted');
  },

  deleteCookiesWithUndo(cookies, message) {
    const snapshot = cookies.map(cookie =>
      this.normalizeCookieForStorage(cookie, { preserveStoreId: true })
    );
    Promise.all(cookies.map(cookie => this.removeCookie(cookie))).then(() => {
      snapshot.forEach(cookie =>
        this.state.selected.delete(this.getCookieId(cookie))
      );
      this.refreshCookies();
      this.showSnackbar(message, () => {
        Promise.all(snapshot.map(cookie => this.saveCookie(cookie))).then(
          () => {
            this.showSnackbar('Delete undone');
            this.refreshCookies();
          }
        );
      });
    });
  },

  getSelectedCookies() {
    return this.state.cookies.filter(cookie =>
      this.state.selected.has(this.getCookieId(cookie))
    );
  },
};
