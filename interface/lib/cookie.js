import { cookieDisplayMethods } from './cookie/display.js';
import { cookieRenderingMethods } from './cookie/rendering.js';
import { cookieUpdateMethods } from './cookie/updates.js';
import { GUID } from './guid.js';

/**
 * Helper class to display a cookie.
 */
export class Cookie {
  /**
   * Creates a cookie object.
   * @param {string} id HTML id name for this cookie.
   * @param {object} cookie Cookie data.
   * @param {OptionsHandler} optionHandler
   */
  constructor(id, cookie, optionHandler) {
    this.id = id;
    this.cookie = cookie;
    this.guid = GUID.get();
    this.baseHtml = false;
    this.optionHandler = optionHandler;
  }

  /**
   * Whether the HTML for this cookie is already generated or not.
   */
  get isGenerated() {
    return this.baseHtml !== false;
  }

  /**
   * Gets the HTML to represent this cookie.
   */
  get html() {
    if (!this.isGenerated) {
      this.generateHtml();
    }
    return this.baseHtml;
  }

  /**
   * Generates a hashcode to represent a cookie based on identity fields.
   * @param {object} cookie A cookie's data.
   * @return {string} A hashcode.
   */
  static hashCode(cookie) {
    const cookieString = [
      cookie.storeId || '',
      cookie.name || '',
      cookie.domain || '',
      cookie.path || '',
      cookie.hostOnly ? 'hostOnly' : '',
    ].join('|');
    let hash = 0;
    if (cookieString.length === 0) {
      return hash;
    }
    for (let i = 0; i < cookieString.length; i++) {
      hash = (hash << 5) - hash + cookieString.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

Object.assign(
  Cookie.prototype,
  cookieRenderingMethods,
  cookieUpdateMethods,
  cookieDisplayMethods
);
