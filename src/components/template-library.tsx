'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Star, 
  Download, 
  Play, 
  Eye,
  Clock,
  CheckCircle,
  Target,
  TrendingUp,
  Headphones,
  Database,
  Mail,
  ShoppingCart,
  Users,
  BarChart3,
  Code,
  Building,
  Smartphone,
  Globe,
  Zap,
  Brain,
  Settings,
  Copy,
  Edit,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  rating: number;
  downloads: string;
  tags: string[];
  nodes: number;
  integrations: string[];
  features: string[];
  preview: string;
  aiGenerated: boolean;
}

const templates: WorkflowTemplate[] = [
  {
    id: 'lead-nurturing',
    name: 'AI-Powered Lead Nurturing',
    description: 'Automatically qualify, score, and nurture leads through personalized email sequences based on behavior and demographics',
    category: 'Marketing',
    icon: Target,
    color: 'from-pink-500 to-rose-500',
    difficulty: 'intermediate',
    estimatedTime: '15 min',
    rating: 4.9,
    downloads: '12.3K',
    tags: ['CRM', 'Email', 'AI', 'Scoring'],
    nodes: 8,
    integrations: ['HubSpot', 'Mailchimp', 'Slack'],
    features: ['Lead Scoring', 'Email Automation', 'Behavior Tracking', 'CRM Sync'],
    preview: 'Trigger → Lead Capture → AI Scoring → Email Sequence → CRM Update',
    aiGenerated: true
  },
  {
    id: 'sales-pipeline',
    name: 'Automated Sales Pipeline',
    description: 'Streamline your sales process from lead to close with intelligent deal tracking and automated follow-ups',
    category: 'Sales',
    icon: TrendingUp,
    color: 'from-blue-500 to-indigo-500',
    difficulty: 'beginner',
    estimatedTime: '10 min',
    rating: 4.8,
    downloads: '8.7K',
    tags: ['CRM', 'Sales', 'Pipeline', 'Notifications'],
    nodes: 6,
    integrations: ['Salesforce', 'Slack', 'Calendar'],
    features: ['Deal Tracking', 'Follow-up Automation', 'Pipeline Reporting'],
    preview: 'New Deal → Stage Update → Notification → Follow-up → Close',
    aiGenerated: false
  },
  {
    id: 'customer-support',
    name: 'Intelligent Support Tickets',
    description: 'Automatically route, prioritize, and respond to support tickets using AI sentiment analysis',
    category: 'Support',
    icon: Headphones,
    color: 'from-green-500 to-teal-500',
    difficulty: 'advanced',
    estimatedTime: '25 min',
    rating: 4.7,
    downloads: '6.1K',
    tags: ['Support', 'AI', 'Routing', 'Sentiment'],
    nodes: 12,
    integrations: ['Zendesk', 'Slack', 'OpenAI'],
    features: ['Auto-routing', 'Priority Scoring', 'AI Responses', 'Escalation'],
    preview: 'Ticket → AI Analysis → Route → Auto-respond → Escalate',
    aiGenerated: true
  },
  {
    id: 'data-sync',
    name: 'Multi-Platform Data Sync',
    description: 'Keep customer data synchronized across all your platforms with real-time validation and deduplication',
    category: 'Data',
    icon: Database,
    color: 'from-purple-500 to-violet-500',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    rating: 4.6,
    downloads: '4.9K',
    tags: ['Sync', 'Validation', 'Deduplication', 'Real-time'],
    nodes: 10,
    integrations: ['Salesforce', 'HubSpot', 'Airtable'],
    features: ['Real-time Sync', 'Data Validation', 'Duplicate Detection'],
    preview: 'Data Change → Validate → Transform → Sync → Notify',
    aiGenerated: false
  },
  {
    id: 'ecommerce-order',
    name: 'E-commerce Order Processing',
    description: 'Complete order fulfillment automation from purchase to delivery with inventory management',
    category: 'E-commerce',
    icon: ShoppingCart,
    color: 'from-orange-500 to-red-500',
    difficulty: 'beginner',
    estimatedTime: '12 min',
    rating: 4.8,
    downloads: '7.2K',
    tags: ['Orders', 'Inventory', 'Fulfillment', 'Email'],
    nodes: 9,
    integrations: ['Shopify', 'Stripe', 'Mailgun'],
    features: ['Order Processing', 'inventory Tracking', 'Email Notifications'],
    preview: 'Order → Payment → Inventory → Fulfillment → Notification',
    aiGenerated: false
  },
  {
    id: 'social-monitoring',
    name: 'Social Media Monitoring',
    description: 'Monitor brand mentions across social platforms and automatically respond to customer inquiries',
    category: 'Marketing',
    icon: Globe,
    color: 'from-cyan-500 to-blue-500',
    difficulty: 'intermediate',
    estimatedTime: '18 min',
    rating: 4.5,
    downloads: '3.8K',
    tags: ['Social', 'Monitoring', 'Sentiment', 'Response'],
    nodes: 11,
    integrations: ['Twitter', 'Facebook', 'Instagram'],
    features: ['Brand Monitoring', 'Sentiment Analysis', 'Auto-response'],
    preview: 'Mention → Analyze → Score → Route → Respond',
    aiGenerated: true
  },
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding Flow',
    description: 'Streamline new employee setup with automated account creation, training assignments, and check-ins',
    category: 'HR',
    icon: Users,
    color: 'from-indigo-500 to-purple-500',
    difficulty: 'beginner',
    estimatedTime: '14 min',
    rating: 4.7,
    downloads: '2.3K',
    tags: ['HR', 'Onboarding', 'Training', 'Automation'],
    nodes: 7,
    integrations: ['Google Workspace', 'Slack', 'BambooHR'],
    features: ['Account Setup', 'Training Assignment', 'Progress Tracking'],
    preview: 'New Hire → Setup → Training → Check-in → Complete',
    aiGenerated: false
  },
  {
    id: 'financial-reporting',
    name: 'Automated Financial Reports',
    description: 'Generate and distribute financial reports automatically with data from multiple sources',
    category: 'Finance',
    icon: BarChart3,
    color: 'from-emerald-500 to-green-500',
    difficulty: 'advanced',
    estimatedTime: '30 min',
    rating: 4.9,
    downloads: '1.9K',
    tags: ['Finance', 'Reports', 'Analytics', 'Automation'],
    nodes: 15,
    integrations: ['QuickBooks', 'Excel', 'Email'],
    features: ['Data Collection', 'Report Generation', 'Distribution'],
    preview: 'Schedule → Collect → Calculate → Format → Distribute',
    aiGenerated: false
  }
];

const categories = [
  { id: 'all', name: 'All Templates', count: templates.length },
  { id: 'Marketing', name: 'Marketing', count: templates.filter(t => t.category === 'Marketing').length },
  { id: 'Sales', name: 'Sales', count: templates.filter(t => t.category === 'Sales').length },
  { id: 'Support', name: 'Support', count: templates.filter(t => t.category === 'Support').length },
  { id: 'Data', name: 'Data Processing', count: templates.filter(t => t.category === 'Data').length },
  { id: 'E-commerce', name: 'E-commerce', count: templates.filter(t => t.category === 'E-commerce').length },
  { id: 'HR', name: 'Human Resources', count: templates.filter(t => t.category === 'HR').length }
];

export function TemplateLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showAIOnly, setShowAIOnly] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
    const matchesAI = !showAIOnly || template.aiGenerated;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesAI;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return parseFloat(b.downloads) - parseFloat(a.downloads);
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const handleUseTemplate = (templateId: string) => {
    console.log('Using template:', templateId);
    // Here you would typically navigate to the workflow editor with the template loaded
  };

  const handlePreview = (templateId: string) => {
    console.log('Previewing template:', templateId);
    // Here you would open a modal or navigate to a preview page
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const TemplateCard = ({ template }: { template: WorkflowTemplate }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${template.color}`} />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <template.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.aiGenerated && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {template.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {template.downloads}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.estimatedTime}
                </div>
              </div>
            </div>
          </div>
          <Badge className={getDifficultyColor(template.difficulty)}>
            {template.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {template.description}
        </p>

        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">WORKFLOW PREVIEW</div>
            <div className="bg-muted/50 p-2 rounded text-xs font-mono">
              {template.preview}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">INTEGRATIONS ({template.integrations.length})</div>
            <div className="flex flex-wrap gap-1">
              {template.integrations.slice(0, 3).map((integration, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {integration}
                </Badge>
              ))}
              {template.integrations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.integrations.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">FEATURES</div>
            <div className="flex flex-wrap gap-1">
              {template.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {template.features.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{template.features.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-3">
              <span>{template.nodes} nodes</span>
              <span>{template.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => handleUseTemplate(template.id)}
          >
            <Play className="h-3 w-3 mr-1" />
            Use Template
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handlePreview(template.id)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline">
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const aiTemplates = templates.filter(t => t.aiGenerated);
  const popularTemplates = templates.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Template Library</h2>
          <p className="text-muted-foreground">Pre-built workflows to get you started in minutes</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          {templates.length} Templates Available
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
            <option value="newest">Newest</option>
          </select>

          <Button
            variant={showAIOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAIOnly(!showAIOnly)}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Only
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="ai">AI-Generated</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
              <Brain className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Generated Templates</h3>
              <p className="text-muted-foreground">
                These templates were created by our advanced AI system and optimized for maximum efficiency
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.filter(c => c.id !== 'all').map(category => {
              const categoryTemplates = templates.filter(t => t.category === category.id);
              const avgRating = categoryTemplates.reduce((sum, t) => sum + t.rating, 0) / categoryTemplates.length;
              
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant="outline">{category.count}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Average Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-2">Popular templates:</div>
                        <div className="space-y-1">
                          {categoryTemplates.slice(0, 3).map(template => (
                            <div key={template.id} className="flex items-center justify-between">
                              <span className="text-xs">{template.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {template.downloads}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        View All {category.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}