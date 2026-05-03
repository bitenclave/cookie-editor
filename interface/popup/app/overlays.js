const OverlayTransitionMs = 180;

export const overlayMethods = {
  openSettingsPanel() {
    this.openOverlay('settings', () => this.els.themeSelect);
  },

  openSidepanel() {
    this.openOverlay('editor', () => this.els.cookieForm.elements.name);
  },

  closeSettingsPanel(options = {}) {
    this.closeOverlays(options);
  },

  closeCookieEditor(options = {}) {
    this.closeOverlays(options);
  },

  openOverlay(name, focusTarget) {
    this.cancelOverlayHide();
    const token = this.bumpOverlayToken();
    const overlays = this.getOverlays();

    Object.entries(overlays).forEach(([key, overlay]) => {
      overlay.panel.classList.remove('open');
      overlay.backdrop.classList.remove('visible');
      overlay.panel.setAttribute('aria-hidden', 'true');
      overlay.panel.hidden = key !== name;
      overlay.backdrop.hidden = key !== name;
    });

    const activeOverlay = overlays[name];
    this.state.activeOverlay = name;
    document.body.dataset.activeOverlay = name;
    activeOverlay.panel.hidden = false;
    activeOverlay.backdrop.hidden = false;

    requestAnimationFrame(() => {
      if (
        this.state.overlayToken !== token ||
        this.state.activeOverlay !== name
      ) {
        return;
      }
      activeOverlay.backdrop.classList.add('visible');
      activeOverlay.panel.classList.add('open');
      activeOverlay.panel.setAttribute('aria-hidden', 'false');
      focusTarget?.()?.focus();
    });
  },

  closeOverlays({ immediate = false } = {}) {
    this.cancelOverlayHide();
    const token = this.bumpOverlayToken();
    const overlays = this.getOverlays();

    this.state.activeOverlay = null;
    delete document.body.dataset.activeOverlay;

    Object.values(overlays).forEach(overlay => {
      overlay.backdrop.classList.remove('visible');
      overlay.panel.classList.remove('open');
      overlay.panel.setAttribute('aria-hidden', 'true');
    });

    const hideClosedOverlays = () => {
      if (this.state.overlayToken !== token || this.state.activeOverlay) {
        return;
      }
      Object.values(overlays).forEach(overlay => {
        overlay.panel.hidden = true;
        overlay.backdrop.hidden = true;
      });
      this.state.overlayHideTimer = null;
    };

    if (immediate) {
      hideClosedOverlays();
      return;
    }
    this.state.overlayHideTimer = setTimeout(
      hideClosedOverlays,
      OverlayTransitionMs
    );
  },

  getOverlays() {
    return {
      editor: {
        panel: this.els.sidepanel,
        backdrop: this.els.sidepanelBackdrop,
      },
      settings: {
        panel: this.els.settingsPanel,
        backdrop: this.els.settingsBackdrop,
      },
    };
  },

  cancelOverlayHide() {
    if (!this.state.overlayHideTimer) {
      return;
    }
    clearTimeout(this.state.overlayHideTimer);
    this.state.overlayHideTimer = null;
  },

  bumpOverlayToken() {
    this.state.overlayToken += 1;
    return this.state.overlayToken;
  },
};
