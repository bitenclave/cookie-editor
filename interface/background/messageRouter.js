import { sendMessageToAllTabs } from './connections.js';

export function handleMessage(request, sender, sendResponse, context) {
  console.log('message received: ' + (request.type || 'unknown'));
  switch (request.type) {
    case 'getTabs':
      return getTabs(context.browserDetector, sendResponse);
    case 'getCurrentTab':
      return getCurrentTab(context.browserDetector, sendResponse);
    case 'getAllCookies':
      return getAllCookies(context.browserDetector, request, sendResponse);
    case 'saveCookie':
      return saveCookie(context.browserDetector, request, sendResponse);
    case 'removeCookie':
      return removeCookie(context.browserDetector, request, sendResponse);
    case 'permissionsContains':
      context.permissionHandler
        .checkPermissions(request.params)
        .then(sendResponse);
      return true;
    case 'permissionsRequest':
      context.permissionHandler
        .requestPermission(request.params)
        .then(sendResponse);
      return true;
    case 'optionsChanged':
      sendMessageToAllTabs(context.connections, 'optionsChanged', {
        from: request.params.from,
      });
      return true;
  }
}

function getTabs(browserDetector, sendResponse) {
  browserDetector.getApi().tabs.query({}, tabs => {
    sendResponse(tabs);
  });
  return true;
}

function getCurrentTab(browserDetector, sendResponse) {
  browserDetector.getApi().tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    tabInfo => {
      sendResponse(tabInfo);
    }
  );
  return true;
}

function getAllCookies(browserDetector, request, sendResponse) {
  const params = { url: request.params.url };
  if (request.params.storeId) {
    params.storeId = request.params.storeId;
  }
  if (browserDetector.supportsPromises()) {
    browserDetector.getApi().cookies.getAll(params).then(sendResponse);
  } else {
    browserDetector.getApi().cookies.getAll(params, sendResponse);
  }
  return true;
}

function saveCookie(browserDetector, request, sendResponse) {
  if (browserDetector.supportsPromises()) {
    browserDetector
      .getApi()
      .cookies.set(request.params.cookie)
      .then(
        cookie => sendResponse(null, cookie),
        error => {
          console.error('Failed to create cookie', error);
          sendResponse(error.message, null);
        }
      );
    return true;
  }
  browserDetector.getApi().cookies.set(request.params.cookie, cookie => {
    respondToCookieSave(browserDetector, cookie, sendResponse);
  });
  return true;
}

function respondToCookieSave(browserDetector, cookie, sendResponse) {
  if (cookie) {
    sendResponse(null, cookie);
    return;
  }
  const error = browserDetector.getApi().runtime.lastError;
  console.error('Failed to create cookie', error);
  sendResponse(error.message, cookie);
}

function removeCookie(browserDetector, request, sendResponse) {
  const params = {
    name: request.params.name,
    url: request.params.url,
  };
  if (request.params.storeId) {
    params.storeId = request.params.storeId;
  }
  if (browserDetector.supportsPromises()) {
    browserDetector.getApi().cookies.remove(params).then(sendResponse);
  } else {
    browserDetector.getApi().cookies.remove(params, sendResponse);
  }
  return true;
}
