import { COOKIE_RENDER_BATCH_SIZE } from './config.js';

export const cookieRenderingMethods = {
  renderCookies() {
    window.clearTimeout(this.cookieRenderTimer);
    const token = ++this.cookieRenderToken;
    this.renderCookiesAsync(token);
  },

  async renderCookiesAsync(token) {
    if (this.state.cookies.length > COOKIE_RENDER_BATCH_SIZE) {
      this.showCookieRenderStatus(
        'Preparing cookies...',
        'Filtering and sorting the visible list.'
      );
      await this.yieldToBrowser();
    }
    if (!this.isCurrentCookieRender(token)) {
      return;
    }

    const visibleCookies = await this.getVisibleCookiesAsync(token);
    if (!visibleCookies || !this.isCurrentCookieRender(token)) {
      return;
    }

    this.syncDomainFilterInput();
    this.els.cookieList.replaceChildren();
    this.els.cookieCount.textContent = this.getCookieCountLabel(
      visibleCookies.length
    );
    this.updateSelectAllLabel(visibleCookies);

    if (!visibleCookies.length) {
      await this.renderDomainFilterOptionsAsync(token);
      if (!this.isCurrentCookieRender(token)) {
        return;
      }
      this.renderEmptyCookieState();
      this.setCookieBusy(false);
      return;
    }

    this.setCookieBusy(false);
    this.beginCookieRowsRender(visibleCookies, token);
    await this.renderDomainFilterOptionsAsync(token);
    if (!this.isCurrentCookieRender(token)) {
      return;
    }
    this.updateBulkBar();
  },

  showCookieLoadingState(message) {
    ++this.cookieRenderToken;
    this.state.selected.clear();
    this.els.cookieCount.textContent = 'Loading cookies';
    this.updateSelectAllLabel([]);
    this.showCookieRenderStatus(
      message,
      'The list will update as soon as data is ready.'
    );
    this.updateBulkBar();
  },

  showCookieRenderStatus(message, detail = '') {
    this.setCookieBusy(true);
    this.els.cookieList.replaceChildren(
      this.createCookieStatusNode(message, detail)
    );
  },

  createCookieStatusNode(message, detail = '') {
    const status = document.createElement('div');
    status.className = 'cookie-list-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');

    const copy = document.createElement('span');
    copy.className = 'cookie-list-status-copy';
    const label = document.createElement('strong');
    const description = document.createElement('span');
    copy.append(label, description);
    status.append(spinner, copy);
    this.updateCookieStatusNode(status, message, detail);
    return status;
  },

  updateCookieStatusNode(status, message, detail = '') {
    status.querySelector('strong').textContent = message;
    status.querySelector('.cookie-list-status-copy span').textContent = detail;
  },

  setCookieBusy(isBusy) {
    this.els.appShell.classList.toggle('cookie-busy', isBusy);
    this.els.cookieList.setAttribute('aria-busy', String(isBusy));
    [this.els.exportAll, this.els.selectAll, this.els.deleteAll].forEach(
      button => {
        button.disabled = isBusy;
      }
    );
  },

  isCurrentCookieRender(token) {
    return token === this.cookieRenderToken;
  },

  yieldToBrowser() {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => resolve(), { timeout: 80 });
        return;
      }
      window.requestAnimationFrame(() => resolve());
    });
  },

  renderEmptyCookieState() {
    const empty = document
      .importNode(document.getElementById('tmp-empty-state').content, true)
      .querySelector('.empty-state');
    empty.querySelector('p').textContent = this.isGlobalCookieScope()
      ? 'No cookies match the current global view.'
      : 'This page does not have cookies matching the current view.';
    empty
      .querySelector('[data-action="create"]')
      .addEventListener('click', () => {
        this.openCookieEditor();
      });
    empty
      .querySelector('[data-action="import"]')
      .addEventListener('click', () => {
        this.setActiveTab('tools');
        this.els.importInput.focus();
      });
    this.els.cookieList.appendChild(empty);
    this.updateBulkBar();
  },
};
