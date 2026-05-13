import { EventEmitter } from './eventEmitter.js';

/**
 * Abstract class used to implement basic common Storage API handling.
 */
export class GenericStorageHandler extends EventEmitter {
  /**
   * Constructs a GenericStorageHandler.
   * @param {BrowserDetector} browserDetector
   */
  constructor(browserDetector) {
    super();
    this.browserDetector = browserDetector;
  }

  /**
   * Gets a value from LocalStorage.
   * @param {string} key Key to identify the value in the LocalStorage.
   * @return {Promise}
   */
  async getLocal(key) {
    const self = this;
    let promise;
    if (this.browserDetector.supportsPromises()) {
      promise = this.browserDetector.getApi().storage.local.get([key]);
    } else {
      promise = new Promise((resolve, reject) => {
        self.browserDetector.getApi().storage.local.get([key], data => {
          const error = self.browserDetector.getApi().runtime.lastError;
          if (error) {
            reject(error);
          }
          resolve(data ?? null);
        });
      });
    }

    return promise.then(data => {
      return data[key] ?? null;
    });
  }

  /**
   * Sets a value in the LocalStorage.
   * @param {string} key Key to identify the value in the LocalStorage.
   * @param {any} data Data to store in the LocalStorage
   * @return {Promise}
   */
  async setLocal(key, data) {
    const self = this;
    const dataObj = {};
    dataObj[key] = data;

    if (this.browserDetector.supportsPromises()) {
      return this.browserDetector.getApi().storage.local.set(dataObj);
    } else {
      return new Promise((resolve, reject) => {
        this.browserDetector.getApi().storage.local.set(dataObj, () => {
          const error = self.browserDetector.getApi().runtime.lastError;
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    }
  }

  async getSession(key) {
    const storage = this.getSessionStorageArea();
    if (!storage) {
      return this.getWindowSessionValue(key);
    }
    const data = await this.getStorageValue(storage, key);
    return data[key] ?? null;
  }

  async setSession(key, data) {
    const storage = this.getSessionStorageArea();
    if (!storage) {
      this.setWindowSessionValue(key, data);
      return;
    }
    await this.setStorageValue(storage, key, data);
  }

  getSessionStorageArea() {
    return this.browserDetector.getApi().storage?.session || null;
  }

  getStorageValue(storage, key) {
    const self = this;
    if (this.browserDetector.supportsPromises()) {
      return storage.get([key]);
    }
    return new Promise((resolve, reject) => {
      storage.get([key], data => {
        const error = self.browserDetector.getApi().runtime.lastError;
        if (error) {
          reject(error);
        }
        resolve(data ?? null);
      });
    });
  }

  setStorageValue(storage, key, data) {
    const self = this;
    const dataObj = {};
    dataObj[key] = data;
    if (this.browserDetector.supportsPromises()) {
      return storage.set(dataObj);
    }
    return new Promise((resolve, reject) => {
      storage.set(dataObj, () => {
        const error = self.browserDetector.getApi().runtime.lastError;
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  }

  getWindowSessionValue(key) {
    if (!window.sessionStorage) {
      return null;
    }
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  setWindowSessionValue(key, data) {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    }
  }
}
