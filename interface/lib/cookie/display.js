import { ExtraInfos } from '../options/extraInfos.js';

export const cookieDisplayMethods = {
  /**
   * Formats the expiration date of the cookie for display.
   * @return {string|Date}
   */
  formatExpirationForDisplay() {
    return this.cookie.expirationDate
      ? new Date(this.cookie.expirationDate * 1000)
      : 'No Expiration';
  },

  /**
   * Formats the expiration date of the cookie for display in a shorter format.
   * @return {string}
   */
  formatExpirationForDisplayShort() {
    const date = new Date(this.cookie.expirationDate * 1000);
    date.setMilliseconds(0);
    return this.cookie.expirationDate
      ? date.toISOString().split('.')[0] + 'Z'
      : 'No Expiration';
  },

  /**
   * Formats a boolean for displaying extra infos.
   * @param {string} name
   * @param {Boolean} boolValue
   * @return {string}
   */
  formatBoolForDisplayShort(name, boolValue) {
    const emoji = boolValue ? '☑' : '☐';
    return emoji + ' ' + name;
  },

  /**
   * Gets the extra info value for the preferred type.
   * @return {string}
   */
  getExtraInfoValue() {
    const valueMap = this.getExtraInfoValueMap();
    return valueMap[this.optionHandler.getExtraInfo()] || '';
  },

  getExtraInfoValueMap() {
    return {
      [ExtraInfos.Value]: this.cookie.value,
      [ExtraInfos.Domain]: this.cookie.domain,
      [ExtraInfos.Path]: this.cookie.path,
      [ExtraInfos.Expiration]: this.formatExpirationForDisplayShort(),
      [ExtraInfos.Samesite]: this.cookie.sameSite,
      [ExtraInfos.Hostonly]: this.formatBoolForDisplayShort(
        'Host Only',
        this.cookie.hostOnly
      ),
      [ExtraInfos.Session]: this.formatBoolForDisplayShort(
        'Session',
        this.cookie.session
      ),
      [ExtraInfos.Secure]: this.formatBoolForDisplayShort(
        'Secure',
        this.cookie.secure
      ),
      [ExtraInfos.Httponly]: this.formatBoolForDisplayShort(
        'Http Only',
        this.cookie.httpOnly
      ),
      [ExtraInfos.Nothing]: '',
    };
  },

  /**
   * Gets the extra info title for the preferred type.
   * @return {string}
   */
  getExtraInfoTitle() {
    const titleMap = {
      [ExtraInfos.Value]: 'Value: ' + this.cookie.value,
      [ExtraInfos.Domain]: 'Domain: ' + this.cookie.domain,
      [ExtraInfos.Path]: 'Path: ' + this.cookie.path,
      [ExtraInfos.Expiration]:
        'Expiration: ' + this.formatExpirationForDisplay(),
      [ExtraInfos.Samesite]: 'Same Site: ' + this.cookie.sameSite,
      [ExtraInfos.Hostonly]: 'Host Only: ' + this.cookie.hostOnly,
      [ExtraInfos.Session]: 'Session: ' + this.cookie.session,
      [ExtraInfos.Secure]: 'Secure: ' + this.cookie.secure,
      [ExtraInfos.Httponly]: 'HTTP Only: ' + this.cookie.httpOnly,
      [ExtraInfos.Nothing]: '',
    };
    return titleMap[this.optionHandler.getExtraInfo()] || '';
  },
};
