import {
  handleConnect,
  sendMessageToAllTabs,
  sendMessageToTab,
} from './interface/background/connections.js';
import { handleMessage } from './interface/background/messageRouter.js';
import { setupPlatformPopups } from './interface/background/platform.js';
import { BrowserDetector } from './interface/lib/browserDetector.js';
import { PermissionHandler } from './interface/lib/permissionHandler.js';

(function () {
  console.log('starting background script');

  const connections = {};
  const browserDetector = new BrowserDetector();
  const permissionHandler = new PermissionHandler(browserDetector);
  const api = browserDetector.getApi();
  const context = { browserDetector, connections, permissionHandler };

  setupPlatformPopups(browserDetector);
  setupSidePanel(browserDetector);

  api.runtime.onConnect.addListener(port => handleConnect(port, connections));
  api.runtime.onMessage.addListener((request, sender, sendResponse) =>
    handleMessage(request, sender, sendResponse, context)
  );
  api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('tabs changed', tabId, changeInfo, tab);
    sendMessageToTab(connections, tabId, 'tabsChanged', changeInfo);
  });

  if (!browserDetector.isSafari()) {
    api.cookies.onChanged.addListener(changeInfo => {
      console.log('cookies changed, notifying all devtools');
      sendMessageToAllTabs(connections, 'cookiesChanged', changeInfo);
    });
  }

  function setupSidePanel(detector) {
    if (!detector.supportsSidePanel()) {
      return;
    }
    detector
      .getApi()
      .sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
      .catch(error => {
        console.error(error);
      });
  }
})();
