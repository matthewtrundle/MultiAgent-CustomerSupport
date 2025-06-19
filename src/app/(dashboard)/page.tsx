'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketList } from '@/components/dashboard/ticket-list';
import { AgentActivityPanel } from '@/components/dashboard/agent-activity';
import { ResponseTimeChart } from '@/components/dashboard/response-time-chart';
import { trpc } from '@/lib/trpc/client';

// Mock data for now - will be replaced with real data
const mockStats = {
  totalTickets: 156,
  totalTicketsChange: { value: 12, label: 'from last week' },
  avgResponseTime: '8m',
  avgResponseTimeChange: { value: -15, label: 'from last week' },
  resolutionRate: '92%',
  resolutionRateChange: { value: 3, label: 'from last week' },
  activeCustomers: 48,
  activeCustomersChange: { value: 8, label: 'from last week' },
};

const mockTickets = [
  {
    id: '1',
    title: 'Cannot connect to API endpoint',
    customer: { name: 'John Doe', email: 'john@example.com' },
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    category: 'Technical',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    agentType: 'TECHNICAL',
  },
  {
    id: '2',
    title: 'Refund request for duplicate charge',
    customer: { name: 'Jane Smith', email: 'jane@example.com' },
    status: 'ESCALATED' as const,
    priority: 'URGENT' as const,
    category: 'Billing',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    agentType: 'BILLING',
  },
  {
    id: '3',
    title: 'How to export data to CSV?',
    customer: { name: 'Bob Wilson', email: 'bob@example.com' },
    status: 'RESOLVED' as const,
    priority: 'LOW' as const,
    category: 'Product',
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    agentType: 'PRODUCT',
  },
];

const mockAgentActivity = [
  {
    agentType: 'ROUTER',
    status: 'processing' as const,
    currentTicket: { id: '4', title: 'New ticket: Login issues' },
    confidence: 0.85,
    lastActive: new Date(),
  },
  {
    agentType: 'TECHNICAL',
    status: 'processing' as const,
    currentTicket: { id: '1', title: 'Cannot connect to API endpoint' },
    confidence: 0.72,
    lastActive: new Date(),
  },
  {
    agentType: 'QA',
    status: 'completed' as const,
    confidence: 0.95,
    lastActive: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    agentType: 'BILLING',
    status: 'idle' as const,
    lastActive: new Date(Date.now() - 1000 * 60 * 10),
  },
];

const mockChartData = [
  { time: '12:00', avgResponseTime: 12, ticketCount: 15 },
  { time: '13:00', avgResponseTime: 8, ticketCount: 22 },
  { time: '14:00', avgResponseTime: 10, ticketCount: 18 },
  { time: '15:00', avgResponseTime: 6, ticketCount: 25 },
  { time: '16:00', avgResponseTime: 9, ticketCount: 20 },
  { time: '17:00', avgResponseTime: 7, ticketCount: 28 },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor your customer support performance in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Tickets"
          value={mockStats.totalTickets}
          change={mockStats.totalTicketsChange}
          icon={MessageSquare}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Avg Response Time"
          value={mockStats.avgResponseTime}
          change={mockStats.avgResponseTimeChange}
          icon={Clock}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Resolution Rate"
          value={mockStats.resolutionRate}
          change={mockStats.resolutionRateChange}
          icon={TrendingUp}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Active Customers"
          value={mockStats.activeCustomers}
          change={mockStats.activeCustomersChange}
          icon={Users}
          iconColor="text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TicketList
            tickets={mockTickets}
            onTicketClick={(id) => console.log('Ticket clicked:', id)}
          />
          <ResponseTimeChart data={mockChartData} />
        </div>
        <div className="space-y-6">
          <AgentActivityPanel activities={mockAgentActivity} />
        </div>
      </div>
    </div>
  );
}