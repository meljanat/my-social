let socket = null;
let messageListeners = [];
let notificationListeners = [];

export const connectSocket = (url = "ws://localhost:8404/ws") => {
  if (socket && socket.readyState !== WebSocket.CLOSED) return socket;

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log(" WebSocket connected");

    // socket.send(JSON.stringify({ type: "test", message: "hello" }));
    // socket.send(JSON.stringify(data));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        messageListeners.forEach((e) => e(data));
      } else if (data.type === "notification") {
        notificationListeners.forEach((e) => e(data));
      }
    } catch (error) {
      console.error(" Error parsing WebSocket message:", error);
    }
  };

  socket.onclose = () => {
    console.log(" WebSocket disconnected");
  };

  return socket;
};

export const sendMessage = (data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("WebSocket not ready.");
  }
};

export const subscribeToMessages = (callback) => {
  messageListeners.push(callback);
};

export const subscribeToNotifications = (callback) => {
  notificationListeners.push(callback);
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
