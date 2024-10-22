const WebSocketActions = {
  REGISTER_CLIENT: "REGISTER_CLIENT",
  SET_WEBSOCKET_URL: "SET_WEBSOCKET_URL",
  SEND_WEBSOCKET_MESSAGE: "SEND_WEBSOCKET_MESSAGE",
  WEBSOCKET_MESSAGE: "WEBSOCKET_MESSAGE",
  WEBSOCKET_OPEN: "WEBSOCKET_OPEN",
  WEBSOCKET_ERROR: "WEBSOCKET_ERROR",
  WEBSOCKET_CLOSE: "WEBSOCKET_CLOSE"
};
let webSocketsMap = {};
let messagePorts = [];
let maxReconnectAttempts = 5;
let reconnectDelay = 1000;
let reconnectAttemptsMap = {};
let isClosedByClient = {};

self.addEventListener("message", (event) => {
  const { type, payload } = event.data;
  switch (type) {
    case WebSocketActions.REGISTER_CLIENT:
      handleClientRegistration(event.ports[0]);
      break;
    case WebSocketActions.SET_WEBSOCKET_URL:
      setWebSocket(payload);
      break;
    case WebSocketActions.SEND_WEBSOCKET_MESSAGE:
      sendWebSocketMessage(payload.url, payload.message);
      break;
    case WebSocketActions.WEBSOCKET_CLOSE:
      closeWebSocket(payload.url);
      break;
    default:
      console.log("Unknown message type received in service worker");
  }
});

function setWebSocket(webSocketUrl) {
  if (!webSocketsMap[webSocketUrl]) {
    initializeWebSocket(webSocketUrl);
  }
}

function initializeWebSocket(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl);
  webSocketsMap[webSocketUrl] = ws;
  reconnectAttemptsMap[webSocketUrl] = 0; // Reset the reconnection attempts for this URL

  ws.onopen = () => {
    console.log(`WebSocket connected: ${webSocketUrl}`);
    broadcastMessage({ type: WebSocketActions.WEBSOCKET_OPEN, payload: webSocketUrl });
    reconnectAttemptsMap[webSocketUrl] = 0; // Reset on successful connection
  };

  ws.onmessage = (message) => {
    broadcastMessage({
      type: WebSocketActions.WEBSOCKET_MESSAGE,
      payload: { url: webSocketUrl, message: message.data }
    });
  };

  ws.onerror = (error) => {
    broadcastMessage({
      type: WebSocketActions.WEBSOCKET_ERROR,
      payload: { url: webSocketUrl, error }
    });
  };

  ws.onclose = () => {
    if (!isClosedByClient[webSocketUrl]) {
      console.log(`WebSocket closed unexpectedly. Reconnecting...`);
      handleReconnection(webSocketUrl); // Reconnect websocket in case of un expected closure
    } else {
      console.log(`WebSocket closed intentionally for URL: ${webSocketUrl}`);
      delete webSocketsMap[webSocketUrl]; // Clean up connection
      delete reconnectAttemptsMap[webSocketUrl];
      delete isClosedByClient[webSocketUrl];
    }
    broadcastMessage({ type: WebSocketActions.WEBSOCKET_CLOSE, payload: webSocketUrl });
  };
}

function handleReconnection(webSocketUrl) {
  const attempts = reconnectAttemptsMap[webSocketUrl] || 0;
  if (attempts <= maxReconnectAttempts) {
    const delay = reconnectDelay * Math.pow(2, attempts); //Exponential backoff

    console.log(`Reconnecting to ${webSocketUrl} in ${delay / 1000} seconds...`);

    setTimeout(() => {
      reconnectAttemptsMap[webSocketUrl]++;
    }, delay);
  }
}

function closeWebSocket(webSocketUrl) {
  if (webSocketsMap[webSocketUrl]) {
    isClosedByClient[webSocketUrl] = true; // Set the flag for intentional closure
    webSocketsMap[webSocketUrl].close();
  }
}

function handleClientRegistration(messagePort) {
  messagePorts.push(messagePort);
  messagePort.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === WebSocketActions.SEND_WEBSOCKET_MESSAGE) {
      sendWebSocketMessage(payload.url, payload.message);
    }
  };
}

function sendWebSocketMessage(webSocketUrl, message) {
  const ws = webSocketsMap[webSocketUrl];
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.log(`WebSocket for ${webSocketUrl} is not open`);
  }
}

function broadcastMessage(message) {
  messagePorts.forEach((port) => port.postMessage(message));
}
