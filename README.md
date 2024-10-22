# React Application with Generic Service Worker and WebSocket Module

## Overview

This project is a React application demonstrating the implementation of a generic service worker and a WebSocket module. The application enables communication between multiple browser tabs using a shared WebSocket connection. Each tab can send and receive messages through the service worker, which acts as a messaging bus between the tabs and a WebSocket server. The WebSocket connection is maintained and shared across all tabs for optimal performance, reducing the overhead of multiple WebSocket connections.

## Features

- **Single WebSocket Connection**: A shared WebSocket connection is maintained across all browser tabs.
- **Service Worker Integration**: The service worker is responsible for broadcasting messages between all connected tabs and managing the WebSocket connection.
- **Tab Synchronization**: All browser tabs share the same state for WebSocket communication. If one tab sends a message, all others receive it via the service worker.
- **Modular Design**: The WebSocket module is designed to be reusable, allowing for easy integration into other projects.

## Key Files

- `src/websocket-module/WebSocketModule.js`: Contains the WebSocket module which handles WebSocket creation, registration of the service worker, and communication setup.
- `public/ServiceWorker.js`: The service worker file that handles WebSocket communication and inter-tab messaging.Keep it under public folder to have a root scope.
- `src/components/App.js`: The main React component where the WebSocketModule is initialized and demonstrates communication between multiple tabs.

## Setup Instructions

### Prerequisites

- Node.js (>= 14.x.x)
- npm (>= 6.x.x) or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hassamshoaib/ws-communication-module.git
   cd ws-communication-module
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

## Best Practices

- Use this pattern when you need a single WebSocket connection shared across multiple tabs to reduce overhead.
- Ensure that service workers are registered properly for your application, especially during deployment.
- Implement reconnection logic for the WebSocket in case of connection drops.
- Support for managing multiple WebSocket connections for different web socket URL's.
