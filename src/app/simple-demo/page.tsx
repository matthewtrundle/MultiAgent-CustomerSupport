'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './demo.css';

interface ThoughtBubble {
  agent: string;
  color: string;
  thought: string;
  confidence: number;
  timestamp: number;
  final?: boolean;
  isArgument?: boolean;
}

const agentEmojis: Record<string, string> = {
  'Alex': '🧠',
  'Sophia': '💚',
  'Marina': '📊',
  'Marcus': '🏗️',
  'Chad': '🚀'
};

export default function SimpleGlassCarDemo() {
  const [question, setQuestion] = useState('My startup\'s AI keeps writing poetry instead of code. How do I fix this?');
  const [thoughts, setThoughts] = useState<ThoughtBubble[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu && !(event.target as Element).closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  const processQuestion = async () => {
    setIsProcessing(true);
    setThoughts([]);
    
    try {
      const response = await fetch('/api/simple-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.ok) throw new Error('Failed to process');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (!data.error) {
                  setThoughts(prev => [...prev, data]);
                }
              } catch (err) {
                console.error('Parse error:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setThoughts(prev => [...prev, {
        agent: 'System',
        color: 'red',
        thought: 'Sorry, I encountered an error. Please try again.',
        confidence: 0,
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getShareableConversation = () => {
    if (thoughts.length === 0) return '';
    
    const dramaLevel = thoughts.filter(t => t.isArgument).length;
    const spiceRating = dramaLevel === 0 ? '😌 Peaceful' : dramaLevel <= 2 ? '🌶️ Mild' : dramaLevel <= 4 ? '🌶️🌶️ Spicy' : '🌶️🌶️🌶️ HEATED!';
    const finalDecision = thoughts.find(t => t.final);
    
    let summary = `\n\n📝 Question: "${question}"\n\n`;
    summary += `🔥 Drama Level: ${spiceRating}\n\n`;
    
    if (dramaLevel > 0) {
      const argument = thoughts.find(t => t.isArgument);
      if (argument) {
        summary += `💬 Best Argument:\n"${argument.thought}" - ${argument.agent}\n\n`;
      }
    }
    
    if (finalDecision) {
      summary += `✅ Final Decision:\n"${finalDecision.thought.split('\n')[0]}"\n\n`;
    }
    
    return summary;
  };

  const shareToLinkedIn = () => {
    const conversation = getShareableConversation();
    const text = encodeURIComponent(`Just watched 5 AI agents get salty while solving this problem! 🣧🔥${conversation}Try "Agents Being Salty" yourself and see what roasts your question gets!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`, '_blank');
  };

  const copyShareMessage = () => {
    const conversation = getShareableConversation();
    const message = `🣧 Agents Being Salty 🔥

Watch opinionated AI agents roast each other while solving your problems!

Meet the salty squad:
• Alex (🧠): Overthinking orchestrator  
• Sophia (💚): Feelings police
• Marina (📊): "Actually..." expert
• Marcus (🏗️): Just ship it bro
• Chad (🚀): Everything needs blockchain
${conversation}
They throw shade, argue, and somehow find solutions. It's like a tech Twitter thread come to life! 

Try it yourself: ${window.location.href}

#AI #AIAgents #TechHumor #Innovation #FutureOfWork`;

    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with animations */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Agents Being Salty
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl">Watch opinionated AI agents roast each other while solving your problems</p>
          
          {/* Alternative names with hover effect */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-gray-400">
            <span>Also known as:</span>
            <button className="hover:text-gray-600 transition-colors duration-200 hover:scale-105">Silicon Valley Therapy Session</button>
            <span>•</span>
            <button className="hover:text-gray-600 transition-colors duration-200 hover:scale-105">The Great AI Debate-acle</button>
            <span>•</span>
            <button className="hover:text-gray-600 transition-colors duration-200 hover:scale-105">The Roast Protocol</button>
            <span>•</span>
            <button className="hover:text-gray-600 transition-colors duration-200 hover:scale-105">AgentGPT: Civil War</button>
          </div>
        </motion.div>

        {/* How it Works Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ask a Question</h3>
                <p className="text-sm text-gray-600">Type any business or technical challenge</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">AI Agents Debate</h3>
                <p className="text-sm text-gray-600">Watch 5 specialized agents analyze & argue</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Get Solutions</h3>
                <p className="text-sm text-gray-600">Receive a consensus-driven action plan</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agent Intro Cards with hover effects */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {Object.entries({
            alex: { name: 'Alex', color: 'purple', emoji: '🧠', role: 'The Orchestrator', desc: 'Analyzes problems & makes final calls. Sometimes too cautious.' },
            sophia: { name: 'Sophia', color: 'green', emoji: '💚', role: 'The Empath', desc: 'Obsesses over feelings. Often clashes with Marcus on priorities.' },
            marina: { name: 'Marina', color: 'blue', emoji: '📊', role: 'The Data Nerd', desc: 'Lives for patterns & stats. Annoys others with "actually..." corrections.' },
            marcus: { name: 'Marcus', color: 'orange', emoji: '🏗️', role: 'The Pragmatist', desc: 'Just wants to ship. Fights with Sophia about "touchy-feely stuff".' },
            chad: { name: 'Chad', color: 'yellow', emoji: '🚀', role: 'The Crypto Bro', desc: 'Everything is blockchain. Says "ser" unironically. The others roll their eyes.' }
          }).map(([key, agent], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-lg transition-shadow duration-300 cursor-pointer agent-card-${agent.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{agent.emoji}</span>
                <h3 className={`font-semibold agent-name-${agent.color}`}>{agent.name}</h3>
              </div>
              <p className="text-xs text-gray-600">{agent.role}</p>
              <p className="text-xs text-gray-500 mt-1">{agent.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Input Section with better styling */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="relative">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full p-4 pr-12 border-2 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:outline-none transition-colors duration-200"
              disabled={isProcessing}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && question.trim() && processQuestion()}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-2xl">💭</span>
            </div>
          </div>
          <button 
            onClick={processQuestion}
            disabled={isProcessing || !question.trim()}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                AI agents are thinking...
              </span>
            ) : (
              'Watch AI Think'
            )}
          </button>
        </motion.div>

        {/* Sample Questions with better hover states */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-sm text-gray-700 font-medium mb-3">Try these questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'My startup\'s AI keeps writing poetry instead of code. How do I fix this?',
              'Should I pivot my dating app for cats to a B2B SaaS?',
              'My cofounder only communicates in memes. Is this scalable?',
              'VC wants 90% equity for $100. Good deal?'
            ].map((q) => (
              <motion.button
                key={q}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuestion(q)}
                className="text-xs px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 border border-gray-300"
                disabled={isProcessing}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Drama Meter with smoother animations */}
        <AnimatePresence>
          {thoughts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Drama Level</span>
                <motion.span 
                  key={thoughts.filter(t => t.isArgument).length}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-gray-500"
                >
                  {thoughts.filter(t => t.isArgument).length > 0 ? '🔥 Getting spicy!' : '😌 All peaceful'}
                </motion.span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(thoughts.filter(t => t.isArgument).length * 25, 100)}%` 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking Area with better animations */}
        <AnimatePresence>
          <div className="space-y-4">
            {/* Show loading skeleton when processing but no thoughts yet */}
            {isProcessing && thoughts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {thoughts.map((thought, index) => (
              <motion.div
                key={`${thought.agent}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className={`flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm border ${
                  thought.isArgument ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } hover:shadow-md transition-shadow duration-200`}>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      thought.isArgument ? 'animate-pulse' : ''
                    }`}
                    style={{ backgroundColor: `${getColorHex(thought.color)}20` }}
                  >
                    <span className="text-xl">{agentEmojis[thought.agent] || '🤖'}</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="font-semibold"
                        style={{ color: getColorHex(thought.color) }}
                      >
                        {thought.agent}
                      </span>
                      {thought.isArgument && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full"
                        >
                          arguing
                        </motion.span>
                      )}
                      <span className="text-xs text-gray-500">{thought.confidence}% confident</span>
                    </div>
                    {thought.final ? (
                      <div className="space-y-3">
                        <p className="text-gray-700 whitespace-pre-wrap">{thought.thought}</p>
                        {thought.thought.includes('Decision:') && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                          >
                            <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              Action Plan
                            </h4>
                            <div className="text-sm text-gray-700 space-y-2">
                              {extractActionSteps(thought.thought).map((step, idx) => (
                                <motion.div 
                                  key={idx} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * idx }}
                                  className="flex items-start gap-2"
                                >
                                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                    {idx + 1}
                                  </span>
                                  <span>{step}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{thought.thought}</p>
                    )}
                    {!thought.final && isProcessing && index === thoughts.length - 1 && (
                      <div className="flex gap-1 mt-2">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Success indicator with animation */}
        <AnimatePresence>
          {thoughts.length > 0 && thoughts[thoughts.length - 1]?.final && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "backOut" }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI thinking complete
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="relative inline-block share-menu-container">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 hover-lift"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.316C18.114 14.062 18 13.518 18 13c0-.482.114-.938.316-1.342m0 2.684a3 3 0 110-2.684M3.316 11.342C3.886 10.938 4 10.482 4 10c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684" />
              </svg>
              Share this Demo
            </button>
            
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]"
                >
                  <button
                    onClick={shareToLinkedIn}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                  >
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={copyShareMessage}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm text-gray-700"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copiedMessage ? 'Copied!' : 'Copy Message'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-gray-200 text-center"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Built with</h3>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded-full">Next.js 14</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">TypeScript</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">Tailwind CSS</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">Framer Motion</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">OpenRouter AI</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Agents Being Salty - Where AI personalities clash and solutions emerge
          </p>
        </motion.footer>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    purple: '#8B5CF6',
    green: '#10B981',
    blue: '#3B82F6',
    orange: '#F97316',
    red: '#EF4444',
    yellow: '#F59E0B'
  };
  return colors[color] || '#6B7280';
}

function extractActionSteps(text: string): string[] {
  const lines = text.split('\n');
  const steps: string[] = [];
  
  for (const line of lines) {
    if (line.match(/^\d+\.|^[-•*]/)) {
      steps.push(line.replace(/^\d+\.|^[-•*]\s*/, '').trim());
    } else if (line.includes('First,') || line.includes('Then,') || line.includes('Finally,')) {
      steps.push(line.trim());
    }
  }
  
  if (steps.length === 0 && text.includes('Decision:')) {
    const decisionText = text.split('Decision:')[1].trim();
    const sentences = decisionText.split(/[.!?]+/).filter(s => s.trim());
    return sentences.slice(0, 3).map(s => s.trim());
  }
  
  return steps;
}