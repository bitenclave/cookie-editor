import { Animate } from '../animate.js';

export const cookieRenderingMethods = {
  /**
   * Generates the HTML representation of a cookie.
   */
  generateHtml() {
    const template = document.importNode(
      document.getElementById('tmp-cookie').content,
      true
    );
    this.baseHtml = template.querySelector('li');
    const form = this.initializeCookieTemplate();
    this.setupExpando();
    this.setupHeader();
    this.setupTextFields(form);
    this.setupCheckboxFields(form);
    this.setupAdvancedForm(form);
  },

  initializeCookieTemplate() {
    this.baseHtml.setAttribute('data-name', this.cookie.name);
    this.baseHtml.id = this.id;
    const form = this.baseHtml.querySelector('form');
    form.setAttribute('data-id', this.id);
    form.id = this.guid;
    if (!this.id) {
      form.classList.add('create');
    }
    return form;
  },

  setupExpando() {
    const expandoId = 'exp_' + this.guid;
    const expando = this.baseHtml.querySelector('.expando');
    expando.id = expandoId;
    this.baseHtml
      .querySelector('.header')
      .setAttribute('aria-controls', expandoId);
  },

  setupHeader() {
    const headerName = this.baseHtml.querySelector('.header-name');
    headerName.textContent = this.cookie.name;

    const headerExtraInfo = this.baseHtml.querySelector('.header-extra-info');
    headerExtraInfo.textContent = this.getExtraInfoValue();
    headerExtraInfo.title = this.getExtraInfoTitle();
  },

  setupTextFields(form) {
    this.setupTextField(form, 'name', this.cookie.name);
    this.setupTextField(form, 'value', this.cookie.value);
    this.setupTextField(form, 'domain', this.cookie.domain);
    this.setupTextField(form, 'path', this.cookie.path);
    this.setupTextField(form, 'expiration', this.formatExpirationForDisplay());
    this.setupTextField(form, 'sameSite', this.cookie.sameSite);
    form.querySelector('.input-domain').disabled = this.cookie.hostOnly;
    form.querySelector('.input-expiration').disabled =
      !this.cookie.expirationDate;
  },

  setupTextField(form, name, value) {
    form
      .querySelector(`.label-${name}`)
      .setAttribute('for', `${name}-${this.guid}`);
    const input = form.querySelector(`.input-${name}`);
    input.id = `${name}-${this.guid}`;
    input.value = value;
  },

  setupCheckboxFields(form) {
    this.setupCheckboxField(form, 'hostOnly', this.cookie.hostOnly);
    this.setupCheckboxField(form, 'session', !this.cookie.expirationDate);
    this.setupCheckboxField(form, 'secure', this.cookie.secure);
    this.setupCheckboxField(form, 'httpOnly', this.cookie.httpOnly);

    form.querySelector('.input-hostOnly').addEventListener('change', event => {
      this.afterHostOnlyChanged(event.target.checked);
    });
    form.querySelector('.input-session').addEventListener('change', event => {
      this.afterSessionChanged(event.target.checked);
    });
  },

  setupCheckboxField(form, name, checked) {
    form
      .querySelector(`.label-${name}`)
      .setAttribute('for', `${name}-${this.guid}`);
    const input = form.querySelector(`.input-${name}`);
    input.id = `${name}-${this.guid}`;
    input.checked = checked;
  },

  setupAdvancedForm(form) {
    const advancedToggleButton = form.querySelector('.advanced-toggle');
    const advancedForm = form.querySelector('.advanced-form');
    advancedToggleButton.addEventListener('click', () => {
      advancedForm.classList.toggle('show');
      advancedToggleButton.textContent = advancedForm.classList.contains('show')
        ? 'Hide Advanced'
        : 'Show Advanced';
      Animate.resizeSlide(form.parentElement.parentElement);
    });

    if (this.optionHandler.getCookieAdvanced()) {
      advancedForm.classList.add('show');
      advancedToggleButton.textContent = 'Hide Advanced';
    }
  },

  /**
   * Generates a compact row for dashboard-style interfaces.
   * @return {HTMLLIElement}
   */
  toCompactHtml() {
    const item = document.createElement('li');
    item.className = 'cookie-row';
    item.dataset.id = this.id;
    item.dataset.name = this.cookie.name;
    item.append(
      this.createCompactNode(
        'strong',
        'cookie-name',
        this.cookie.name || '(unnamed)'
      ),
      this.createCompactNode(
        'span',
        'cookie-value',
        this.cookie.value || '(empty value)'
      ),
      this.createCompactNode(
        'span',
        'cookie-meta',
        [this.cookie.domain, this.cookie.path].filter(Boolean).join('  ')
      )
    );
    this.baseHtml = item;
    return item;
  },

  createCompactNode(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  },
};
