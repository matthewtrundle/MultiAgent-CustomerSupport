'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentPersonality, getAgentColor, getAgentName } from '@/lib/ai/agent-personalities';

interface ThoughtBubbleProps {
  agent: string;
  type: 'thinking' | 'analyzing' | 'questioning' | 'concluding';
  children: React.ReactNode;
  confidence?: number;
  isActive?: boolean;
  onExplore?: () => void;
}

interface Evidence {
  text: string;
  strength: 'strong' | 'moderate' | 'weak';
}

interface Hypothesis {
  text: string;
  confidence: number;
}

export function ThoughtBubble({ 
  agent, 
  type, 
  children, 
  confidence = 0.5,
  isActive = true,
  onExplore 
}: ThoughtBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const personality = getAgentPersonality(agent);
  const agentColor = getAgentColor(agent);
  const agentName = getAgentName(agent);

  const bubbleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'thinking': return '💭';
      case 'analyzing': return '🔍';
      case 'questioning': return '❓';
      case 'concluding': return '✨';
      default: return '💭';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'thinking': return 'from-blue-50 to-blue-100';
      case 'analyzing': return 'from-purple-50 to-purple-100';
      case 'questioning': return 'from-yellow-50 to-yellow-100';
      case 'concluding': return 'from-green-50 to-green-100';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={bubbleVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative mb-4"
      >
        {/* Agent Avatar */}
        <div className="flex items-start gap-3">
          <motion.div
            animate={isActive ? pulseVariants.animate : {}}
            className="relative"
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: agentColor }}
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
                  backgroundColor: agentColor,
                  filter: 'blur(8px)',
                  zIndex: -1
                }}
              />
            )}
          </motion.div>

          {/* Thought Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold" style={{ color: agentColor }}>
                {agentName}
              </span>
              <span className="text-xs text-gray-500">{getTypeIcon()}</span>
              {confidence !== undefined && (
                <span className="text-xs text-gray-500">
                  {(confidence * 100).toFixed(0)}% confident
                </span>
              )}
            </div>

            <motion.div
              className={`
                relative rounded-2xl p-4 shadow-sm
                bg-gradient-to-br ${getTypeColor()}
                border border-gray-200/50
                ${onExplore ? 'cursor-pointer' : ''}
              `}
              whileHover={onExplore ? { scale: 1.02 } : {}}
              onClick={() => onExplore && setIsExpanded(!isExpanded)}
            >
              {/* Thought bubble tail */}
              <div 
                className={`
                  absolute -left-2 top-4 w-4 h-4 
                  bg-gradient-to-br ${getTypeColor()}
                  transform rotate-45
                  border-l border-b border-gray-200/50
                `}
              />

              {/* Content */}
              <div className="relative z-10">
                {children}
              </div>

              {/* Confidence indicator */}
              {confidence !== undefined && (
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: confidence > 0.7 ? '#10b981' : 
                                      confidence > 0.4 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              )}

              {/* Explore indicator */}
              {onExplore && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="absolute bottom-2 right-2 text-gray-400"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 10.5L4 6.5h8L8 10.5z"/>
                  </svg>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Thinking indicators */}
        {isActive && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-2 left-16 flex gap-1"
          >
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function ThoughtProcess({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function Evidence({ children, strength = 'moderate' }: { children: React.ReactNode; strength?: Evidence['strength'] }) {
  const strengthColors = {
    strong: 'bg-green-100 text-green-800 border-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    weak: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
        border ${strengthColors[strength]}
      `}
    >
      <span className="text-xs">📊</span>
      {children}
    </motion.div>
  );
}

export function Hypothesis({ children, confidence }: { children: React.ReactNode; confidence: number }) {
  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-2 pl-4 border-l-2 border-gray-300"
    >
      <div className="font-medium text-gray-700">Hypothesis:</div>
      <div className="text-gray-600">{children}</div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">Confidence:</span>
        <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          />
        </div>
        <span className="text-xs text-gray-600">{(confidence * 100).toFixed(0)}%</span>
      </div>
    </motion.div>
  );
}