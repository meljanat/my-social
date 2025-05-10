export let websocket;

const listeners = {};

export const connectWebSocket = function () {
    websocket = new WebSocket('ws://localhost:8404/ws');

    websocket.onopen = () => {
        console.log("WebSocket connection open.");
    };

    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (listeners['message']) {
            listeners['message'].forEach((callback) => callback(data));
        }
    };

    websocket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    websocket.onerror = (error) => {
        console.error("WebSocket encountered an error:", error);
    };
};

export const subscribe = (event, callback) => {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(callback);
};

export const unsubscribe = (event, callback) => {
    if (listeners[event]) {
        listeners[event] = listeners[event].filter((cb) => cb !== callback);
    }
};

let isLoggedIn = false;

const response = await fetch("http://localhost:8404/", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
    credentials: "include",
});

if (response.ok) {
    const data = await response.json();
    console.log('dkhel');

    connectWebSocket();
    isLoggedIn = data;
}

isLoggedIn ? console.log("User is logged in") : console.log("User is not logged in");
