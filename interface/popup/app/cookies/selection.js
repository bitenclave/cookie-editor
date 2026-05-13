export const cookieSelectionMethods = {
  updateSelectAllLabel(visibleCookies) {
    const allSelected =
      visibleCookies.length &&
      visibleCookies.every(cookie =>
        this.state.selected.has(this.getCookieId(cookie))
      );
    this.els.selectAll.textContent = allSelected ? 'Clear all' : 'Select all';
  },

  handleFilterClick(event) {
    const button = event.target.closest('.chip');
    if (!button) {
      return;
    }
    const filter = button.dataset.filter;
    const isActive = this.state.filters.has(filter);
    this.state.filters[isActive ? 'delete' : 'add'](filter);
    button.classList.toggle('active', !isActive);
    this.renderCookies();
  },

  handleCookieListClick(event) {
    const editTarget = event.target.closest('[data-action="edit"]');
    if (!editTarget) {
      return;
    }
    const cookie = this.getCookieById(
      editTarget.closest('.cookie-row').dataset.id
    );
    if (cookie) {
      this.openCookieEditor(cookie);
    }
  },

  handleCookieListChange(event) {
    if (!event.target.classList.contains('cookie-select')) {
      return;
    }
    const id = event.target.closest('.cookie-row').dataset.id;
    this.state.selected[event.target.checked ? 'add' : 'delete'](id);
    this.updateBulkBar();
  },

  toggleSelectAll() {
    const visibleCookies = this.getVisibleCookies();
    const allSelected =
      visibleCookies.length &&
      visibleCookies.every(cookie =>
        this.state.selected.has(this.getCookieId(cookie))
      );
    visibleCookies.forEach(cookie => {
      this.state.selected[allSelected ? 'delete' : 'add'](
        this.getCookieId(cookie)
      );
    });
    this.renderCookies();
  },

  clearSelection() {
    this.state.selected.clear();
    this.renderCookies();
  },

  updateBulkBar() {
    const count = this.state.selected.size;
    this.els.bulkCount.textContent = `${count} selected`;
    this.els.bulkBar.classList.toggle('visible', count > 0);
    if (!count) {
      this.closeBulkProfileMenu();
      return;
    }
    this.renderBulkProfileMenu();
  },
};
