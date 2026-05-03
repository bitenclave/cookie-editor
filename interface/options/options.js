import { OptionsPage } from './app/optionsPage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const page = new OptionsPage();
  await page.init();
});
