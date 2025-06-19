'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Activity, Clock, CheckCircle } from 'lucide-react';

export default function AgentsPage() {
  const agents = [
    {
      id: 1,
      name: 'Router Agent',
      type: 'Classifier',
      status: 'active',
      tasksCompleted: 1250,
      avgResponseTime: '0.5s',
      description: 'Routes tickets to specialized agents based on content analysis',
    },
    {
      id: 2,
      name: 'Technical Support Agent',
      type: 'Specialist',
      status: 'active',
      tasksCompleted: 890,
      avgResponseTime: '2.1s',
      description: 'Handles technical issues and troubleshooting',
    },
    {
      id: 3,
      name: 'Billing Agent',
      type: 'Specialist',
      status: 'active',
      tasksCompleted: 650,
      avgResponseTime: '1.8s',
      description: 'Manages billing inquiries and payment issues',
    },
    {
      id: 4,
      name: 'Product Expert Agent',
      type: 'Specialist',
      status: 'active',
      tasksCompleted: 450,
      avgResponseTime: '1.5s',
      description: 'Provides product information and recommendations',
    },
    {
      id: 5,
      name: 'QA Agent',
      type: 'Validator',
      status: 'active',
      tasksCompleted: 2240,
      avgResponseTime: '0.8s',
      description: 'Reviews and validates responses before sending',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
        <p className="text-gray-600 mt-1">Manage and monitor your AI support agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  {agent.name}
                </span>
                <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {agent.status}
                </span>
              </CardTitle>
              <p className="text-sm text-gray-600">{agent.type}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Tasks Completed
                  </span>
                  <span className="font-medium">{agent.tasksCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Avg Response Time
                  </span>
                  <span className="font-medium">{agent.avgResponseTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}