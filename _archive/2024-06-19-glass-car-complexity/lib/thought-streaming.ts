import { EnhancedAITransparencyTracker } from './enhanced-transparency';

export interface ThoughtStream {
  id: string;
  agent: string;
  startTime: Date;
  thoughts: ThoughtFragment[];
  status: 'active' | 'paused' | 'completed';
}

export interface ThoughtFragment {
  id: string;
  timestamp: Date;
  content: string;
  type: 'initial' | 'processing' | 'questioning' | 'insight' | 'conclusion';
  confidence?: number;
  relatedTo?: string[]; // IDs of related thoughts
}

export class ThoughtStreamManager {
  private activeStreams: Map<string, ThoughtStream> = new Map();
  private tracker: EnhancedAITransparencyTracker;

  constructor() {
    this.tracker = EnhancedAITransparencyTracker.getEnhancedInstance();
  }

  // Start a new thought stream for an agent
  startStream(agent: string): string {
    const streamId = this.generateId();
    const stream: ThoughtStream = {
      id: streamId,
      agent,
      startTime: new Date(),
      thoughts: [],
      status: 'active'
    };
    
    this.activeStreams.set(streamId, stream);
    this.tracker.trackThinking(agent, `Starting thought stream for new analysis...`, {
      stream_id: streamId,
      status: 'started'
    });
    
    return streamId;
  }

  // Add a thought fragment to an active stream
  addThought(
    streamId: string,
    content: string,
    type: ThoughtFragment['type'],
    confidence?: number,
    relatedTo?: string[]
  ): void {
    const stream = this.activeStreams.get(streamId);
    if (!stream || stream.status !== 'active') {
      throw new Error(`No active stream found with ID: ${streamId}`);
    }

    const thought: ThoughtFragment = {
      id: this.generateId(),
      timestamp: new Date(),
      content,
      type,
      confidence,
      relatedTo
    };

    stream.thoughts.push(thought);
    
    // Track each thought fragment
    this.tracker.trackThinking(stream.agent, content, {
      stream_id: streamId,
      fragment_id: thought.id,
      fragment_type: type,
      confidence,
      thought_number: stream.thoughts.length
    });
  }

  // Pause a stream (e.g., waiting for external input)
  pauseStream(streamId: string, reason: string): void {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return;

    stream.status = 'paused';
    this.tracker.trackThinking(stream.agent, `Pausing thoughts: ${reason}`, {
      stream_id: streamId,
      status: 'paused'
    });
  }

  // Resume a paused stream
  resumeStream(streamId: string): void {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return;

    stream.status = 'active';
    this.tracker.trackThinking(stream.agent, 'Resuming thought process...', {
      stream_id: streamId,
      status: 'resumed'
    });
  }

  // Complete a stream and generate summary
  completeStream(streamId: string, conclusion: string): void {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      console.warn(`Stream ${streamId} not found, skipping completion`);
      return;
    }

    // Only add conclusion if stream is still active
    if (stream.status === 'active') {
      stream.status = 'completed';
      
      // Add final conclusion thought
      const thought: ThoughtFragment = {
        id: this.generateId(),
        timestamp: new Date(),
        content: conclusion,
        type: 'conclusion',
        confidence: undefined,
        relatedTo: undefined
      };
      stream.thoughts.push(thought);
      
      // Track the conclusion
      this.tracker.trackThinking(stream.agent, conclusion, {
        stream_id: streamId,
        fragment_id: thought.id,
        fragment_type: 'conclusion',
        thought_number: stream.thoughts.length
      });
    }
    
    // Generate thought summary
    const summary = this.summarizeStream(stream);
    
    this.tracker.trackThinking(stream.agent, `Thought stream completed: ${conclusion}`, {
      stream_id: streamId,
      status: 'completed',
      total_thoughts: stream.thoughts.length,
      duration_ms: Date.now() - stream.startTime.getTime(),
      summary
    });
  }

  // Get current thoughts from a stream
  getStreamThoughts(streamId: string): ThoughtFragment[] {
    const stream = this.activeStreams.get(streamId);
    return stream ? [...stream.thoughts] : [];
  }

  // Create a branching thought (exploring alternatives)
  branchThought(
    streamId: string,
    fromThoughtId: string,
    branchContent: string
  ): string {
    const newStreamId = this.startStream(this.activeStreams.get(streamId)?.agent || 'unknown');
    
    this.addThought(
      newStreamId,
      `Exploring alternative path: ${branchContent}`,
      'initial',
      undefined,
      [fromThoughtId]
    );
    
    return newStreamId;
  }

  private summarizeStream(stream: ThoughtStream): any {
    const thoughtTypes = stream.thoughts.reduce((acc, thought) => {
      acc[thought.type] = (acc[thought.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence = stream.thoughts
      .filter(t => t.confidence !== undefined)
      .reduce((sum, t) => sum + (t.confidence || 0), 0) / 
      stream.thoughts.filter(t => t.confidence !== undefined).length;

    return {
      thought_types: thoughtTypes,
      average_confidence: avgConfidence || 0,
      key_insights: stream.thoughts
        .filter(t => t.type === 'insight')
        .map(t => t.content)
        .slice(0, 3)
    };
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const thoughtStreamer = new ThoughtStreamManager();