// Import advanced templates
import { ADVANCED_WORKFLOW_TEMPLATES } from './advanced-templates';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'sales' | 'support' | 'data' | 'ecommerce' | 'productivity' | 'hr' | 'finance' | 'operations' | 'compliance' | 'analytics' | 'monitoring';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
  tags: string[];
  integrations: string[];
  features: string[];
  useCases?: string[];
  workflow: {
    nodes: any[];
    connections: any[];
  };
  thumbnail?: string;
  downloadCount?: number;
  rating?: number;
  author?: string;
  lastUpdated?: string;
  isPremium?: boolean;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'lead-nurturing-email-sequence',
    name: 'Lead Nurturing Email Sequence',
    description: 'Automatically nurture leads with personalized email sequences based on behavior and engagement',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    tags: ['email marketing', 'lead nurturing', 'automation', 'CRM'],
    integrations: ['Mailchimp', 'HubSpot', 'Salesforce'],
    features: ['AI personalization', 'Behavior tracking', 'A/B testing', 'ROI analytics'],
    workflow: {
      nodes: [
        {
          id: 'trigger_1',
          type: 'webhook',
          name: 'New Lead Trigger',
          position: { x: 100, y: 100 },
          config: { webhookUrl: 'auto-generated' }
        },
        {
          id: 'ai_1',
          type: 'openaiChat',
          name: 'Personalize Email',
          position: { x: 300, y: 100 },
          config: { 
            model: 'gpt-4',
            prompt: 'Create a personalized welcome email for this lead: {{trigger.leadData}}'
          }
        },
        {
          id: 'email_1',
          type: 'mailchimpSend',
          name: 'Send Welcome Email',
          position: { x: 500, y: 100 },
          config: { 
            subject: '{{ai.emailSubject}}',
            content: '{{ai.emailContent}}'
          }
        }
      ],
      connections: [
        { id: 'conn_1', sourceNodeId: 'trigger_1', targetNodeId: 'ai_1' },
        { id: 'conn_2', sourceNodeId: 'ai_1', targetNodeId: 'email_1' }
      ]
    },
    downloadCount: 1250,
    rating: 4.8,
    author: 'Kairo Team',
    lastUpdated: '2024-01-15',
    isPremium: false
  },
  {
    id: 'customer-support-ticket-routing',
    name: 'AI-Powered Support Ticket Routing',
    description: 'Automatically categorize, prioritize, and route customer support tickets using AI sentiment analysis',
    category: 'support',
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    tags: ['customer support', 'AI routing', 'sentiment analysis', 'automation'],
    integrations: ['Zendesk', 'Slack', 'OpenAI', 'Twilio'],
    features: ['Sentiment analysis', 'Priority scoring', 'Auto-assignment', 'Escalation rules'],
    workflow: {
      nodes: [
        {
          id: 'trigger_1',
          type: 'webhook',
          name: 'New Ticket Trigger',
          position: { x: 100, y: 100 },
          config: { source: 'zendesk' }
        },
        {
          id: 'ai_1',
          type: 'sentimentAnalysis',
          name: 'Analyze Sentiment',
          position: { x: 300, y: 100 },
          config: { model: 'meta-llama/llama-4-maverick' }
        },
        {
          id: 'condition_1',
          type: 'conditionalBranch',
          name: 'Priority Check',
          position: { x: 500, y: 100 },
          config: {
            conditions: [
              { expression: '{{ai.sentiment}} === "negative" && {{ai.urgency}} > 0.8', label: 'High Priority' },
              { expression: '{{ai.sentiment}} === "neutral"', label: 'Medium Priority' }
            ]
          }
        }
      ],
      connections: [
        { id: 'conn_1', sourceNodeId: 'trigger_1', targetNodeId: 'ai_1' },
        { id: 'conn_2', sourceNodeId: 'ai_1', targetNodeId: 'condition_1' }
      ]
    },
    downloadCount: 890,
    rating: 4.9,
    author: 'Kairo Team',
    lastUpdated: '2024-01-18',
    isPremium: true
  },
  {
    id: 'ecommerce-order-fulfillment',
    name: 'E-commerce Order Fulfillment',
    description: 'Complete order processing from payment to shipping with inventory management and customer notifications',
    category: 'ecommerce',
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    tags: ['ecommerce', 'order processing', 'inventory', 'shipping'],
    integrations: ['Shopify', 'Stripe', 'ShipStation', 'Mailchimp'],
    features: ['Inventory sync', 'Payment processing', 'Shipping automation', 'Customer notifications'],
    workflow: {
      nodes: [
        {
          id: 'trigger_1',
          type: 'shopifyOrderCreated',
          name: 'New Order Trigger',
          position: { x: 100, y: 100 },
          config: { storeUrl: 'your-store.myshopify.com' }
        },
        {
          id: 'stripe_1',
          type: 'stripeProcessPayment',
          name: 'Process Payment',
          position: { x: 300, y: 100 },
          config: { currency: 'usd' }
        },
        {
          id: 'inventory_1',
          type: 'updateInventory',
          name: 'Update Inventory',
          position: { x: 500, y: 100 },
          config: { action: 'decrease' }
        }
      ],
      connections: [
        { id: 'conn_1', sourceNodeId: 'trigger_1', targetNodeId: 'stripe_1' },
        { id: 'conn_2', sourceNodeId: 'stripe_1', targetNodeId: 'inventory_1' }
      ]
    },
    downloadCount: 2100,
    rating: 4.7,
    author: 'Community',
    lastUpdated: '2024-01-20',
    isPremium: false
  },
  {
    id: 'social-media-content-scheduler',
    name: 'AI Social Media Content Scheduler',
    description: 'Generate, schedule, and post AI-created social media content across multiple platforms with engagement tracking',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedTime: '18 minutes',
    tags: ['social media', 'content generation', 'scheduling', 'AI'],
    integrations: ['Twitter', 'LinkedIn', 'Facebook', 'OpenAI', 'Buffer'],
    features: ['AI content generation', 'Multi-platform posting', 'Engagement tracking', 'Optimal timing'],
    workflow: {
      nodes: [
        {
          id: 'schedule_1',
          type: 'scheduleTrigger',
          name: 'Daily Content Schedule',
          position: { x: 100, y: 100 },
          config: { cron: '0 9 * * *' }
        },
        {
          id: 'ai_1',
          type: 'openaiChat',
          name: 'Generate Content',
          position: { x: 300, y: 100 },
          config: { 
            model: 'gpt-4',
            prompt: 'Create an engaging social media post about {{topic}} in {{tone}} tone'
          }
        }
      ],
      connections: [
        { id: 'conn_1', sourceNodeId: 'schedule_1', targetNodeId: 'ai_1' }
      ]
    },
    downloadCount: 3400,
    rating: 4.6,
    author: 'Kairo Team',
    lastUpdated: '2024-01-22',
    isPremium: false
  },
  {
    id: 'data-pipeline-etl',
    name: 'Advanced Data Pipeline (ETL)',
    description: 'Extract, transform, and load data between multiple systems with validation, cleansing, and error handling',
    category: 'data',
    difficulty: 'advanced',
    estimatedTime: '30 minutes',
    tags: ['ETL', 'data pipeline', 'validation', 'transformation'],
    integrations: ['PostgreSQL', 'AWS S3', 'Snowflake', 'Airflow'],
    features: ['Data validation', 'Auto-cleansing', 'Error recovery', 'Performance monitoring'],
    workflow: {
      nodes: [
        {
          id: 'trigger_1',
          type: 'scheduleTrigger',
          name: 'Daily ETL Job',
          position: { x: 100, y: 100 },
          config: { cron: '0 2 * * *' }
        },
        {
          id: 'extract_1',
          type: 'databaseQuery',
          name: 'Extract Data',
          position: { x: 300, y: 100 },
          config: { 
            connectionType: 'postgresql',
            query: 'SELECT * FROM raw_data WHERE created_at > {{yesterday}}'
          }
        },
        {
          id: 'transform_1',
          type: 'dataTransform',
          name: 'Clean & Transform',
          position: { x: 500, y: 100 },
          config: {
            transformations: [
              { field: 'email', action: 'lowercase' },
              { field: 'phone', action: 'normalize' }
            ]
          }
        }
      ],
      connections: [
        { id: 'conn_1', sourceNodeId: 'trigger_1', targetNodeId: 'extract_1' },
        { id: 'conn_2', sourceNodeId: 'extract_1', targetNodeId: 'transform_1' }
      ]
    },
    downloadCount: 756,
    rating: 4.9,
    author: 'Community',
    lastUpdated: '2024-01-25',
    isPremium: true
  }
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', count: WORKFLOW_TEMPLATES.length },
  { id: 'marketing', name: 'Marketing Automation', count: WORKFLOW_TEMPLATES.filter(t => t.category === 'marketing').length },
  { id: 'sales', name: 'Sales Operations', count: WORKFLOW_TEMPLATES.filter(t => t.category === 'sales').length },
  { id: 'support', name: 'Customer Support', count: WORKFLOW_TEMPLATES.filter(t => t.category === 'support').length },
  { id: 'ecommerce', name: 'E-commerce', count: WORKFLOW_TEMPLATES.filter(t => t.category === 'ecommerce').length },
  { id: 'data', name: 'Data Processing', count: WORKFLOW_TEMPLATES.filter(t => t.category === 'data').length },
  { id: 'productivity', name: 'Productivity', count: WORKFLOW_TEMPLATES.filter(t => t.category === 'productivity').length }
];

export const POPULAR_TEMPLATES = WORKFLOW_TEMPLATES
  .sort((a, b) => b.downloadCount - a.downloadCount)
  .slice(0, 6);

export const FEATURED_TEMPLATES = WORKFLOW_TEMPLATES
  .filter(template => template.rating >= 4.8)
  .slice(0, 4);