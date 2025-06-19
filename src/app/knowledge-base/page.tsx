'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Tag, TrendingUp, Users, Zap, Brain, ChevronRight, Star, BarChart, Plus, Edit } from 'lucide-react';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  helpfulCount: number;
  successRate: number;
  lastUpdated: Date;
  author: string;
  relatedArticles?: string[];
}

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/knowledge-base');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.map((article: any) => ({
          ...article,
          lastUpdated: new Date(article.updatedAt),
          author: article.source || 'Support Team',
          successRate: Math.round((article.helpfulCount / article.usageCount) * 100) || 0,
          content: article.content || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Articles', icon: BookOpen, color: 'bg-gray-100' },
    { id: 'TECHNICAL', name: 'Technical', icon: Zap, color: 'bg-blue-100' },
    { id: 'BILLING', name: 'Billing', icon: BarChart, color: 'bg-green-100' },
    { id: 'PRODUCT', name: 'Product', icon: Brain, color: 'bg-purple-100' },
    { id: 'GENERAL', name: 'General', icon: Users, color: 'bg-orange-100' },
  ];

  const mockArticles: KnowledgeArticle[] = [
    {
      id: '1',
      title: 'Calendar Sync Troubleshooting Guide',
      content: `Problem: Calendar sync not working with property management system

Solution:
1. Navigate to Settings > Calendar Sync
2. Disconnect the affected calendar
3. Wait 30 seconds for full disconnection
4. Click "Connect Calendar" and generate new iCal URL
5. Enable "Two-way sync" option
6. Set refresh interval to 15 minutes
7. Test with a sample booking

Common Issues:
- Timezone mismatches: Ensure property timezone matches calendar
- API rate limits: Check if sync frequency is too high
- Authentication errors: Regenerate API keys if needed`,
      category: 'TECHNICAL',
      tags: ['calendar', 'sync', 'ical', 'integration', 'troubleshooting'],
      usageCount: 1245,
      helpfulCount: 1089,
      successRate: 94,
      lastUpdated: new Date('2024-01-15'),
      author: 'Technical Team',
      relatedArticles: ['API Integration Guide', 'Common Sync Errors', 'Timezone Settings']
    },
    {
      id: '2',
      title: 'Guest Refund Policy Guidelines',
      content: `Problem: Guest requesting refund after stay

Policy Overview:
- Strict Policy: No refunds after check-in
- Moderate Policy: 50% refund if cancelled 5+ days before
- Flexible Policy: Full refund if cancelled 24+ hours before

Special Circumstances:
1. Documented emergencies (medical, family)
2. Property not as described (must be reported within 24h)
3. Major amenity failures (AC, plumbing, wifi for remote workers)

Resolution Steps:
1. Review cancellation policy
2. Check if issue was reported during stay
3. Offer future stay credit as compromise
4. Escalate to supervisor if >$500`,
      category: 'BILLING',
      tags: ['refund', 'policy', 'guest', 'cancellation', 'dispute'],
      usageCount: 892,
      helpfulCount: 756,
      successRate: 87,
      lastUpdated: new Date('2024-01-20'),
      author: 'Policy Team',
      relatedArticles: ['Cancellation Policies', 'Dispute Resolution', 'Guest Communication']
    },
    {
      id: '3',
      title: 'Dynamic Pricing Strategy Guide',
      content: `Problem: How to optimize pricing for maximum revenue

Best Practices:
1. Base Pricing:
   - Research comparable properties
   - Set competitive base rate
   - Factor in all amenities

2. Seasonal Adjustments:
   - Peak season: +40-60%
   - Shoulder season: +20-30%
   - Off-season: -10-20%

3. Event-Based Pricing:
   - Major events: +75-100%
   - Holidays: +50-75%
   - Local festivals: +30-50%

4. Length of Stay Discounts:
   - 7+ nights: 10% discount
   - 28+ nights: 20% discount
   - Monthly: 25-30% discount

5. Last-Minute Deals:
   - 3 days out: -15%
   - Same day: -25%`,
      category: 'PRODUCT',
      tags: ['pricing', 'dynamic', 'revenue', 'optimization', 'strategy'],
      usageCount: 2103,
      helpfulCount: 1876,
      successRate: 91,
      lastUpdated: new Date('2024-01-18'),
      author: 'Revenue Team',
      relatedArticles: ['Competitive Analysis', 'Seasonal Calendar', 'Discount Settings']
    },
    {
      id: '4',
      title: 'Smart Lock Integration Complete Guide',
      content: `Problem: Setting up and troubleshooting smart lock integrations

Supported Locks:
- August (all models)
- Yale (WiFi enabled)
- Schlage Encode
- RemoteLock

Setup Process:
1. Install lock and connect to WiFi
2. Generate API credentials from lock app
3. Add integration in Settings > Smart Home
4. Test with manual code generation
5. Enable auto-generation for bookings

Troubleshooting:
- Codes not generating: Check API limits
- Guest can't access: Verify timezone settings
- Battery warnings: Set up monitoring alerts`,
      category: 'TECHNICAL',
      tags: ['smart-lock', 'integration', 'security', 'automation', 'access'],
      usageCount: 567,
      helpfulCount: 498,
      successRate: 96,
      lastUpdated: new Date('2024-01-22'),
      author: 'Integration Team',
      relatedArticles: ['Security Best Practices', 'Guest Check-in', 'Automation Rules']
    }
  ];

  const filteredArticles = (articles.length > 0 ? articles : mockArticles).filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalArticles: articles.length || mockArticles.length,
    avgSuccessRate: Math.round(
      (articles.length > 0 ? articles : mockArticles).reduce((acc, a) => acc + a.successRate, 0) / 
      (articles.length || mockArticles.length)
    ),
    totalUsage: (articles.length > 0 ? articles : mockArticles).reduce((acc, a) => acc + a.usageCount, 0),
    lastUpdated: new Date().toLocaleDateString()
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Knowledge Base</h1>
          <p className="text-lg text-gray-600 mb-6">
            Intelligent solutions powered by machine learning and historical data
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Articles</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalArticles}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-900">{stats.avgSuccessRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Total Usage</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalUsage.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">AI Confidence</p>
                  <p className="text-2xl font-bold text-orange-900">96%</p>
                </div>
                <Brain className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search articles, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : `${category.color} text-gray-700 hover:bg-opacity-80`
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-lg transition-shadow cursor-pointer bg-white"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <Badge variant={
                      article.category === 'TECHNICAL' ? 'default' :
                      article.category === 'BILLING' ? 'secondary' :
                      article.category === 'PRODUCT' ? 'outline' : 'default'
                    } className="mb-3">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {article.successRate}%
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.content.split('\n')[0]}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{article.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {article.usageCount.toLocaleString()} uses
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {article.helpfulCount.toLocaleString()} helpful
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* AI Insights Panel */}
        <div className="mt-8">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Most Searched Topic</p>
                  <p className="font-medium text-gray-900">Calendar Sync Issues</p>
                  <p className="text-xs text-gray-500">342 searches this week</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trending Issue</p>
                  <p className="font-medium text-gray-900">Smart Lock Integration</p>
                  <p className="text-xs text-gray-500">↑ 156% increase</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolution Time Saved</p>
                  <p className="font-medium text-gray-900">6,420 hours</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <Badge>{selectedArticle.category}</Badge>
                <span className="text-sm text-gray-500">
                  Updated {selectedArticle.lastUpdated.toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  by {selectedArticle.author}
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <pre className="whitespace-pre-wrap font-sans">{selectedArticle.content}</pre>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Related Articles</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.relatedArticles?.map((related, idx) => (
                    <button
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {related}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{selectedArticle.usageCount.toLocaleString()} uses</span>
                  <span>{selectedArticle.helpfulCount.toLocaleString()} found helpful</span>
                  <span>{selectedArticle.successRate}% success rate</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Mark as Helpful
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}