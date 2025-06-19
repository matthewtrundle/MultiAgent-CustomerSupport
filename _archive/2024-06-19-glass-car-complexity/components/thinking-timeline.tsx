'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentColor, getAgentName } from '@/lib/ai/agent-personalities';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  agent: string;
  type: 'thinking' | 'decision' | 'collaboration' | 'insight' | 'debate';
  title: string;
  description: string;
  confidence?: number;
  related?: string[];
  metadata?: Record<string, any>;
}

interface ThinkingTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  showConnections?: boolean;
  autoPlay?: boolean;
}

export function ThinkingTimeline({ 
  events, 
  onEventClick,
  showConnections = true,
  autoPlay = false
}: ThinkingTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Group events by agent
  const agentLanes = events.reduce((lanes, event) => {
    if (!lanes[event.agent]) {
      lanes[event.agent] = [];
    }
    lanes[event.agent].push(event);
    return lanes;
  }, {} as Record<string, TimelineEvent[]>);

  const agents = Object.keys(agentLanes);

  // Calculate timeline bounds
  const startTime = events.length > 0 ? 
    Math.min(...events.map(e => e.timestamp.getTime())) : Date.now();
  const endTime = events.length > 0 ? 
    Math.max(...events.map(e => e.timestamp.getTime())) : Date.now();
  const duration = endTime - startTime;

  const getEventPosition = (event: TimelineEvent) => {
    return ((event.timestamp.getTime() - startTime) / duration) * 100;
  };

  const getEventTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'thinking': return '💭';
      case 'decision': return '🎯';
      case 'collaboration': return '🤝';
      case 'insight': return '💡';
      case 'debate': return '⚖️';
      default: return '📍';
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">AI Thinking Timeline</h3>
          
          {/* Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              onClick={() => setPlaybackPosition(0)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ⏮️
            </button>
          </div>
        </div>

        {/* Time range */}
        <div className="mt-2 text-sm text-gray-500">
          {new Date(startTime).toLocaleTimeString()} - {new Date(endTime).toLocaleTimeString()}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Agent lanes */}
        {agents.map((agent, index) => (
          <div key={agent} className="mb-6 last:mb-0">
            {/* Agent label */}
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: getAgentColor(agent) }}
              >
                {getAgentName(agent).charAt(0)}
              </div>
              <span className="font-medium text-sm text-gray-700">
                {getAgentName(agent)}
              </span>
            </div>

            {/* Lane track */}
            <div className="relative h-16 bg-gray-50 rounded-lg border border-gray-200">
              {/* Background line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />

              {/* Events */}
              {agentLanes[agent].map(event => (
                <TimelineEventNode
                  key={event.id}
                  event={event}
                  position={getEventPosition(event)}
                  isSelected={selectedEvent === event.id}
                  onSelect={() => {
                    setSelectedEvent(event.id);
                    onEventClick?.(event);
                  }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Connections between related events */}
        {showConnections && (
          <svg 
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {events.filter(e => e.related && e.related.length > 0).map(event => {
              const fromY = agents.indexOf(event.agent) * 88 + 48;
              const fromX = (getEventPosition(event) / 100) * 100 + '%';

              return event.related!.map(relatedId => {
                const relatedEvent = events.find(e => e.id === relatedId);
                if (!relatedEvent) return null;

                const toY = agents.indexOf(relatedEvent.agent) * 88 + 48;
                const toX = (getEventPosition(relatedEvent) / 100) * 100 + '%';

                return (
                  <motion.path
                    key={`${event.id}-${relatedId}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 0.5 }}
                    d={`M ${fromX} ${fromY} Q ${fromX} ${(fromY + toY) / 2}, ${toX} ${toY}`}
                    stroke={getAgentColor(event.agent)}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                  />
                );
              });
            })}
          </svg>
        )}

        {/* Playback position indicator */}
        {isPlaying && (
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
            style={{ left: `${playbackPosition}%` }}
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            onAnimationComplete={() => setIsPlaying(false)}
          />
        )}
      </div>

      {/* Selected event details */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            {(() => {
              const event = events.find(e => e.id === selectedEvent);
              if (!event) return null;

              return (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {getEventTypeIcon(event.type)} {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Agent:</span>
                      <span className="ml-2 font-medium">{getAgentName(event.agent)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-2">{event.timestamp.toLocaleTimeString()}</span>
                    </div>
                    {event.confidence !== undefined && (
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <span className="ml-2">{(event.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>

                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Details</h5>
                      <div className="space-y-1">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-500">{key}:</span>
                            <span className="ml-2">{JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineEventNode({ 
  event, 
  position,
  isSelected,
  onSelect
}: { 
  event: TimelineEvent;
  position: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getEventTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'thinking': return 'bg-blue-500';
      case 'decision': return 'bg-green-500';
      case 'collaboration': return 'bg-purple-500';
      case 'insight': return 'bg-yellow-500';
      case 'debate': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.2 }}
      className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onSelect}
    >
      <div className="relative">
        {/* Event node */}
        <div className={`
          w-4 h-4 rounded-full ${getEventTypeColor(event.type)}
          ${isSelected ? 'ring-4 ring-offset-2' : ''}
        `} />
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {event.title}
          </div>
        </div>

        {/* Confidence indicator */}
        {event.confidence !== undefined && (
          <div 
            className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-white"
            style={{
              backgroundColor: event.confidence > 0.7 ? '#10b981' : 
                              event.confidence > 0.4 ? '#f59e0b' : '#ef4444'
            }}
          />
        )}
      </div>
    </motion.div>
  );
}