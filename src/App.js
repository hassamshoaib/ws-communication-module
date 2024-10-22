import React, { useEffect, useState } from "react";
import WebSocketModule from "./websocket-module/WebSocketModule";

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socketModule1, setSocketModule1] = useState(null);
  const webSocketUrl = "ws://localhost:8080"; // Replace with your WebSocket server URL

  useEffect(() => {
    setSocketModule1(
      new WebSocketModule(webSocketUrl, (payload) => {
        handleWebSocketMessage(payload);
      })
    );
    // Optional: you can also store wsModule to send messages later if needed
    return () => {
      // Cleanup or disconnect WebSocket if needed
    };
  }, []);

  const handleWebSocketMessage = (payload) => {
    setMessages((prevMessages) => [...prevMessages, payload.message]);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() !== "") {
      socketModule1.sendMessage({
        type: "SEND_WEBSOCKET_MESSAGE",
        payload: { message: messageInput }
      });

      setMessageInput("");
    }
  };

  return (
    <div>
      <h1>WebSocket Communication</h1>
      <div>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
