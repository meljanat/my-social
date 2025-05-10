// "use client";
export let websocket;

export const connectWebSocket = function () {
    websocket = new WebSocket('ws://localhost:8404/ws');
    websocket.onopen = () => {
        console.log("Websocket connection open.");
    }

    websocket.console = () => {
        console.log("Websocket connection closed.");
    }

    websocket.onerror = (error) => {
        console.error("Websocket encountered an error:", error);
    }
}

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
