export const permissionMethods = {
  showPermissionPrompt(permissionTarget = this.getCurrentTabUrl()) {
    const isGlobal = permissionTarget === '<all_urls>';
    const notice = document.createElement('div');
    notice.className = 'notice';
    const message = document.createElement('p');
    message.textContent = `Cookie-Editor needs permission to read cookies for ${
      isGlobal ? 'all sites' : 'this page'
    }.`;
    notice.appendChild(message);
    const row = document.createElement('div');
    row.className = 'button-row';
    if (!isGlobal) {
      row.append(
        this.createPermissionButton('This site', this.getCurrentTabUrl(), true)
      );
    }
    row.append(
      this.createPermissionButton('All sites', '<all_urls>', isGlobal)
    );
    notice.appendChild(row);
    this.els.permissionState.replaceChildren(notice);
  },

  createPermissionButton(label, permissionTarget, isPrimary = false) {
    const button = document.createElement('button');
    button.className = isPrimary ? 'button primary' : 'button';
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', async () => {
      if (await this.permissionHandler.requestPermission(permissionTarget)) {
        this.refreshCookies();
      }
    });
    return button;
  },

  showPermissionImpossible() {
    const notice = document.createElement('div');
    notice.className = 'notice';
    notice.textContent = "Cookie-Editor can't display cookies for this page.";
    this.els.permissionState.replaceChildren(notice);
  },

  showSnackbar(message, undoCallback = null) {
    window.clearTimeout(this.showSnackbarTimeout);
    this.els.snackbarMessage.textContent = message;
    this.els.snackbar.classList.toggle('has-undo', Boolean(undoCallback));
    this.els.snackbarUndo.onclick = undoCallback
      ? () => {
          this.hideSnackbar();
          undoCallback();
        }
      : null;
    this.els.snackbar.classList.add('visible');
    this.showSnackbarTimeout = window.setTimeout(
      () => this.hideSnackbar(),
      4200
    );
  },

  hideSnackbar() {
    window.clearTimeout(this.showSnackbarTimeout);
    this.els.snackbar.classList.remove('visible');
  },
};
