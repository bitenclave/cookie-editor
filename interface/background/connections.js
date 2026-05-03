export function handleConnect(port, connections) {
  const extensionListener = request => {
    console.log('port message received: ' + (request.type || 'unknown'));
    switch (request.type) {
      case 'init_cookieHandler':
        console.log('Devtool cookieHandler connected on tab ' + request.tabId);
        connections[request.tabId] = port;
        return;
      case 'init_optionsHandler':
        console.log('optionsHandler connected: ' + port.name);
        connections[port.name] = port;
        return;
    }
  };

  port.onMessage.addListener(extensionListener);
  port.onDisconnect.addListener(disconnectedPort => {
    disconnectedPort.onMessage.removeListener(extensionListener);
    removeConnection(connections, disconnectedPort);
  });
}

function removeConnection(connections, port) {
  const tabs = Object.keys(connections);
  for (let i = 0; i < tabs.length; i++) {
    if (connections[tabs[i]] === port) {
      console.log('script disconnected on tab ' + tabs[i]);
      delete connections[tabs[i]];
      return;
    }
  }
}

export function sendMessageToTab(connections, tabId, type, data) {
  if (tabId in connections) {
    connections[tabId].postMessage({ type, data });
  }
}

export function sendMessageToAllTabs(connections, type, data) {
  const tabs = Object.keys(connections);
  for (let i = 0; i < tabs.length; i++) {
    sendMessageToTab(connections, tabs[i], type, data);
  }
}
