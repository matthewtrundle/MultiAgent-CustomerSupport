import { WebSocket, WebSocketServer } from 'ws';
import { EnhancedAITransparencyTracker } from '@/lib/ai/enhanced-transparency';
import { thoughtStreamer } from '@/lib/ai/thought-streaming';
import type { AIEvent } from '@/lib/ai/transparency';

export interface SocketMessage {
  type: 'event' | 'thought_stream' | 'explore_request' | 'subscribe' | 'unsubscribe';
  data: any;
  timestamp: number;
  id: string;
}

export interface ExploreRequest {
  eventId: string;
  depth: 'surface' | 'detailed' | 'comprehensive';
  focus?: string[];
}

export interface ThoughtStreamUpdate {
  streamId: string;
  agent: string;
  thought: string;
  type: string;
  confidence?: number;
}

export class AITransparencySocket {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // clientId -> event types
  private tracker: EnhancedAITransparencyTracker;
  private eventBuffer: AIEvent[] = [];
  private bufferSize = 100;
  private flushInterval = 50; // ms

  constructor() {
    this.tracker = EnhancedAITransparencyTracker.getEnhancedInstance();
    this.setupEventListeners();
    this.startBufferFlush();
  }

  /**
   * Initialize WebSocket server
   */
  initializeServer(port: number = 3001): void {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      this.subscriptions.set(clientId, new Set(['all'])); // Default to all events

      console.log(`AI Transparency WebSocket client connected: ${clientId}`);

      // Send initial connection message
      this.sendToClient(clientId, {
        type: 'event',
        data: {
          type: 'connection',
          message: 'Connected to AI Transparency Stream',
          clientId
        },
        timestamp: Date.now(),
        id: this.generateId()
      });

      // Handle client messages
      ws.on('message', (message: string) => {
        try {
          const msg = JSON.parse(message) as SocketMessage;
          this.handleClientMessage(clientId, msg);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(clientId);
        this.subscriptions.delete(clientId);
        console.log(`AI Transparency WebSocket client disconnected: ${clientId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    console.log(`AI Transparency WebSocket server started on port ${port}`);
  }

  /**
   * Setup event listeners for transparency tracker
   */
  private setupEventListeners(): void {
    // Listen to all event types
    const eventTypes = ['prompt', 'response', 'thinking', 'interaction', 'decision', 'analysis', 
                       'debate', 'reasoning', 'learning', 'exploration', 'collaboration'];

    eventTypes.forEach(type => {
      this.tracker.addEventListener(type as any, (event: AIEvent) => {
        this.bufferEvent(event);
      });
    });
  }

  /**
   * Buffer events for batch sending
   */
  private bufferEvent(event: AIEvent): void {
    this.eventBuffer.push(event);
    
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Start periodic buffer flush
   */
  private startBufferFlush(): void {
    setInterval(() => {
      if (this.eventBuffer.length > 0) {
        this.flushBuffer();
      }
    }, this.flushInterval);
  }

  /**
   * Flush event buffer to clients
   */
  private flushBuffer(): void {
    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    events.forEach(event => {
      this.broadcastEvent(event);
    });
  }

  /**
   * Handle messages from clients
   */
  private handleClientMessage(clientId: string, message: SocketMessage): void {
    switch (message.type) {
      case 'explore_request':
        this.handleExploreRequest(clientId, message.data as ExploreRequest);
        break;
      
      case 'subscribe':
        this.handleSubscribe(clientId, message.data.eventTypes);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.data.eventTypes);
        break;
      
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle explore request for deeper information
   */
  private async handleExploreRequest(clientId: string, request: ExploreRequest): Promise<void> {
    // Get related events
    const relatedEvents = this.tracker.getEvents().filter(event => {
      // Find events related to the requested event
      return event.id === request.eventId || 
             (event.metadata && event.metadata.relatedTo === request.eventId) ||
             (event.agent === (this.tracker.getEvents().find(e => e.id === request.eventId)?.agent));
    });

    // Build exploration response based on depth
    const explorationData = {
      originalEvent: this.tracker.getEvents().find(e => e.id === request.eventId),
      relatedEvents: request.depth === 'surface' ? relatedEvents.slice(0, 5) :
                     request.depth === 'detailed' ? relatedEvents.slice(0, 15) :
                     relatedEvents, // comprehensive
      analysis: this.analyzeEventContext(request.eventId, relatedEvents),
      thoughtStreams: this.getRelatedThoughtStreams(request.eventId)
    };

    this.sendToClient(clientId, {
      type: 'event',
      data: {
        type: 'exploration_response',
        requestId: request.eventId,
        exploration: explorationData
      },
      timestamp: Date.now(),
      id: this.generateId()
    });
  }

  /**
   * Handle subscription updates
   */
  private handleSubscribe(clientId: string, eventTypes: string[]): void {
    const subscriptions = this.subscriptions.get(clientId);
    if (subscriptions) {
      eventTypes.forEach(type => subscriptions.add(type));
    }
  }

  /**
   * Handle unsubscribe requests
   */
  private handleUnsubscribe(clientId: string, eventTypes: string[]): void {
    const subscriptions = this.subscriptions.get(clientId);
    if (subscriptions) {
      eventTypes.forEach(type => subscriptions.delete(type));
    }
  }

  /**
   * Broadcast event to subscribed clients
   */
  private broadcastEvent(event: AIEvent): void {
    this.clients.forEach((ws, clientId) => {
      const subscriptions = this.subscriptions.get(clientId);
      
      // Check if client is subscribed to this event type
      if (subscriptions && (subscriptions.has('all') || subscriptions.has(event.type))) {
        this.sendToClient(clientId, {
          type: 'event',
          data: event,
          timestamp: Date.now(),
          id: this.generateId()
        });
      }
    });
  }

  /**
   * Stream a thought update
   */
  streamThought(update: ThoughtStreamUpdate): void {
    const message: SocketMessage = {
      type: 'thought_stream',
      data: update,
      timestamp: Date.now(),
      id: this.generateId()
    };

    // Broadcast to all clients
    this.clients.forEach((ws, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: SocketMessage): void {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
      }
    }
  }

  /**
   * Analyze event context for exploration
   */
  private analyzeEventContext(eventId: string, relatedEvents: AIEvent[]): any {
    const event = this.tracker.getEvents().find(e => e.id === eventId);
    if (!event) return null;

    return {
      eventType: event.type,
      agent: event.agent,
      timestamp: event.timestamp,
      relatedCount: relatedEvents.length,
      timeline: relatedEvents.map(e => ({
        time: e.timestamp,
        type: e.type,
        agent: e.agent
      })),
      patterns: this.findPatterns(relatedEvents)
    };
  }

  /**
   * Get related thought streams
   */
  private getRelatedThoughtStreams(eventId: string): any[] {
    // This would integrate with thoughtStreamer to get related streams
    // For now, return empty array
    return [];
  }

  /**
   * Find patterns in events
   */
  private findPatterns(events: AIEvent[]): string[] {
    const patterns: string[] = [];
    
    // Agent collaboration pattern
    const agents = new Set(events.map(e => e.agent));
    if (agents.size > 2) {
      patterns.push(`Multi-agent collaboration involving ${agents.size} agents`);
    }

    // Decision chain pattern
    const decisions = events.filter(e => e.type === 'decision');
    if (decisions.length > 1) {
      patterns.push(`Decision chain with ${decisions.length} decision points`);
    }

    // Thinking depth pattern
    const thoughts = events.filter(e => e.type === 'thinking');
    if (thoughts.length > 5) {
      patterns.push(`Deep thinking process with ${thoughts.length} thought events`);
    }

    return patterns;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.wss) {
      this.clients.forEach((ws, clientId) => {
        ws.close(1000, 'Server shutting down');
      });
      
      this.wss.close(() => {
        console.log('AI Transparency WebSocket server shut down');
      });
    }
  }
}

// Singleton instance
export const aiTransparencySocket = new AITransparencySocket();