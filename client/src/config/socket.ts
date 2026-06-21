import { io, type Socket } from "socket.io-client";

// The Socket.IO server shares the backend origin. VITE_BASE_URL ends in "/api",
// so strip that to get the socket origin.
const SOCKET_URL = (import.meta.env.VITE_BASE_URL || "").replace(/\/api\/?$/, "");

let socket: Socket | null = null;

/**
 * Lazily create a single shared Socket.IO connection, authenticated with the
 * stored JWT. Reused across the app so we never open duplicate connections.
 */
export const getSocket = (): Socket => {
    if (socket) return socket;
    socket = io(SOCKET_URL, {
        auth: { token: localStorage.getItem("auth_token") || "" },
        transports: ["websocket", "polling"], // try WS first, fall back to long-polling
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
    });
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
