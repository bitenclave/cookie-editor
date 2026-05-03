import { EventEmitter } from './eventEmitter.js';
import { GUID } from './guid.js';
import { ExportActions } from './options/exportActions.js';
import { ExportFormats } from './options/exportFormats.js';
import { ExtraInfos } from './options/extraInfos.js';
import { Options } from './options/options.js';
import { Themes } from './options/themes.js';

const optionsKey = 'all_options';

const enumOptions = {
  exportAction: {
    fallback: ExportActions.Download,
    label: 'exportAction',
    values: ExportActions,
  },
  exportFormat: {
    fallback: ExportFormats.Ask,
    label: 'exportFormat',
    values: ExportFormats,
  },
  extraInfo: {
    fallback: ExtraInfos.Nothing,
    label: 'extraInfo',
    values: ExtraInfos,
  },
  theme: {
    fallback: Themes.Auto,
    label: 'theme',
    values: Themes,
  },
};

export class OptionsHandler extends EventEmitter {
  constructor(browserDetector, genericStorageHandler) {
    super();
    console.log('constructing an optionsHandler');
    this.browserDetector = browserDetector;
    this.storageHandler = genericStorageHandler;
    this.isReady = false;
    this.options = null;
    this.guid = GUID.get();
    this.backgroundPageConnection = this.browserDetector
      .getApi()
      .runtime.connect({ name: this.guid });
    this.backgroundPageConnection.onMessage.addListener(this.onMessage);
    this.backgroundPageConnection.postMessage({ type: 'init_optionsHandler' });
  }

  getCookieAdvanced() {
    return this.options.advancedCookies;
  }

  setCookieAdvanced(isAdvanced) {
    this.options.advancedCookies = isAdvanced;
    this.saveOptions();
  }

  getDevtoolsEnabled() {
    return this.options.devtoolsEnabled;
  }

  setDevtoolsEnabled(devtoolsEnabled) {
    this.options.devtoolsEnabled = devtoolsEnabled;
    this.saveOptions();
  }

  getAnimationsEnabled() {
    return this.options.animationsEnabled !== false;
  }

  setAnimationsEnabled(animationsEnabled) {
    this.options.animationsEnabled = animationsEnabled;
    this.saveOptions();
  }

  getExportAction() {
    return this.getEnumOption('exportAction');
  }

  setExportAction(exportAction) {
    this.setEnumOption('exportAction', exportAction);
  }

  isExportActionValid(exportAction) {
    return this.isEnumValueValid(exportAction, enumOptions.exportAction.values);
  }

  getExportFormat() {
    return this.getEnumOption('exportFormat');
  }

  setExportFormat(exportFormat) {
    this.setEnumOption('exportFormat', exportFormat);
  }

  isExportFormatValid(exportFormat) {
    return this.isEnumValueValid(exportFormat, enumOptions.exportFormat.values);
  }

  getExtraInfo() {
    return this.getEnumOption('extraInfo');
  }

  setExtraInfo(extraInfo) {
    this.setEnumOption('extraInfo', extraInfo);
  }

  isExtraInfoValid(extraInfo) {
    return this.isEnumValueValid(extraInfo, enumOptions.extraInfo.values);
  }

  getTheme() {
    return this.getEnumOption('theme');
  }

  setTheme(theme) {
    this.setEnumOption('theme', theme);
  }

  isThemeValid(theme) {
    return this.isEnumValueValid(theme, enumOptions.theme.values);
  }

  getEnumOption(key) {
    const definition = enumOptions[key];
    let value = this.options[key];
    if (!this.isEnumValueValid(value, definition.values)) {
      console.error(
        `Tried to load an ${definition.label} that doesn't exists`,
        value
      );
      value = definition.fallback;
      this.setEnumOption(key, value);
    }
    return value;
  }

  setEnumOption(key, value) {
    const definition = enumOptions[key];
    if (!this.isEnumValueValid(value, definition.values)) {
      console.error(
        `Tried to save an ${definition.label} that doesn't exists`,
        value
      );
      return;
    }
    this.options[key] = value;
    this.saveOptions();
  }

  isEnumValueValid(value, allowedValues) {
    return Object.values(allowedValues).includes(value);
  }

  getButtonBarTop() {
    return this.options.buttonBarTop;
  }

  setButtonBarTop(buttonBarTop) {
    this.options.buttonBarTop = buttonBarTop;
    this.saveOptions();
  }

  async loadOptions() {
    console.log('Loading options');
    this.options = await this.storageHandler.getLocal(optionsKey);
    if (this.options == null) {
      console.log('No options found, creating new one');
      this.options = new Options();
      await this.saveOptions();
    }
  }

  async saveOptions() {
    console.log('Saving options');
    await this.storageHandler.setLocal(optionsKey, this.options);
    this.notifyBackgroundOfChanges();
  }

  notifyBackgroundOfChanges() {
    this.sendMessage('optionsChanged', { from: this.guid });
  }

  sendMessage(type, params, callback, errorCallback) {
    if (this.browserDetector.supportsPromises()) {
      this.browserDetector
        .getApi()
        .runtime.sendMessage({ type: type, params: params })
        .then(callback, errorCallback);
    } else {
      this.browserDetector
        .getApi()
        .runtime.sendMessage({ type: type, params: params }, callback);
    }
  }

  onMessage = async request => {
    console.log(
      '[options] background message received: ' + (request.type || 'unknown')
    );
    switch (request.type) {
      case 'optionsChanged': {
        if (request.data.from == this.guid) {
          return;
        }
        const oldOptions = this.options;
        await this.loadOptions();
        this.emit('optionsChanged', oldOptions);
        return;
      }
    }
  };
}
