'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        path: '/api/socket',
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
    }

    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return { socket, isConnected };
}

export function useTicketSocket(ticketId: string) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !ticketId) return;

    // Join ticket room
    socket.emit('join:ticket', ticketId);

    // Listen for new messages
    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for agent processing status
    socket.on('agent:processing', (data) => {
      setIsAgentProcessing(data.status === 'started');
    });

    // Listen for errors
    socket.on('agent:error', (error) => {
      console.error('Agent error:', error);
      setIsAgentProcessing(false);
    });

    return () => {
      socket.emit('leave:ticket', ticketId);
      socket.off('message:new');
      socket.off('agent:processing');
      socket.off('agent:error');
    };
  }, [socket, isConnected, ticketId]);

  const sendMessage = (content: string, customerId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('message:send', {
      ticketId,
      content,
      customerId,
    });
  };

  return { messages, isAgentProcessing, sendMessage, isConnected };
}

export function useAgentActivity() {
  const { socket, isConnected } = useSocket();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to agent activity
    socket.emit('subscribe:agents');

    // Listen for agent activity updates
    socket.on('agent:activity', (activity) => {
      setActivities(prev => {
        const updated = [...prev];
        const index = updated.findIndex(a => a.agentType === activity.agentType);
        
        if (index >= 0) {
          updated[index] = { ...updated[index], ...activity };
        } else {
          updated.push(activity);
        }
        
        return updated;
      });
    });

    return () => {
      socket.off('agent:activity');
    };
  }, [socket, isConnected]);

  return activities;
}

export function useRealtimeMetrics() {
  const { socket, isConnected } = useSocket();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to metrics
    socket.emit('subscribe:metrics');

    // Listen for metrics updates
    socket.on('metrics:update', (data) => {
      setMetrics(data);
    });

    return () => {
      socket.off('metrics:update');
    };
  }, [socket, isConnected]);

  return metrics;
}