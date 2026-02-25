"use client";

import { socket } from "@/lib/websocket";
import {
  WebSocketEventData,
  WebSocketEventType,
  WebSocketMessageType,
} from "@/lib/websocket/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface WebSocketContextType {
  socket: typeof socket;
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (message: string) => void;
  sendEvent: (data: WebSocketEventData) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  on: (
    event: WebSocketEventType,
    callback: (data: WebSocketEventData["payload"]) => void,
  ) => void;
  off: (
    event: WebSocketEventType,
    callback: (data: WebSocketEventData["payload"]) => void,
  ) => void;
  listenMatchEvents: (matchId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = React.useState(
    () => socket && socket.connected,
  );

  const [isConnecting, setIsConnecting] = useState(false);

  const connect = () => {
    if (socket) {
      setIsConnecting(true);
      socket.connect();
      socket.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
      });
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket.on("disconnect", () => {
        setIsConnected(false);
      });
    }
  };

  const reconnect = () => {
    if (socket) {
      disconnect();
      connect();
    }
  };

  const sendEvent = (data: WebSocketEventData) => {
    if (isConnected) {
      socket.emit(data.event, data.payload);
    }
  };

  const on = useCallback(
    (
      event: WebSocketEventType,
      callback: (data: WebSocketEventData["payload"]) => void,
    ) => {
      if (socket) {
        socket.on(event, (data: WebSocketEventData["payload"]) => {
          callback(data);
        });
      }
    },
    [],
  );

  const off = useCallback(
    (
      event: WebSocketEventType,
      callback: (data: WebSocketEventData["payload"]) => void,
    ) => {
      if (socket) {
        socket.off(event, callback);
      }
    },
    [],
  );

  const sendMessage = (message: string) => {
    if (isConnected) {
      socket.send(message);
    }
  };

  const listenMatchEvents = (matchId: string) => {
    sendEvent({
      event: WebSocketMessageType.SUBSCRIBE_USER_ON_MATCH_CHANNEL,
      payload: { matchId },
    });
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    isConnecting,
    sendMessage,
    sendEvent,
    connect,
    disconnect,
    reconnect,
    on,
    off,
    listenMatchEvents,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
