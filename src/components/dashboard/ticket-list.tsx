'use client';

import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { MessageSquare, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  customer: {
    name: string;
    email: string;
  };
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  createdAt: Date;
  agentType?: string;
}

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticketId: string) => void;
}

const statusConfig = {
  OPEN: { label: 'Open', color: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  WAITING_CUSTOMER: { label: 'Waiting', color: 'bg-yellow-100 text-yellow-800' },
  ESCALATED: { label: 'Escalated', color: 'bg-red-100 text-red-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
};

const priorityConfig = {
  LOW: { icon: CheckCircle, color: 'text-gray-400' },
  MEDIUM: { icon: Clock, color: 'text-yellow-500' },
  HIGH: { icon: AlertCircle, color: 'text-orange-500' },
  URGENT: { icon: AlertCircle, color: 'text-red-500' },
};

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  return (
    <div className="overflow-hidden bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {tickets.map((ticket) => {
          const status = statusConfig[ticket.status];
          const priority = priorityConfig[ticket.priority];
          const PriorityIcon = priority.icon;

          return (
            <li
              key={ticket.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onTicketClick?.(ticket.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                    <div className="flex items-center space-x-2">
                      <PriorityIcon className={cn('h-4 w-4', priority.color)} />
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{ticket.customer.name}</span>
                    <span>•</span>
                    <span>{ticket.category}</span>
                    {ticket.agentType && (
                      <>
                        <span>•</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {ticket.agentType} Agent
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(ticket.createdAt, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
