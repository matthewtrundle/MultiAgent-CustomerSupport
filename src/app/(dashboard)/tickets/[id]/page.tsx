'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface Message {
  id: string;
  content: string;
  sender: 'customer' | 'agent' | 'system';
  agentType?: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    qaApproved?: boolean;
  };
}

// Mock data
const mockTicket = {
  id: '1',
  title: 'Cannot connect to API endpoint',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
  },
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  category: 'Technical',
  createdAt: new Date(Date.now() - 1000 * 60 * 30),
  description: 'I\'m trying to connect to your API but getting 401 errors even though my API key is correct.',
};

const mockMessages: Message[] = [
  {
    id: '1',
    content: mockTicket.description,
    sender: 'customer',
    timestamp: mockTicket.createdAt,
  },
  {
    id: '2',
    content: 'Routing ticket to Technical Support Agent...',
    sender: 'system',
    timestamp: new Date(mockTicket.createdAt.getTime() + 1000 * 5),
  },
  {
    id: '3',
    content: 'Hello John, I understand you\'re experiencing authentication issues with our API. Let me help you resolve this. First, can you confirm which endpoint you\'re trying to access and what authentication method you\'re using (Bearer token, API key header, etc.)?',
    sender: 'agent',
    agentType: 'TECHNICAL',
    timestamp: new Date(mockTicket.createdAt.getTime() + 1000 * 30),
    metadata: { confidence: 0.85, qaApproved: true },
  },
  {
    id: '4',
    content: 'I\'m using the Bearer token method with the /api/v2/users endpoint. The API key is in the Authorization header.',
    sender: 'customer',
    timestamp: new Date(mockTicket.createdAt.getTime() + 1000 * 120),
  },
];

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add customer message
    const customerMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'customer',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, customerMessage]);
    setNewMessage('');
    setIsAgentTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I see. The issue might be with the API key format. Make sure your Authorization header is formatted as "Bearer YOUR_API_KEY" with a space between Bearer and your key. Also, ensure your API key has the necessary permissions for the users endpoint.',
        sender: 'agent',
        agentType: 'TECHNICAL',
        timestamp: new Date(),
        metadata: { confidence: 0.82, qaApproved: true },
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsAgentTyping(false);
    }, 2000);
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Ticket Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{mockTicket.title}</h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span>{mockTicket.customer.name}</span>
                <span>•</span>
                <span>{mockTicket.customer.email}</span>
                <span>•</span>
                <span>Created {formatDistanceToNow(mockTicket.createdAt, { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                mockTicket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
              )}>
                {mockTicket.priority}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {mockTicket.status}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.sender === 'customer' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  'flex gap-3 max-w-lg',
                  message.sender === 'customer' ? 'flex-row-reverse' : 'flex-row'
                )}>
                  <div className="flex-shrink-0">
                    {message.sender === 'customer' ? (
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    ) : message.sender === 'agent' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    {message.agentType && (
                      <div className="text-xs text-gray-500 mb-1">
                        {message.agentType} Agent
                        {message.metadata?.confidence && (
                          <span className="ml-2">
                            ({Math.round(message.metadata.confidence * 100)}% confidence)
                          </span>
                        )}
                      </div>
                    )}
                    <div className={cn(
                      'rounded-lg px-4 py-2',
                      message.sender === 'customer' 
                        ? 'bg-blue-600 text-white' 
                        : message.sender === 'system'
                        ? 'bg-gray-200 text-gray-700 italic text-sm'
                        : 'bg-white border border-gray-200'
                    )}>
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isAgentTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Ticket Details</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
            <p className="mt-1 text-sm">{mockTicket.customer.name}</p>
            <p className="text-sm text-gray-600">{mockTicket.customer.email}</p>
            {mockTicket.customer.company && (
              <p className="text-sm text-gray-600">{mockTicket.customer.company}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="mt-1 text-sm">{mockTicket.category}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Priority</h3>
            <p className="mt-1 text-sm">{mockTicket.priority}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-sm">{mockTicket.status}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1 text-sm">
              {formatDistanceToNow(mockTicket.createdAt, { addSuffix: true })}
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded">
                Escalate to Human
              </button>
              <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded">
                Change Priority
              </button>
              <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded">
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}