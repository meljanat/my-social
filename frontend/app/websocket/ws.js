'use client';
import { useEffect } from 'react';

export let websocket;
const listeners = {};

const connectWebSocket = function () {
    websocket = new WebSocket('ws://localhost:8404/ws');

    websocket.onopen = () => {
        console.log("WebSocket connection open.");
    };

    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (listeners['message']) {
            listeners['message'].forEach((callback) => callback(data));
        } else if (listeners['notifications']) {
            listeners['notifications'].forEach((callback) => callback(data));
        } else if (listeners['new_connection']) {
            listeners['new_connection'].forEach((callback) => callback(data));
        } else if (listeners['disconnection']) {
            listeners['disconnection'].forEach((callback) => callback(data));
        }
    };

    websocket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    websocket.onerror = (error) => {
        console.error("WebSocket encountered an error:", error);
    };
};

export const addToListeners = (event, callback) => {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(callback);
};

export const removeFromListeners = (event, callback) => {
    if (listeners[event]) {
        listeners[event] = listeners[event].filter((cb) => cb !== callback);
    }
};

export default function WebSocketManager() {
    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch("http://localhost:8404/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Not logged in");

                const data = await res.json();
                if (data) {
                    connectWebSocket();
                }
            } catch (err) {
                console.log("Auth check failed:", err);
            }
        }

        checkAuth();
    }, []);

    return null;
}
