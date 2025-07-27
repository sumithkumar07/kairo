'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { withAuth } from '@/components/auth/with-auth';
import { EnhancedWorkflowCanvas } from '@/components/enhanced-workflow-canvas';
import { ResponsiveLayout, ResponsiveCard } from '@/components/responsive-layout';
import {
  Workflow,
  Brain,
  Zap,
  Play,
  Save,
  Share,
  Download,
  Upload,
  Settings,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  Clock,
  Users,
  Globe,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  Image,
  Video,
  Code,
  Bot,
  Sparkles,
  Target,
  Rocket,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Wand2,
  GitBranch,
  History,
  BookOpen,
  GraduationCap,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  MousePointer,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Layers,
  Link,
  Unlink,
  Palette,
  Type,
  Hash,
  ToggleLeft,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  Phone,
  CreditCard,
  ShoppingCart,
  BarChart,
  PieChart,
  TrendingUp,
  DollarSign,
  Percent,
  Calculator
} from 'lucide-react';

// Mock data for templates
const templateCategories = [
  {
    id: 'popular',
    name: 'Popular Templates',
    icon: Star,
    templates: [
      {
        id: 1,
        name: 'Lead Qualification Automation',
        description: 'Automatically score and route leads based on engagement',
        category: 'Marketing',
        difficulty: 'Beginner',
        estimatedTime: '15 min',
        usageCount: 1250,
        rating: 4.8,
        tags: ['Leads', 'CRM', 'Email'],
        thumbnail: '/templates/lead-qualification.png'
      },
      {
        id: 2,
        name: 'Customer Support Ticket Routing',
        description: 'Intelligently route support tickets to the right team',
        category: 'Support',
        difficulty: 'Intermediate',
        estimatedTime: '25 min',
        usageCount: 890,
        rating: 4.9,
        tags: ['Support', 'Tickets', 'Routing'],
        thumbnail: '/templates/ticket-routing.png'
      },
      {
        id: 3,
        name: 'E-commerce Order Processing',
        description: 'Automate order fulfillment and customer notifications',
        category: 'E-commerce',
        difficulty: 'Advanced',
        estimatedTime: '45 min',
        usageCount: 650,
        rating: 4.7,
        tags: ['Orders', 'E-commerce', 'Notifications'],
        thumbnail: '/templates/order-processing.png'
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Automation',
    icon: Target,
    templates: [
      {
        id: 4,
        name: 'Email Campaign Sequences',
        description: 'Create personalized email nurture campaigns',
        category: 'Marketing',
        difficulty: 'Beginner',
        estimatedTime: '20 min',
        usageCount: 980,
        rating: 4.6,
        tags: ['Email', 'Campaigns', 'Nurture'],
        thumbnail: '/templates/email-campaigns.png'
      },
      {
        id: 5,
        name: 'Social Media Auto-posting',
        description: 'Schedule and publish content across platforms',
        category: 'Marketing',
        difficulty: 'Intermediate',
        estimatedTime: '30 min',
        usageCount: 750,
        rating: 4.5,
        tags: ['Social Media', 'Content', 'Scheduling'],
        thumbnail: '/templates/social-media.png'
      }
    ]
  },
  {
    id: 'sales',
    name: 'Sales Operations',
    icon: TrendingUp,
    templates: [
      {
        id: 6,
        name: 'Deal Pipeline Management',
        description: 'Automate deal progression and notifications',
        category: 'Sales',
        difficulty: 'Intermediate',
        estimatedTime: '35 min',
        usageCount: 560,
        rating: 4.8,
        tags: ['CRM', 'Pipeline', 'Deals'],
        thumbnail: '/templates/pipeline.png'
      }
    ]
  }
];

// Mock data for AI agents
const aiAgents = [
  {
    id: 1,
    name: 'Content Generator',
    description: 'Generates high-quality content using advanced AI models',
    category: 'Content',
    capabilities: ['Text Generation', 'SEO Optimization', 'Multi-language'],
    model: 'GPT-4',
    usage: 'High',
    lastUpdated: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Data Analyzer',
    description: 'Analyzes complex datasets and provides insights',
    category: 'Analytics',
    capabilities: ['Pattern Recognition', 'Predictive Analysis', 'Visualization'],
    model: 'Claude-3',
    usage: 'Medium',
    lastUpdated: '2024-01-12',
    status: 'active'
  },
  {
    id: 3,
    name: 'Customer Sentiment Analyzer',
    description: 'Analyzes customer feedback and sentiment',
    category: 'Customer Service',
    capabilities: ['Sentiment Analysis', 'Topic Extraction', 'Emotion Detection'],
    model: 'BERT',
    usage: 'High',
    lastUpdated: '2024-01-10',
    status: 'active'
  }
];

function WorkflowEditorPage() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Generating workflow from prompt:', aiPrompt);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Assistant Tab
  const AITab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">AI Workflow Assistant</h2>
          <p className="text-muted-foreground">Generate workflows using natural language</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
          <Brain className="h-4 w-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      {/* AI Prompt Interface */}
      <ResponsiveCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Describe Your Workflow
          </CardTitle>
          <CardDescription>
            Tell the AI what you want to automate in plain English
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: When a new lead fills out our contact form, send them a welcome email, add them to our CRM, and notify the sales team on Slack..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAIGenerate} 
              disabled={!aiPrompt.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardContent>
      </ResponsiveCard>

      {/* AI Agents */}
      <ResponsiveCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available AI Agents
          </CardTitle>
          <CardDescription>
            Pre-configured AI agents for specific tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {aiAgents.map((agent) => (
              <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {agent.category}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <h4 className="font-semibold mb-2">{agent.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {agent.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Model:</span>
                      <Badge variant="secondary" className="text-xs">{agent.model}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 2).map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.capabilities.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full mt-3">
                    <Play className="h-3 w-3 mr-1" />
                    Use Agent
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </ResponsiveCard>
    </div>
  );

  // Templates Tab  
  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">Start with pre-built workflow templates</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <ResponsiveCard>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </ResponsiveCard>

      {/* Template Categories */}
      <div className="space-y-8">
        {templateCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                <h3 className="text-lg sm:text-xl font-semibold">{category.name}</h3>
              </div>
              <Badge variant="secondary">{category.templates.length}</Badge>
            </div>
            
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-4'
            }>
              {category.templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-all group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-2 line-clamp-1">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="text-xs">{template.difficulty}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{template.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{template.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{template.usageCount}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button className="w-full">
                        <Play className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="flex-1 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="canvas" className="flex items-center gap-1 sm:gap-2">
                <Workflow className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Canvas</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1 sm:gap-2">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">AI Assistant</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-1 sm:gap-2">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="trinity" className="flex items-center gap-1 sm:gap-2">
                <Rocket className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Trinity</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="canvas" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Workflow Canvas</h2>
                <p className="text-muted-foreground">Build your automation visually</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button size="sm" className="w-full sm:w-auto">
                  <Play className="h-4 w-4 mr-2" />
                  Test Run
                </Button>
              </div>
            </div>

            <EnhancedWorkflowCanvas />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AITab />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="trinity" className="space-y-6">
            <ResponsiveCard>
              <CardContent className="p-8 text-center">
                <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Trinity Features</h3>
                <p className="text-muted-foreground">Advanced trinity features coming soon...</p>
              </CardContent>
            </ResponsiveCard>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}

export default withAuth(WorkflowEditorPage);