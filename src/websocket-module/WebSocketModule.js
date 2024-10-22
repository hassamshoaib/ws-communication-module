import * as WebSocketActions from "./WebSocketActions";

class WebSocketModule {
  constructor(webSocketUrl, onMessageCallback) {
    this.webSocketUrl = webSocketUrl;
    this.messagePort = null;
    this.onMessageCallback = onMessageCallback; // Allow custom message handler
    this.registerServiceWorker();
  }

  async registerServiceWorker() {
    try {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/ServiceWorker.js");
        await this.setupCommunication();
      }
    } catch (err) {
      console.log("Failed to register service worker", err);
    }
  }

  async setupCommunication() {
    try {
      console.log("Setup communication started");
      const registration = await navigator.serviceWorker.ready;

      const messageChannel = new MessageChannel();
      this.messagePort = messageChannel.port1;

      this.messagePort.onmessage = this.handleMessage.bind(this);
      registration.active.postMessage({ type: WebSocketActions.REGISTER_CLIENT }, [
        messageChannel.port2
      ]);
      registration.active.postMessage({
        type: WebSocketActions.SET_WEBSOCKET_URL,
        payload: this.webSocketUrl
      });
    } catch (err) {
      console.log("Failed to set up communication with service worker", err);
    }
  }

  handleMessage(event) {
    const { type, payload } = event.data;

    switch (type) {
      case WebSocketActions.WEBSOCKET_MESSAGE:
        if (this.onMessageCallback) {
          this.onMessageCallback(payload); // Custom message handler in consuming component
        }
        break;
      case WebSocketActions.WEBSOCKET_ERROR:
        console.log("WebSocket error", payload);
        break;
      case WebSocketActions.WEBSOCKET_OPEN:
        console.log("WebSocket open", payload);
        break;
      case WebSocketActions.WEBSOCKET_CLOSE:
        console.log("WebSocket close", payload);
        break;
      default:
        console.log("Unknown message type from Service Worker", type);
    }
  }

  sendMessage({ type, payload }) {
    console.log("This . messagePort", this.messagePort);
    if (this.messagePort) {
      console.log("Inside send message ", { type, payload });

      this.messagePort.postMessage({
        type,
        payload: { url: this.webSocketUrl, ...payload }
      });
    }
  }
}

export default WebSocketModule;
