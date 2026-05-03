import { PopupApp } from './app/popupApp.js';
import { renderAppShell } from './app/shell/render.js';

document.addEventListener('DOMContentLoaded', () => {
  renderAppShell();
  new PopupApp().init();
});
