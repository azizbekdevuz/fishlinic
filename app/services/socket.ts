"use client";

import io, { Socket } from "socket.io-client";

export type SocketConnection = {
  socket: Socket;
  disconnect: () => void;
};

export function connectTelemetrySocket(url: string, options?: {
  transports?: ("websocket" | "polling")[];
  reconnectionAttempts?: number;
}): SocketConnection {
  const socket = io(url, {
    // Allow both websocket and polling so proxies/tunnels work reliably
    transports: options?.transports ?? ["websocket", "polling"],
    reconnectionAttempts: options?.reconnectionAttempts ?? 5
  });
  return {
    socket,
    disconnect: () => socket.disconnect()
  };
}


