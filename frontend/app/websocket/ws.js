'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
    const router = useRouter();
    const pathname = usePathname();

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
                } else {
                    if (pathname !== "/") router.push("/");
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                if (pathname !== "/") router.push("/");
            }
        }

        checkAuth();
    }, []);

    return null;
}
