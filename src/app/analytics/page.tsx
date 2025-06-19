'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  MessageSquare,
  Users,
  Brain,
  BarChart3,
} from 'lucide-react';

export default function AnalyticsPage() {
  const metrics = [
    {
      title: 'Total Tickets',
      value: '2,345',
      change: '+12%',
      trend: 'up',
      icon: MessageSquare,
      description: 'vs last month',
    },
    {
      title: 'Avg Resolution Time',
      value: '2.4 hrs',
      change: '-18%',
      trend: 'down',
      icon: Clock,
      description: 'Improvement',
    },
    {
      title: 'Resolution Rate',
      value: '94.5%',
      change: '+3.2%',
      trend: 'up',
      icon: CheckCircle,
      description: 'Success rate',
    },
    {
      title: 'Active Customers',
      value: '1,892',
      change: '+8%',
      trend: 'up',
      icon: Users,
      description: 'Monthly active',
    },
  ];

  const agentPerformance = [
    { name: 'Router Agent', tickets: 1250, accuracy: 98.5 },
    { name: 'Technical Agent', tickets: 890, accuracy: 95.2 },
    { name: 'Billing Agent', tickets: 650, accuracy: 97.8 },
    { name: 'Product Agent', tickets: 450, accuracy: 96.1 },
    { name: 'QA Agent', tickets: 2240, accuracy: 99.2 },
  ];

  const ticketCategories = [
    { category: 'Technical Support', count: 890, percentage: 38 },
    { category: 'Billing', count: 650, percentage: 28 },
    { category: 'Product Info', count: 450, percentage: 19 },
    { category: 'Account', count: 355, percentage: 15 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your support system performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-sm mt-1">
                {metric.trend === 'up' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">{metric.change}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">{metric.change}</span>
                  </>
                )}
                <span className="text-gray-600 ml-1">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentPerformance.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-600">{agent.tickets} tickets processed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{agent.accuracy}%</p>
                    <p className="text-sm text-gray-600">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Ticket Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketCategories.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ticket #1234 resolved by Technical Agent</span>
              <span className="text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">New customer registered: alice@example.com</span>
              <span className="text-gray-500">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Billing Agent processed refund request #5678</span>
              <span className="text-gray-500">12 minutes ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">QA Agent flagged ticket #9012 for review</span>
              <span className="text-gray-500">18 minutes ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Product Agent updated knowledge base entry</span>
              <span className="text-gray-500">25 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
