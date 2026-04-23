import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setIsConnected(true);
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setWs(null);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = useCallback((messageString) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(messageString);
    }
  }, []);

  return { ws, isConnected, lastMessage, sendMessage };
}
