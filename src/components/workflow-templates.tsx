'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  Copy,
  Play,
  Edit,
  Trash2,
  Plus,
  Filter,
  TrendingUp,
  Clock,
  User,
  Users,
  Globe,
  Lock,
  Zap,
  Target,
  BarChart3,
  MessageSquare,
  Settings,
  Bookmark,
  Award,
  Sparkles,
  Rocket,
  Layers,
  Workflow,
  Bot,
  Database,
  Mail,
  Calendar,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Camera,
  FileText,
  Image,
  Video,
  Music,
  Code,
  GitBranch,
  Cpu,
  Cloud,
  Shield,
  Key,
  Bell,
  Map,
  Compass,
  Navigation,
  Headphones,
  Briefcase,
  Building,
  Factory,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Home,
  School,
  Hospital,
  Store,
  Restaurant,
  Hotel,
  Gamepad2,
  Tv,
  Radio,
  Printer,
  Scanner,
  Keyboard,
  Mouse,
  Monitor,
  Webcam,
  Microphone,
  Speaker,
  Headphones as HeadphonesIcon,
  Volume2,
  VolumeX,
  Signal,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  SdCard,
  Battery,
  Plug,
  Power,
  Lightbulb,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  Zap as ZapIcon,
  Activity,
  Pulse,
  HeartHandshake,
  Brain,
  Dna,
  Pill,
  Stethoscope,
  Syringe,
  Bandage,
  FirstAid,
  Ambulance,
  Cross,
  Plus as PlusIcon,
  Minus,
  Equal,
  X,
  Divide,
  Percent,
  Hash,
  AtSign,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  IndianRupee,
  Bitcoin,
  Coins,
  Banknote,
  Wallet,
  CreditCardIcon,
  Receipt,
  ShoppingBag,
  ShoppingBasket,
  Package,
  PackageOpen,
  PackageCheck,
  PackageX,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  Truck as TruckIcon,
  Plane as PlaneIcon,
  Ship as ShipIcon,
  Car as CarIcon,
  Bike as BikeIcon,
  Bus,
  Train,
  Subway,
  Taxi,
  Fuel,
  MapPin,
  Map as MapIcon,
  Compass as CompassIcon,
  Navigation as NavigationIcon,
  Route,
  Signpost,
  Milestone,
  Flag,
  Bookmark as BookmarkIcon,
  Tag,
  Tags,
  Label,
  Sticky,
  Paperclip,
  Link,
  Unlink,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowLeftRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Move,
  MousePointer,
  MousePointer2,
  Hand,
  Grab,
  GrabIcon,
  Pointer,
  Click,
  Touchpad,
  Scan,
  ScanLine,
  Fingerprint,
  EyeIcon,
  EyeOff,
  Glasses,
  Telescope,
  Microscope,
  Camera as CameraIcon,
  Video as VideoIcon,
  Film,
  Clapperboard,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Repeat,
  Repeat1,
  Shuffle,
  Volume1,
  VolumeIcon,
  Disc,
  Disc2,
  Disc3,
  Radio as RadioIcon,
  Podcast,
  Rss,
  Antenna,
  Satellite,
  SatelliteDish,
  Radar,
  Sonar,
  Waves,
  Vibrate,
  VibrateOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneForwarded,
  PhoneOff,
  Voicemail,
  MessageCircle,
  MessageSquareIcon,
  MessagesSquare,
  MessageSquareMore,
  MessageSquareDot,
  MessageSquareText,
  MessageSquareCode,
  MessageSquareReply,
  MessageSquareQuote,
  MessageSquareHeart,
  MessageSquareX,
  MessageSquareOff,
  MessageSquareWarning,
  MessageSquareShare,
  MessageSquarePlus,
  MessageSquareMinus,
  MessageSquareCheck,
  MessageSquareQuestion,
  MessageSquareEllipsis,
  MessageSquareTextIcon,
  MessageSquareCodeIcon,
  MessageSquareReplyIcon,
  MessageSquareQuoteIcon,
  MessageSquareHeartIcon,
  MessageSquareXIcon,
  MessageSquareOffIcon,
  MessageSquareWarningIcon,
  MessageSquareShareIcon,
  MessageSquarePlusIcon,
  MessageSquareMinusIcon,
  MessageSquareCheckIcon,
  MessageSquareQuestionIcon,
  MessageSquareEllipsisIcon
} from 'lucide-react';
import type { WorkflowNode, WorkflowConnection, Workflow } from '@/types/workflow';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  authorType: 'official' | 'community' | 'verified';
  rating: number;
  downloads: number;
  lastUpdated: string;
  featured: boolean;
  workflow: Workflow;
  preview?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  compatibility: string[];
  version: string;
  changelog?: string;
  documentation?: string;
  pricing: 'free' | 'premium' | 'enterprise';
  industries: string[];
  useCases: string[];
  testimonials?: Array<{
    user: string;
    company: string;
    feedback: string;
    rating: number;
  }>;
}

interface WorkflowTemplatesProps {
  onTemplateSelect: (template: WorkflowTemplate) => void;
  onTemplatePreview: (template: WorkflowTemplate) => void;
  userTemplates?: WorkflowTemplate[];
  className?: string;
}

export function WorkflowTemplates({
  onTemplateSelect,
  onTemplatePreview,
  userTemplates = [],
  className
}: WorkflowTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'name'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<string[]>([]);

  // Mock template data
  const officialTemplates: WorkflowTemplate[] = [
    {
      id: 'template-1',
      name: 'Customer Onboarding Automation',
      description: 'Complete customer onboarding workflow with email verification, CRM integration, and welcome sequences.',
      category: 'business',
      tags: ['customer', 'onboarding', 'email', 'crm', 'automation'],
      author: 'Kairo Team',
      authorType: 'official',
      rating: 4.9,
      downloads: 2845,
      lastUpdated: '2024-01-15',
      featured: true,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'intermediate',
      estimatedTime: '30-45 minutes',
      compatibility: ['email', 'crm', 'database'],
      version: '2.1.0',
      pricing: 'free',
      industries: ['SaaS', 'E-commerce', 'Services'],
      useCases: ['User registration', 'Account setup', 'Welcome emails', 'Trial activation'],
      testimonials: [
        {
          user: 'Sarah Johnson',
          company: 'TechCorp',
          feedback: 'Reduced our onboarding time by 75% and improved user activation rates significantly.',
          rating: 5
        }
      ]
    },
    {
      id: 'template-2',
      name: 'Lead Scoring & Qualification',
      description: 'Automated lead scoring system with multi-channel qualification and CRM integration.',
      category: 'marketing',
      tags: ['lead', 'scoring', 'qualification', 'crm', 'sales'],
      author: 'Marketing Pro',
      authorType: 'verified',
      rating: 4.7,
      downloads: 1923,
      lastUpdated: '2024-01-10',
      featured: true,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'advanced',
      estimatedTime: '60-90 minutes',
      compatibility: ['crm', 'email', 'analytics'],
      version: '1.5.2',
      pricing: 'premium',
      industries: ['B2B', 'Real Estate', 'Insurance'],
      useCases: ['Lead qualification', 'Sales prioritization', 'Marketing automation']
    },
    {
      id: 'template-3',
      name: 'E-commerce Order Processing',
      description: 'Complete order processing workflow with inventory management, payment processing, and shipping.',
      category: 'ecommerce',
      tags: ['order', 'processing', 'inventory', 'payment', 'shipping'],
      author: 'E-commerce Expert',
      authorType: 'verified',
      rating: 4.8,
      downloads: 3156,
      lastUpdated: '2024-01-12',
      featured: true,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'intermediate',
      estimatedTime: '45-60 minutes',
      compatibility: ['payment', 'inventory', 'shipping'],
      version: '3.0.1',
      pricing: 'free',
      industries: ['E-commerce', 'Retail', 'Marketplace'],
      useCases: ['Order fulfillment', 'Inventory tracking', 'Customer notifications']
    },
    {
      id: 'template-4',
      name: 'Social Media Content Pipeline',
      description: 'Automated content creation, scheduling, and performance tracking across multiple platforms.',
      category: 'marketing',
      tags: ['social', 'content', 'scheduling', 'analytics', 'multi-platform'],
      author: 'Social Media Agency',
      authorType: 'community',
      rating: 4.6,
      downloads: 1487,
      lastUpdated: '2024-01-08',
      featured: false,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'beginner',
      estimatedTime: '20-30 minutes',
      compatibility: ['social', 'content', 'analytics'],
      version: '2.2.0',
      pricing: 'free',
      industries: ['Marketing', 'Agency', 'E-commerce'],
      useCases: ['Content scheduling', 'Social media automation', 'Performance tracking']
    },
    {
      id: 'template-5',
      name: 'IT Incident Response',
      description: 'Automated incident detection, escalation, and resolution workflow for IT operations.',
      category: 'operations',
      tags: ['incident', 'response', 'monitoring', 'alerts', 'escalation'],
      author: 'DevOps Team',
      authorType: 'verified',
      rating: 4.9,
      downloads: 892,
      lastUpdated: '2024-01-14',
      featured: true,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'advanced',
      estimatedTime: '90-120 minutes',
      compatibility: ['monitoring', 'alerts', 'ticketing'],
      version: '1.8.0',
      pricing: 'enterprise',
      industries: ['Technology', 'Finance', 'Healthcare'],
      useCases: ['Incident management', 'Alert automation', 'SLA monitoring']
    },
    {
      id: 'template-6',
      name: 'Data ETL Pipeline',
      description: 'Extract, transform, and load data from multiple sources with error handling and monitoring.',
      category: 'data',
      tags: ['etl', 'data', 'pipeline', 'transformation', 'monitoring'],
      author: 'Data Engineer',
      authorType: 'community',
      rating: 4.5,
      downloads: 1234,
      lastUpdated: '2024-01-11',
      featured: false,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'advanced',
      estimatedTime: '120-180 minutes',
      compatibility: ['database', 'api', 'cloud'],
      version: '2.0.3',
      pricing: 'premium',
      industries: ['Technology', 'Finance', 'Analytics'],
      useCases: ['Data migration', 'Real-time processing', 'Data warehousing']
    },
    {
      id: 'template-7',
      name: 'Customer Support Ticket Routing',
      description: 'Intelligent ticket routing based on content analysis, priority, and agent availability.',
      category: 'support',
      tags: ['support', 'tickets', 'routing', 'ai', 'automation'],
      author: 'Support Team',
      authorType: 'official',
      rating: 4.7,
      downloads: 1678,
      lastUpdated: '2024-01-13',
      featured: true,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'intermediate',
      estimatedTime: '45-60 minutes',
      compatibility: ['helpdesk', 'ai', 'email'],
      version: '1.6.1',
      pricing: 'free',
      industries: ['SaaS', 'Services', 'E-commerce'],
      useCases: ['Ticket automation', 'Agent assignment', 'Priority handling']
    },
    {
      id: 'template-8',
      name: 'Financial Report Generation',
      description: 'Automated financial reporting with data aggregation, analysis, and distribution.',
      category: 'finance',
      tags: ['finance', 'reporting', 'analytics', 'automation', 'dashboard'],
      author: 'Finance Pro',
      authorType: 'verified',
      rating: 4.8,
      downloads: 756,
      lastUpdated: '2024-01-09',
      featured: false,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'advanced',
      estimatedTime: '90-120 minutes',
      compatibility: ['finance', 'database', 'reporting'],
      version: '3.1.0',
      pricing: 'enterprise',
      industries: ['Finance', 'Accounting', 'Banking'],
      useCases: ['Financial reports', 'Budget tracking', 'Compliance reporting']
    }
  ];

  const communityTemplates: WorkflowTemplate[] = [
    {
      id: 'community-1',
      name: 'Meeting Scheduler Bot',
      description: 'AI-powered meeting scheduler that finds optimal times and sends calendar invites.',
      category: 'productivity',
      tags: ['meetings', 'scheduling', 'ai', 'calendar', 'automation'],
      author: 'ProductivityGuru',
      authorType: 'community',
      rating: 4.4,
      downloads: 567,
      lastUpdated: '2024-01-07',
      featured: false,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'beginner',
      estimatedTime: '15-20 minutes',
      compatibility: ['calendar', 'email', 'ai'],
      version: '1.2.0',
      pricing: 'free',
      industries: ['General', 'Consulting', 'Services'],
      useCases: ['Meeting coordination', 'Calendar management', 'Team scheduling']
    },
    {
      id: 'community-2',
      name: 'Expense Report Automation',
      description: 'Automated expense report processing with receipt scanning and approval workflows.',
      category: 'finance',
      tags: ['expense', 'receipts', 'automation', 'approval', 'finance'],
      author: 'ExpenseExpert',
      authorType: 'community',
      rating: 4.3,
      downloads: 423,
      lastUpdated: '2024-01-06',
      featured: false,
      workflow: {
        nodes: [],
        connections: []
      },
      difficulty: 'intermediate',
      estimatedTime: '30-45 minutes',
      compatibility: ['ocr', 'finance', 'approval'],
      version: '1.4.2',
      pricing: 'free',
      industries: ['General', 'Consulting', 'Services'],
      useCases: ['Expense tracking', 'Receipt processing', 'Approval workflows']
    }
  ];

  const allTemplates = [...officialTemplates, ...communityTemplates, ...userTemplates];

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(lowerSearchTerm) ||
        template.description.toLowerCase().includes(lowerSearchTerm) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
        template.author.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    // Apply pricing filter
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(template => template.pricing === selectedPricing);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTemplates, searchTerm, selectedCategory, selectedDifficulty, selectedPricing, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allTemplates.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [allTemplates]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((templateId: string) => {
    setBookmarkedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  // Get author badge
  const getAuthorBadge = (authorType: string) => {
    switch (authorType) {
      case 'official':
        return <Badge variant="default" className="text-xs"><Award className="h-3 w-3 mr-1" />Official</Badge>;
      case 'verified':
        return <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'community':
        return <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" />Community</Badge>;
      default:
        return null;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get pricing badge
  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return <Badge variant="secondary" className="text-xs text-green-600">Free</Badge>;
      case 'premium':
        return <Badge variant="default" className="text-xs">Premium</Badge>;
      case 'enterprise':
        return <Badge variant="destructive" className="text-xs">Enterprise</Badge>;
      default:
        return null;
    }
  };

  // Template Card Component
  const TemplateCard = ({ template }: { template: WorkflowTemplate }) => {
    const isBookmarked = bookmarkedTemplates.includes(template.id);
    
    return (
      <Card className="group h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{template.name}</h3>
                {template.featured && (
                  <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {template.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {getAuthorBadge(template.authorType)}
                {getPricingBadge(template.pricing)}
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBookmarkToggle(template.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Bookmark className={cn(
                "h-4 w-4",
                isBookmarked ? "fill-current text-blue-500" : "text-muted-foreground"
              )} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{template.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{template.downloads.toLocaleString()}</span>
                </div>
              </div>
              <div className={cn("text-xs font-medium", getDifficultyColor(template.difficulty))}>
                {template.difficulty}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{template.estimatedTime}</span>
              <span>•</span>
              <User className="h-3 w-3" />
              <span>{template.author}</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowPreview(true);
                }}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => onTemplateSelect(template)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">
            Jump-start your automation with proven templates
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="popular">Popular</option>
            <option value="recent">Recent</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="official">Official</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.featured).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="official" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.authorType === 'official').map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.authorType === 'community').map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => bookmarkedTemplates.includes(t.id)).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{selectedTemplate.name}</h3>
                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {getAuthorBadge(selectedTemplate.authorType)}
                    {getPricingBadge(selectedTemplate.pricing)}
                    <Badge variant="outline" className="text-xs">
                      {selectedTemplate.category}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", getDifficultyColor(selectedTemplate.difficulty))}>
                      {selectedTemplate.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{selectedTemplate.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Downloads</p>
                      <p>{selectedTemplate.downloads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Estimated Time</p>
                      <p>{selectedTemplate.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="font-medium">Version</p>
                      <p>{selectedTemplate.version}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.industries.map((industry, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Use Cases</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedTemplate.useCases.map((useCase, index) => (
                        <li key={index}>• {useCase}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => onTemplateSelect(selectedTemplate)}>
                  <Download className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}