import { Browsers } from '../lib/browsers.js';

export function setupPlatformPopups(browserDetector) {
  isFirefoxAndroid(browserDetector, response => {
    if (response) {
      setMobilePopup(browserDetector);
    }
  });
  isSafariIos(browserDetector, response => {
    if (response) {
      browserDetector.overrideBrowserName(Browsers.Safari);
      console.log('Setting up iOS popup');
      setMobilePopup(browserDetector);
    }
  });
}

function setMobilePopup(browserDetector) {
  browserDetector.getApi().action.setPopup({
    popup: '/interface/popup-mobile/cookie-list.html',
  });
}

function isFirefoxAndroid(browserDetector, callback) {
  if (!browserDetector.isFirefox()) {
    callback(false);
    return;
  }
  browserDetector
    .getApi()
    .runtime.getPlatformInfo()
    .then(info => {
      callback(info.os === 'android');
    });
}

function isSafariIos(browserDetector, callback) {
  browserDetector
    .getApi()
    .runtime.getPlatformInfo()
    .then(info => {
      console.log('check for safari on ios: ', info.os);
      callback(info.os === 'ios');
    });
}
