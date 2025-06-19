'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentPersonality, getAgentColor, getAgentName } from '@/lib/ai/agent-personalities';

interface Message {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: 'question' | 'insight' | 'hypothesis' | 'challenge' | 'agreement';
  content: string;
  timestamp: Date;
  thinking?: string;
  confidence?: number;
}

interface AgentConversationProps {
  messages: Message[];
  activeAgents?: string[];
  onMessageClick?: (message: Message) => void;
  showThinking?: boolean;
  autoScroll?: boolean;
}

export function AgentConversation({ 
  messages, 
  activeAgents = [],
  onMessageClick,
  showThinking = true,
  autoScroll = true
}: AgentConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  return (
    <div className="relative bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-800">Agent Collaboration</h3>
        {activeAgents.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Active:</span>
            {activeAgents.map(agent => (
              <AgentIndicator key={agent} agent={agent} isActive={true} />
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="h-96 overflow-y-auto p-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <ConversationMessage
              key={message.id}
              message={message}
              isExpanded={expandedMessage === message.id}
              onToggle={() => setExpandedMessage(
                expandedMessage === message.id ? null : message.id
              )}
              onClick={() => onMessageClick?.(message)}
              showThinking={showThinking}
              delay={index * 0.05}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConversationMessage({ 
  message, 
  isExpanded,
  onToggle,
  onClick,
  showThinking,
  delay = 0
}: { 
  message: Message;
  isExpanded: boolean;
  onToggle: () => void;
  onClick?: () => void;
  showThinking: boolean;
  delay?: number;
}) {
  const fromPersonality = getAgentPersonality(message.from);
  const fromColor = getAgentColor(message.from);
  const fromName = getAgentName(message.from);

  const messageVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { delay, type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { x: 20, opacity: 0, transition: { duration: 0.2 } }
  };

  const getTypeIcon = () => {
    switch (message.type) {
      case 'question': return '❓';
      case 'insight': return '💡';
      case 'hypothesis': return '🔬';
      case 'challenge': return '⚡';
      case 'agreement': return '✅';
      default: return '💬';
    }
  };

  const getTypeColor = () => {
    switch (message.type) {
      case 'question': return 'bg-yellow-100 border-yellow-300';
      case 'insight': return 'bg-blue-100 border-blue-300';
      case 'hypothesis': return 'bg-purple-100 border-purple-300';
      case 'challenge': return 'bg-red-100 border-red-300';
      case 'agreement': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm shrink-0"
          style={{ backgroundColor: fromColor }}
        >
          {fromPersonality.avatar.icon}
        </div>

        {/* Message content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm" style={{ color: fromColor }}>
              {fromName}
            </span>
            {message.to !== 'broadcast' && (
              <>
                <span className="text-gray-400">→</span>
                <span className="font-semibold text-sm" style={{ color: getAgentColor(message.to) }}>
                  {getAgentName(message.to)}
                </span>
              </>
            )}
            <span className="text-xs text-gray-400">
              {getTypeIcon()}
            </span>
            {message.confidence !== undefined && (
              <span className="text-xs text-gray-500">
                {(message.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* Message bubble */}
          <div
            className={`
              relative inline-block rounded-lg px-4 py-2 cursor-pointer
              border transition-all group-hover:shadow-sm
              ${getTypeColor()}
            `}
            onClick={onToggle}
          >
            <p className="text-sm text-gray-800">{message.content}</p>
            
            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>

            {/* Expand indicator */}
            {(showThinking && message.thinking) && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="absolute bottom-1 right-1 text-gray-400"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L3 5h6L6 8z"/>
                </svg>
              </motion.div>
            )}
          </div>

          {/* Expanded thinking */}
          <AnimatePresence>
            {isExpanded && showThinking && message.thinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 ml-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                <Thinking agent={message.from}>
                  {message.thinking}
                </Thinking>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function Thinking({ agent, children }: { agent: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative pl-4 py-2 border-l-2 border-gray-300"
    >
      <div className="text-xs text-gray-500 mb-1 italic">
        {getAgentName(agent)}'s thinking...
      </div>
      <div className="text-sm text-gray-600">
        {children}
      </div>
    </motion.div>
  );
}

function AgentIndicator({ agent, isActive }: { agent: string; isActive: boolean }) {
  const personality = getAgentPersonality(agent);
  const color = getAgentColor(agent);
  const name = getAgentName(agent);

  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: color }}
        >
          {personality.avatar.icon}
        </div>
        {isActive && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full"
            style={{ 
              backgroundColor: color,
              filter: 'blur(4px)',
              zIndex: -1
            }}
          />
        )}
      </div>
      <span className="text-xs text-gray-600">{name}</span>
    </div>
  );
}

// Export individual components for composition
export function Message({ 
  from, 
  to, 
  type = 'insight',
  children 
}: { 
  from: string;
  to: string;
  type?: Message['type'];
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}