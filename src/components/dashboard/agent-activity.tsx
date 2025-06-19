'use client';

import { Brain, Activity, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AgentActivity {
  agentType: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  currentTicket?: {
    id: string;
    title: string;
  };
  confidence?: number;
  lastActive: Date;
}

interface AgentActivityProps {
  activities: AgentActivity[];
}

const agentColors = {
  ROUTER: 'bg-purple-100 text-purple-800',
  TECHNICAL: 'bg-blue-100 text-blue-800',
  BILLING: 'bg-green-100 text-green-800',
  PRODUCT: 'bg-yellow-100 text-yellow-800',
  ESCALATION: 'bg-red-100 text-red-800',
  QA: 'bg-indigo-100 text-indigo-800',
};

const statusIcons = {
  idle: Activity,
  processing: Activity,
  completed: CheckCircle,
  failed: XCircle,
};

export function AgentActivityPanel({ activities }: AgentActivityProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Agent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const StatusIcon = statusIcons[activity.status];
            const agentColor =
              agentColors[activity.agentType as keyof typeof agentColors] ||
              'bg-gray-100 text-gray-800';

            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'rounded-full p-2',
                      activity.status === 'processing' ? 'bg-blue-50' : 'bg-gray-50'
                    )}
                  >
                    <Brain
                      className={cn(
                        'h-5 w-5',
                        activity.status === 'processing'
                          ? 'text-blue-600 animate-pulse'
                          : 'text-gray-400'
                      )}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          agentColor
                        )}
                      >
                        {activity.agentType} Agent
                      </span>
                      {activity.currentTicket && (
                        <p className="mt-1 text-sm text-gray-600">
                          Processing: {activity.currentTicket.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.confidence !== undefined && (
                        <span className="text-sm text-gray-500">
                          {Math.round(activity.confidence * 100)}% confidence
                        </span>
                      )}
                      <StatusIcon
                        className={cn(
                          'h-4 w-4',
                          activity.status === 'completed'
                            ? 'text-green-500'
                            : activity.status === 'failed'
                              ? 'text-red-500'
                              : activity.status === 'processing'
                                ? 'text-blue-500'
                                : 'text-gray-400'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
