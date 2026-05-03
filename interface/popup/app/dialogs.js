export const dialogMethods = {
  showDialog(options) {
    return new Promise(resolve => {
      this.dismissDialog();
      this.state.dialog = {
        isPrompt: options.type === 'prompt',
        previousFocus: document.activeElement,
        resolve,
      };
      this.populateDialog(options);
      this.els.dialogLayer.hidden = false;
      requestAnimationFrame(() => {
        if (!this.state.dialog) {
          return;
        }
        this.els.dialogLayer.classList.add('visible');
        this.els.dialog.classList.add('open');
        const focusTarget = this.state.dialog.isPrompt
          ? this.els.dialogInput
          : this.els.dialogConfirm;
        focusTarget.focus();
        if (this.state.dialog.isPrompt) {
          this.els.dialogInput.select();
        }
      });
    });
  },

  populateDialog(options) {
    this.els.dialogTitle.textContent = options.title || 'Confirm action';
    this.els.dialogMessage.textContent = options.message || '';
    this.els.dialogConfirm.textContent = options.confirmLabel || 'OK';
    this.els.dialogCancel.textContent = options.cancelLabel || 'Cancel';
    this.els.dialogConfirm.className = `button ${
      options.variant === 'danger' ? 'danger' : 'primary'
    }`;
    this.els.dialogInputRow.hidden = options.type !== 'prompt';
    this.els.dialogInputLabel.textContent = options.inputLabel || '';
    this.els.dialogInput.value = options.defaultValue || '';
    this.els.dialogInput.disabled = options.type !== 'prompt';
    this.els.dialogInput.required = Boolean(options.required);
  },

  confirmDialog(options) {
    return this.showDialog({
      type: 'confirm',
      ...options,
    });
  },

  promptDialog(options) {
    return this.showDialog({
      type: 'prompt',
      required: true,
      ...options,
    });
  },

  bindDialogEvents() {
    this.els.dialogForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!this.state.dialog) {
        return;
      }
      this.closeDialog(
        this.state.dialog.isPrompt ? this.els.dialogInput.value : true
      );
    });
    this.els.dialogCancel.addEventListener('click', () =>
      this.closeDialog(this.state.dialog?.isPrompt ? null : false)
    );
    this.els.dialogBackdrop.addEventListener('click', () =>
      this.closeDialog(this.state.dialog?.isPrompt ? null : false)
    );
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !this.state.dialog) {
        return;
      }
      event.preventDefault();
      this.closeDialog(this.state.dialog.isPrompt ? null : false);
    });
  },

  closeDialog(result) {
    const dialog = this.state.dialog;
    if (!dialog) {
      return;
    }
    this.state.dialog = null;
    this.els.dialogLayer.classList.remove('visible');
    this.els.dialog.classList.remove('open');
    setTimeout(() => {
      if (!this.state.dialog) {
        this.els.dialogLayer.hidden = true;
      }
    }, 180);
    dialog.resolve(result);
    if (dialog.previousFocus?.focus) {
      dialog.previousFocus.focus();
    }
  },

  dismissDialog() {
    if (!this.state.dialog) {
      return;
    }
    const dialog = this.state.dialog;
    this.state.dialog = null;
    dialog.resolve(dialog.isPrompt ? null : false);
  },
};
