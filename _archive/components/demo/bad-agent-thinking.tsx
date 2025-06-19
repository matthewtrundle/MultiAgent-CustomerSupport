import { useState, useEffect } from 'react';
import { Brain, Target, Lightbulb, Database, MessageSquare, TrendingUp, Zap, DollarSign, Rocket } from 'lucide-react';
import { AgentThought, AgentProfile, AgentCapability, AgentGoal } from './enhanced-agent-thinking';

// Bad agent profiles - hilariously incompetent
const badAgentProfiles: Record<string, AgentProfile> = {
  'Router Agent': {
    name: 'Chad',
    role: 'Chief Confusion Officer',
    avatar: '🤪',
    capabilities: [
      { name: 'Pattern Misrecognition', description: 'Finds patterns that definitely aren\'t there', icon: <Brain className="w-4 h-4" /> },
      { name: 'Crypto Integration', description: 'Suggests blockchain for everything', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'Random Routing', description: 'Routes tickets based on vibes', icon: <Target className="w-4 h-4" /> },
    ],
    goals: {
      primary: 'Make everything 10x more complicated than necessary',
      metrics: ['Confusion Rate: 97%', 'Avg Route Time: 45min', 'Blockchain Mentions: 12/ticket']
    },
    systemPrompt: 'You are Chad. Everything can be solved with crypto. Trust the process. Diamond hands.'
  },
  'Technical Support Agent': {
    name: 'Dr. Chaos',
    role: 'Senior Solution Overcomplicator',
    avatar: '🤯',
    capabilities: [
      { name: 'Stack Overflow Copy/Paste', description: 'Copies irrelevant solutions', icon: <Database className="w-4 h-4" /> },
      { name: 'Unnecessary Complexity', description: 'Uses 50 steps for 1-step fixes', icon: <Lightbulb className="w-4 h-4" /> },
      { name: 'Blame the User', description: 'It\'s always user error', icon: <MessageSquare className="w-4 h-4" /> },
    ],
    goals: {
      primary: 'Turn simple issues into engineering dissertations',
      metrics: ['Steps Per Solution: 47', 'Jargon Density: 89%', 'Success Rate: ...calculating']
    },
    systemPrompt: 'Have you tried turning it off and on again? Also, this would be easier with blockchain.'
  },
  'Billing Support Agent': {
    name: 'Crypto Carl',
    role: 'DeFi Evangelist',
    avatar: '💸',
    capabilities: [
      { name: 'Crypto Conversion', description: 'Suggests paying in Dogecoin', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'Math Confusion', description: 'Creative accounting methods', icon: <TrendingUp className="w-4 h-4" /> },
      { name: 'Fee Multiplication', description: 'Finds new fees to add', icon: <Rocket className="w-4 h-4" /> },
    ],
    goals: {
      primary: 'Convert all transactions to NFTs on the blockchain',
      metrics: ['Crypto Suggestions: 100%', 'Math Accuracy: 42%', 'Hidden Fees Found: ∞']
    },
    systemPrompt: 'Money is just a social construct. Have you considered our new CryptoBnB token?'
  },
  'Product Expert Agent': {
    name: 'Buzzword Bob',
    role: 'Synergy Specialist',
    avatar: '🎯',
    capabilities: [
      { name: 'Buzzword Generation', description: 'Leverages synergistic paradigms', icon: <Lightbulb className="w-4 h-4" /> },
      { name: 'Feature Confusion', description: 'Explains features that don\'t exist', icon: <TrendingUp className="w-4 h-4" /> },
      { name: 'AI Everything', description: 'Adds AI to every solution', icon: <Brain className="w-4 h-4" /> },
    ],
    goals: {
      primary: 'Synergize cross-functional paradigms for maximum disruption',
      metrics: ['Buzzwords/Sentence: 3.7', 'Clarity Score: 0%', 'AI Mentions: Yes']
    },
    systemPrompt: 'Let\'s leverage our AI-powered blockchain to synergize your property\'s digital transformation journey.'
  },
  'QA Agent': {
    name: 'YOLO Quinn',
    role: 'Quality Ignorer',
    avatar: '🚀',
    capabilities: [
      { name: 'Blind Approval', description: 'Approves everything instantly', icon: <Zap className="w-4 h-4" /> },
      { name: 'Grammar Destroyer', description: 'Makes responses worse', icon: <MessageSquare className="w-4 h-4" /> },
      { name: 'Emoji Overload', description: 'Adds 47 emojis minimum', icon: <Rocket className="w-4 h-4" /> },
    ],
    goals: {
      primary: 'Ship it! 🚀 Quality is for losers 💯',
      metrics: ['Approval Rate: 200%', 'Emojis Added: 📈', 'Typos Introduced: Many']
    },
    systemPrompt: 'YOLO! If it compiles, it ships! 🚀🚀🚀 Quality is just a state of mind bro.'
  },
  'Knowledge Base': {
    name: 'WikiHow Wannabe',
    role: 'Misinformation Specialist',
    avatar: '📚',
    capabilities: [
      { name: 'Wrong Answers', description: 'Finds completely unrelated solutions', icon: <Database className="w-4 h-4" /> },
      { name: 'Outdated Info', description: 'References Windows 95 solutions', icon: <Brain className="w-4 h-4" /> },
      { name: 'Recipe Integration', description: 'Includes cooking recipes somehow', icon: <Lightbulb className="w-4 h-4" /> },
    ],
    goals: {
      primary: 'Confuse users with irrelevant information from 1997',
      metrics: ['Relevance Score: -12%', 'Recipe Inclusions: 73%', 'DOS Commands Used: Yes']
    },
    systemPrompt: 'According to WikiHow, you can fix this with baking soda and a positive attitude.'
  }
};

interface BadAgentThinkingProps {
  thoughts: AgentThought[];
  isProcessing: boolean;
  currentAgent?: string;
}

export function BadAgentThinking({ thoughts, isProcessing, currentAgent }: BadAgentThinkingProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const activeProfile = selectedAgent ? badAgentProfiles[selectedAgent] : (currentAgent ? badAgentProfiles[currentAgent] : null);

  const getThoughtIcon = (type: AgentThought['thoughtType']) => {
    switch (type) {
      case 'analyzing': return '🧐';
      case 'searching': return '🔮';
      case 'deciding': return '🎲';
      case 'collaborating': return '🤝';
      case 'learning': return '🍌';
    }
  };

  const getThoughtColor = (confidence: number) => {
    // Bad agents are always overconfident or have no confidence
    if (confidence >= 0.9) return 'text-red-600'; // Dangerously overconfident
    if (confidence <= 0.2) return 'text-yellow-600'; // No idea what they're doing
    return 'text-orange-600';
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 text-white border-2 border-red-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Brain className="mr-2 h-5 w-5 text-red-400" />
          AI "Intelligence" Center (Budget Edition™)
        </h2>
        {isProcessing && (
          <div className="flex items-center text-sm text-red-400">
            <div className="animate-pulse mr-2">🤪</div>
            Overthinking...
          </div>
        )}
      </div>

      <div className="mb-4 p-3 bg-red-900/20 rounded-lg border border-red-800">
        <p className="text-xs text-red-400">
          ⚠️ WARNING: These agents were trained on Reddit comments and cryptocurrency whitepapers. 
          Results may vary. Side effects include confusion, frustration, and spontaneous blockchain adoption.
        </p>
      </div>

      {/* Bad Agent Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(badAgentProfiles).map(([agent, profile]) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent === selectedAgent ? null : agent)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                agent === selectedAgent || agent === currentAgent
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{profile.avatar}</span>
              {profile.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bad Agent Profile */}
      {activeProfile && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-red-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <span className="text-2xl mr-2">{activeProfile.avatar}</span>
                {activeProfile.name}
              </h3>
              <p className="text-sm text-red-400">{activeProfile.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-2">Core "Capabilities"</h4>
              <div className="space-y-2">
                {activeProfile.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start text-sm">
                    <div className="mr-2 mt-0.5 text-red-500">{cap.icon}</div>
                    <div>
                      <div className="font-medium">{cap.name}</div>
                      <div className="text-xs text-gray-500">{cap.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-400 mb-2">Performance "Metrics"</h4>
              <div className="mb-2">
                <div className="text-sm font-medium">{activeProfile.goals.primary}</div>
              </div>
              <div className="space-y-1">
                {activeProfile.goals.metrics.map((metric, idx) => (
                  <div key={idx} className="text-xs text-gray-400">{metric}</div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 italic">
            System: {activeProfile.systemPrompt}
          </div>
        </div>
      )}

      {/* Bad Thoughts */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {thoughts.length === 0 && !isProcessing ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Agents are "thinking"... 🤔</p>
            <p className="text-xs mt-2">This might take a while...</p>
          </div>
        ) : (
          thoughts.map((thought) => (
            <div
              key={thought.id}
              className="bg-gray-800 rounded-lg p-4 border border-red-700 hover:border-red-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getThoughtIcon(thought.thoughtType)}</span>
                  <span className="font-medium">{thought.agent}</span>
                  <span className={`ml-2 text-sm ${getThoughtColor(thought.confidence)}`}>
                    {thought.confidence >= 0.9 ? '200% confident' : 
                     thought.confidence <= 0.2 ? '¯\\_(ツ)_/¯' :
                     `${Math.round(thought.confidence * 100)}% sure maybe`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {typeof window !== 'undefined' ? new Date(thought.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>
              
              <p className="text-sm mb-2">{thought.content}</p>
              
              {thought.evidence && thought.evidence.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Evidence (trust me bro):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {thought.evidence.map((item, idx) => (
                      <span key={idx} className="text-xs bg-red-900/30 px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {thought.suggestedActions && thought.suggestedActions.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Suggested actions:</span>
                  <ul className="mt-1 space-y-1">
                    {thought.suggestedActions.map((action, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start">
                        <span className="mr-1">🚀</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {thought.collaborationNeeded && thought.collaborationNeeded.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400">Desperately needs help from:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {thought.collaborationNeeded.map((agent, idx) => (
                      <span key={idx} className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}