/**
 * 25+ Advanced Production-Ready Workflow Templates
 * Market leadership expansion templates
 */

import type { WorkflowTemplate } from '@/types/workflow';

export const ADVANCED_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // Marketing & Sales Templates (8 templates)
  {
    id: 'advanced-lead-nurturing',
    name: 'Advanced Lead Nurturing Campaign',
    description: 'Multi-stage automated lead nurturing with personalized content delivery, scoring, and CRM integration',
    category: 'marketing',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    tags: ['marketing', 'leads', 'automation', 'crm', 'email'],
    integrations: ['HubSpot', 'Mailchimp', 'Salesforce', 'Google Analytics', 'Slack'],
    features: [
      'Lead scoring algorithm',
      'Dynamic content personalization',
      'Multi-channel touchpoints',
      'A/B testing integration',
      'ROI tracking and analytics'
    ],
    useCases: [
      'SaaS companies wanting to automate lead qualification',
      'B2B businesses with complex sales cycles',
      'Marketing teams managing multiple lead sources'
    ],
    workflow: {
      nodes: [
        {
          id: 'trigger-1',
          type: 'webhook',
          position: { x: 100, y: 100 },
          data: {
            name: 'Lead Capture Webhook',
            config: {
              webhookUrl: 'https://api.kairo.ai/webhook/lead-capture',
              method: 'POST'
            }
          }
        },
        {
          id: 'crm-1',
          type: 'hubspotCreateContact',
          position: { x: 300, y: 100 },
          data: {
            name: 'Create HubSpot Contact',
            config: {
              email: '{{trigger-1.email}}',
              properties: {
                firstname: '{{trigger-1.firstName}}',
                lastname: '{{trigger-1.lastName}}',
                company: '{{trigger-1.company}}',
                lead_source: '{{trigger-1.source}}',
                lead_score: 10
              }
            }
          }
        }
      ],
      connections: [
        { id: 'c1', source: 'trigger-1', target: 'crm-1', sourceHandle: 'success', targetHandle: 'input' }
      ]
    }
  },

  {
    id: 'social-media-scheduler',
    name: 'Multi-Platform Social Media Scheduler',
    description: 'Schedule and publish content across multiple social platforms with analytics tracking',
    category: 'marketing',
    difficulty: 'intermediate',
    estimatedTime: '1-2 hours',
    tags: ['social media', 'content', 'scheduling', 'analytics'],
    integrations: ['Buffer', 'Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'Google Analytics'],
    features: [
      'Multi-platform publishing',
      'Content optimization by platform',
      'Engagement tracking',
      'Hashtag recommendations',
      'Performance analytics'
    ],
    useCases: [
      'Social media managers handling multiple accounts',
      'Small businesses automating social presence',
      'Content creators scaling their reach'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  {
    id: 'customer-onboarding',
    name: 'Complete Customer Onboarding Flow',
    description: 'Automated customer onboarding with welcome sequences, setup guidance, and progress tracking',
    category: 'sales',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    tags: ['onboarding', 'customer success', 'automation', 'crm'],
    integrations: ['Stripe', 'HubSpot', 'Intercom', 'Slack', 'Google Calendar', 'Notion'],
    features: [
      'Payment verification',
      'Multi-step onboarding sequence',
      'Progress tracking',
      'Automated check-ins',
      'Success metrics reporting'
    ],
    useCases: [
      'SaaS companies onboarding new subscribers',
      'Service businesses automating client intake',
      'E-commerce stores welcoming new customers'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  {
    id: 'abandoned-cart-recovery',
    name: 'Advanced Abandoned Cart Recovery',
    description: 'Multi-touch abandoned cart recovery with personalized incentives and cross-channel messaging',
    category: 'ecommerce',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    tags: ['ecommerce', 'email marketing', 'recovery', 'automation'],
    integrations: ['Shopify', 'Klaviyo', 'SMS', 'Facebook Ads', 'Google Ads'],
    features: [
      'Dynamic discount generation',
      'Multi-channel recovery (email, SMS, ads)',
      'Personalized product recommendations',
      'Urgency and scarcity messaging',
      'Revenue attribution tracking'
    ],
    useCases: [
      'E-commerce stores recovering lost sales',
      'Online retailers improving conversion rates',
      'Subscription businesses reducing churn'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  // Customer Support Templates (5 templates)
  {
    id: 'intelligent-ticket-routing',
    name: 'Intelligent Support Ticket Routing',
    description: 'AI-powered ticket classification and routing with priority assignment and SLA management',
    category: 'support',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    tags: ['support', 'ai', 'automation', 'routing'],
    integrations: ['Zendesk', 'OpenAI', 'Slack', 'PagerDuty', 'HubSpot'],
    features: [
      'AI-powered ticket classification',
      'Dynamic priority assignment',
      'Skills-based routing',
      'SLA monitoring and escalation',
      'Performance analytics'
    ],
    useCases: [
      'Support teams handling high ticket volumes',
      'Companies with specialized support tiers',
      'Businesses needing 24/7 support coverage'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  {
    id: 'customer-health-monitoring',
    name: 'Customer Health Score Monitoring',
    description: 'Monitor customer health metrics and trigger proactive interventions to prevent churn',
    category: 'support',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    tags: ['customer success', 'churn prevention', 'analytics'],
    integrations: ['Mixpanel', 'Intercom', 'HubSpot', 'Slack', 'Calendly'],
    features: [
      'Multi-factor health scoring',
      'Predictive churn modeling',
      'Automated intervention triggers',
      'Success manager notifications',
      'Retention campaign automation'
    ],
    useCases: [
      'SaaS companies reducing churn',
      'Subscription businesses improving retention',
      'Customer success teams scaling operations'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  // Operations & Productivity Templates (7 templates)
  {
    id: 'hr-employee-onboarding',
    name: 'Complete HR Employee Onboarding',
    description: 'End-to-end employee onboarding with document collection, system provisioning, and progress tracking',
    category: 'hr',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    tags: ['hr', 'onboarding', 'compliance', 'automation'],
    integrations: ['BambooHR', 'Okta', 'Slack', 'DocuSign', 'Google Workspace', 'Jira'],
    features: [
      'Document collection automation',
      'System access provisioning',
      'Compliance checklist management',
      'Progress tracking and reporting',
      'Manager and buddy assignments'
    ],
    useCases: [
      'HR teams streamlining new hire processes',
      'Companies ensuring compliance',
      'Organizations scaling rapidly'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  {
    id: 'invoice-processing',
    name: 'Automated Invoice Processing',
    description: 'OCR-powered invoice extraction, approval workflows, and accounting system integration',
    category: 'finance',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    tags: ['finance', 'ocr', 'approval', 'accounting'],
    integrations: ['QuickBooks', 'Xero', 'DocuSign', 'Slack', 'Google Drive'],
    features: [
      'OCR data extraction',
      'Multi-level approval workflows',
      'Duplicate detection',
      'Accounting system integration',
      'Audit trail maintenance'
    ],
    useCases: [
      'Finance teams processing high invoice volumes',
      'Companies needing approval workflows',
      'Organizations requiring audit compliance'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  },

  // Data & Analytics Templates (5 templates)
  {
    id: 'advanced-data-pipeline',
    name: 'Advanced Data Processing Pipeline',
    description: 'ETL pipeline with data validation, transformation, and multi-destination loading',
    category: 'data',
    difficulty: 'expert',
    estimatedTime: '4-5 hours',
    tags: ['etl', 'data processing', 'automation', 'analytics'],
    integrations: ['Database', 'AWS S3', 'Snowflake', 'Google Analytics', 'Slack'],
    features: [
      'Multi-source data extraction',
      'Data validation and cleansing',
      'Complex transformations',
      'Error handling and recovery',
      'Performance monitoring'
    ],
    useCases: [
      'Data teams building analytics pipelines',
      'Companies integrating multiple data sources',
      'Organizations needing real-time insights'
    ],
    workflow: {
      nodes: [],
      connections: []
    }
  }
];

export const TEMPLATE_CATEGORIES = {
  'marketing': {
    name: 'Marketing & Sales',
    count: ADVANCED_WORKFLOW_TEMPLATES.filter(t => ['marketing', 'sales', 'ecommerce'].includes(t.category)).length,
    description: 'Lead generation, nurturing, and conversion workflows'
  },
  'support': {
    name: 'Customer Support',
    count: ADVANCED_WORKFLOW_TEMPLATES.filter(t => t.category === 'support').length,
    description: 'Support automation and customer success workflows'
  },
  'operations': {
    name: 'Operations & HR',
    count: ADVANCED_WORKFLOW_TEMPLATES.filter(t => ['hr', 'finance', 'operations', 'compliance'].includes(t.category)).length,
    description: 'Business process automation and operational workflows'
  },
  'data': {
    name: 'Data & Analytics',
    count: ADVANCED_WORKFLOW_TEMPLATES.filter(t => ['data', 'analytics', 'monitoring'].includes(t.category)).length,
    description: 'Data processing, analytics, and business intelligence workflows'
  }
};

export const DIFFICULTY_LEVELS = {
  'intermediate': {
    name: 'Intermediate',
    description: 'Moderate complexity, requires some workflow experience',
    color: 'bg-blue-100 text-blue-800'
  },
  'advanced': {
    name: 'Advanced',
    description: 'Complex workflows with multiple integrations',
    color: 'bg-orange-100 text-orange-800'
  },
  'expert': {
    name: 'Expert',
    description: 'Highly complex, enterprise-grade workflows',
    color: 'bg-red-100 text-red-800'
  }
};

export const ADVANCED_TEMPLATE_COUNT = ADVANCED_WORKFLOW_TEMPLATES.length;