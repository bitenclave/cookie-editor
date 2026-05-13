import {
  COOKIE_INITIAL_RENDER_COUNT,
  COOKIE_RENDER_BATCH_SIZE,
  COOKIE_SCROLL_THRESHOLD_PX,
} from './config.js';

export const cookieIncrementalRenderingMethods = {
  beginCookieRowsRender(visibleCookies, token) {
    this.cookieRenderWindow = {
      cookies: visibleCookies,
      renderedCount: 0,
      token,
    };
    this.appendNextCookieRows(COOKIE_INITIAL_RENDER_COUNT);
    this.syncCookieRenderMoreStatus();
  },

  appendNextCookieRows(limit = COOKIE_RENDER_BATCH_SIZE) {
    const windowState = this.cookieRenderWindow;
    if (!windowState || !this.isCurrentCookieRender(windowState.token)) {
      return;
    }
    const nextCount = Math.min(
      windowState.renderedCount + limit,
      windowState.cookies.length
    );
    const fragment = document.createDocumentFragment();
    for (let index = windowState.renderedCount; index < nextCount; index += 1) {
      fragment.appendChild(this.createCookieRow(windowState.cookies[index]));
    }
    this.cookieRenderMoreStatus?.remove();
    this.els.cookieList.appendChild(fragment);
    windowState.renderedCount = nextCount;
  },

  syncCookieRenderMoreStatus() {
    const windowState = this.cookieRenderWindow;
    if (!windowState) {
      return;
    }
    this.cookieRenderMoreStatus?.remove();
    this.cookieRenderMoreStatus = null;
    if (windowState.renderedCount >= windowState.cookies.length) {
      return;
    }
    this.cookieRenderMoreStatus = this.createCookieMoreStatusNode(windowState);
    this.els.cookieList.appendChild(this.cookieRenderMoreStatus);
  },

  createCookieMoreStatusNode(windowState) {
    const status = document.createElement('button');
    status.type = 'button';
    status.className = 'cookie-list-more';
    status.textContent = `Showing ${windowState.renderedCount} of ${windowState.cookies.length}. Load more`;
    status.addEventListener('click', () => {
      this.appendNextCookieRows();
      this.syncCookieRenderMoreStatus();
    });
    return status;
  },

  bindCookieScrollEvents() {
    const scrollContainer = this.getCookieScrollContainer();
    scrollContainer?.addEventListener('scroll', () =>
      this.renderMoreCookiesNearViewport()
    );
  },

  getCookieScrollContainer() {
    return this.els.cookieList.closest('.tab-panel');
  },

  renderMoreCookiesNearViewport() {
    const scrollContainer = this.getCookieScrollContainer();
    if (!this.shouldAppendMoreCookieRows(scrollContainer)) {
      return;
    }
    this.appendNextCookieRows();
    this.syncCookieRenderMoreStatus();
  },

  shouldAppendMoreCookieRows(scrollContainer) {
    const windowState = this.cookieRenderWindow;
    if (!scrollContainer || !windowState) {
      return false;
    }
    if (windowState.renderedCount >= windowState.cookies.length) {
      return false;
    }
    return (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
      scrollContainer.scrollHeight - COOKIE_SCROLL_THRESHOLD_PX
    );
  },
};
