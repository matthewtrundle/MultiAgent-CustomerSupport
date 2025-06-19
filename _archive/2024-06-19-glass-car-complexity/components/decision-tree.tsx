'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentColor, getAgentName } from '@/lib/ai/agent-personalities';

interface DecisionOption {
  id: string;
  title: string;
  description?: string;
  pros: string[];
  cons: string[];
  confidence: number;
  selected: boolean;
  rejected?: boolean;
  rejectionReason?: string;
}

interface DecisionTreeProps {
  agent: string;
  decision: string;
  options: DecisionOption[];
  reasoning?: string;
  onOptionClick?: (optionId: string) => void;
}

export function DecisionTree({ 
  agent, 
  decision,
  options, 
  reasoning,
  onOptionClick 
}: DecisionTreeProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const agentColor = getAgentColor(agent);
  const agentName = getAgentName(agent);

  const selectedOption = options.find(opt => opt.selected);
  const rejectedOptions = options.filter(opt => !opt.selected);

  return (
    <div className="relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: `${agentColor}20`,
              color: agentColor
            }}
          >
            {agentName}'s Decision
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{decision}</h3>
        {reasoning && (
          <p className="text-sm text-gray-600 mt-1">{reasoning}</p>
        )}
      </div>

      {/* Decision Tree Visualization */}
      <div className="relative">
        {/* Root node */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto w-4 h-4 rounded-full bg-gray-600"
        />

        {/* Branches */}
        <div className="flex justify-center mt-8 gap-6">
          {/* Selected path */}
          {selectedOption && (
            <div className="relative">
              {/* Connection line */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 32 }}
                className="absolute left-1/2 -top-8 w-0.5 bg-green-500 transform -translate-x-1/2"
              />
              
              <DecisionOption
                option={selectedOption}
                isSelected={true}
                isExpanded={expandedOption === selectedOption.id}
                onToggle={() => setExpandedOption(
                  expandedOption === selectedOption.id ? null : selectedOption.id
                )}
                onClick={() => onOptionClick?.(selectedOption.id)}
              />
            </div>
          )}

          {/* Rejected paths */}
          {rejectedOptions.map((option, index) => (
            <div key={option.id} className="relative">
              {/* Connection line */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 32 }}
                transition={{ delay: index * 0.1 }}
                className="absolute left-1/2 -top-8 w-0.5 bg-gray-300 transform -translate-x-1/2"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #d1d5db 2px, #d1d5db 4px)'
                }}
              />
              
              <DecisionOption
                option={option}
                isSelected={false}
                isExpanded={expandedOption === option.id}
                onToggle={() => setExpandedOption(
                  expandedOption === option.id ? null : option.id
                )}
                onClick={() => onOptionClick?.(option.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500" />
          <span>Selected Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-0.5"
            style={{
              backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, #d1d5db 2px, #d1d5db 4px)'
            }}
          />
          <span>Rejected Path</span>
        </div>
      </div>
    </div>
  );
}

function DecisionOption({ 
  option, 
  isSelected, 
  isExpanded,
  onToggle,
  onClick
}: { 
  option: DecisionOption;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onClick?: () => void;
}) {
  const nodeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={nodeVariants}
      initial="initial"
      animate="animate"
      className={`
        relative p-4 rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'bg-green-50 border-2 border-green-300 shadow-md' 
          : 'bg-white border-2 border-gray-200 opacity-75 hover:opacity-100'
        }
      `}
      style={{ minWidth: '200px' }}
      onClick={onToggle}
    >
      {/* Status indicator */}
      <div className="absolute -top-2 -right-2">
        {isSelected ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M11.5 3.5L5.5 9.5L2.5 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.div>
        )}
      </div>

      {/* Option title */}
      <h4 className={`font-semibold mb-2 ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>
        {option.title}
      </h4>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Confidence</span>
          <span className={isSelected ? 'text-green-600' : 'text-gray-600'}>
            {(option.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${option.confidence * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isSelected ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Description */}
      {option.description && (
        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
      )}

      {/* Expand/Collapse indicator */}
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-gray-400"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 10.5L4 6.5h8L8 10.5z"/>
          </svg>
        </motion.div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {/* Pros */}
            {option.pros.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-semibold text-green-700 mb-1">Pros</h5>
                <ul className="space-y-1">
                  {option.pros.map((pro, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-xs text-gray-600 flex items-start gap-1"
                    >
                      <span className="text-green-500 mt-0.5">+</span>
                      <span>{pro}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {option.cons.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-semibold text-red-700 mb-1">Cons</h5>
                <ul className="space-y-1">
                  {option.cons.map((con, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-xs text-gray-600 flex items-start gap-1"
                    >
                      <span className="text-red-500 mt-0.5">-</span>
                      <span>{con}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rejection reason */}
            {!isSelected && option.rejectionReason && (
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
                <span className="font-semibold">Why rejected:</span> {option.rejectionReason}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Option({ 
  children, 
  selected = false,
  confidence = 0.5
}: { 
  children: React.ReactNode;
  selected?: boolean;
  confidence?: number;
}) {
  return <div>{children}</div>;
}

export function Pros({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function Cons({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}