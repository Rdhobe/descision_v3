import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;

  useEffect(() => {
    if (connectionAttemptsRef.current >= maxConnectionAttempts) {
      console.error('Max connection attempts reached, stopping reconnection attempts');
      setConnectionError(true);
      return;
    }

    // Initialize socket connection
    const socketInit = async () => {
      try {
        // Create socket connection directly
        const socket = io({
          reconnectionAttempts: 3,
          timeout: 10000,
          reconnectionDelay: 2000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
          setIsConnected(true);
          setConnectionError(false);
          connectionAttemptsRef.current = 0; // Reset connection attempts on successful connection
        });

        socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          connectionAttemptsRef.current += 1;
          setIsConnected(false);
          
          if (connectionAttemptsRef.current >= maxConnectionAttempts) {
            setConnectionError(true);
            socket.disconnect();
          }
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });
      } catch (error) {
        console.error('Socket initialization error:', error);
        connectionAttemptsRef.current += 1;
        setConnectionError(true);
      }
    };

    socketInit();

    // Cleanup socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join a chat room - make all socket operations null-safe
  const joinChat = useCallback((chatId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-chat', chatId);
    }
  }, [isConnected]);

  // Send a message through socket
  const sendMessage = useCallback((chatId: string, message: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', { chatId, message });
    }
  }, [isConnected]);

  // Typing indicators
  const startTyping = useCallback((chatId: string, userId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-start', { chatId, userId });
    }
  }, [isConnected]);

  const stopTyping = useCallback((chatId: string, userId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-stop', { chatId, userId });
    }
  }, [isConnected]);

  // Add listeners for events
  const onReceiveMessage = useCallback((callback: (message: any) => void) => {
    if (socketRef.current && isConnected) {
      socketRef.current.on('receive-message', callback);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off('receive-message', callback);
        }
      };
    }
    return () => {};
  }, [isConnected]);

  const onUserTyping = useCallback((callback: (data: { userId: string, isTyping: boolean }) => void) => {
    if (socketRef.current && isConnected) {
      socketRef.current.on('user-typing', callback);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off('user-typing', callback);
        }
      };
    }
    return () => {};
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    onReceiveMessage,
    onUserTyping
  };
}; 