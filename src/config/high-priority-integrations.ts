import type { AvailableNodeType } from '@/types/workflow';
import { 
  Database, 
  FileText, 
  MessageSquare, 
  Calendar,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  Mail,
  Image,
  Palette,
  Code,
  Building,
  Headphones,
  Megaphone,
  ShoppingCart,
  Truck,
  Settings,
  Globe,
  Phone,
  Zap,
  Cloud,
  Lock,
  Layers
} from 'lucide-react';

// High-Priority Missing Integrations (Top 50 most requested)
export const HIGH_PRIORITY_INTEGRATIONS: AvailableNodeType[] = [
  // Productivity & Collaboration
  {
    type: 'notionCreatePage',
    name: 'Notion: Create Page',
    icon: FileText,
    description: 'Create a new page in Notion database or workspace',
    category: 'integrations',
    defaultConfig: {
      databaseId: '',
      pageTitle: '{{input.title}}',
      properties: {},
      contentBlocks: []
    },
    configSchema: {
      databaseId: { 
        label: 'Database ID', 
        type: 'string', 
        required: true,
        helperText: 'The ID of the Notion database to create the page in'
      },
      pageTitle: { 
        label: 'Page Title', 
        type: 'string', 
        required: true,
        placeholder: '{{input.title}}'
      },
      properties: { 
        label: 'Page Properties (JSON)', 
        type: 'json', 
        placeholder: '{"Status": {"select": {"name": "In Progress"}}}',
        helperText: 'Properties to set on the new page'
      }
    },
    inputHandles: ['data'],
    outputHandles: ['page', 'error']
  },

  {
    type: 'notionUpdatePage',
    name: 'Notion: Update Page',
    icon: FileText,
    description: 'Update an existing Notion page properties and content',
    category: 'integrations',
    defaultConfig: {
      pageId: '{{input.pageId}}',
      properties: {},
      archivePage: false
    },
    configSchema: {
      pageId: { 
        label: 'Page ID', 
        type: 'string', 
        required: true,
        placeholder: '{{input.pageId}}'
      },
      properties: { 
        label: 'Properties to Update (JSON)', 
        type: 'json', 
        placeholder: '{"Status": {"select": {"name": "Complete"}}}'
      }
    },
    inputHandles: ['pageData'],
    outputHandles: ['updatedPage', 'error']
  },

  {
    type: 'airtableCreateRecord',
    name: 'Airtable: Create Record',
    icon: Database,
    description: 'Create a new record in an Airtable base and table',
    category: 'integrations',
    defaultConfig: {
      baseId: '',
      tableId: '',
      fields: {}
    },
    configSchema: {
      baseId: { 
        label: 'Base ID', 
        type: 'string', 
        required: true,
        helperText: 'Your Airtable base ID (starts with app...)'
      },
      tableId: { 
        label: 'Table Name', 
        type: 'string', 
        required: true,
        placeholder: 'Table 1'
      },
      fields: { 
        label: 'Record Fields (JSON)', 
        type: 'json', 
        required: true,
        placeholder: '{"Name": "{{input.name}}", "Email": "{{input.email}}"}'
      }
    },
    inputHandles: ['recordData'],
    outputHandles: ['record', 'error']
  },

  {
    type: 'airtableUpdateRecord',
    name: 'Airtable: Update Record',
    icon: Database,
    description: 'Update an existing record in Airtable',
    category: 'integrations',
    defaultConfig: {
      baseId: '',
      tableId: '',
      recordId: '{{input.recordId}}',
      fields: {}
    },
    configSchema: {
      baseId: { 
        label: 'Base ID', 
        type: 'string', 
        required: true 
      },
      tableId: { 
        label: 'Table Name', 
        type: 'string', 
        required: true 
      },
      recordId: { 
        label: 'Record ID', 
        type: 'string', 
        required: true,
        placeholder: '{{input.recordId}}'
      },
      fields: { 
        label: 'Fields to Update (JSON)', 
        type: 'json', 
        required: true 
      }
    },
    inputHandles: ['updateData'],
    outputHandles: ['updatedRecord', 'error']
  },

  // Project Management
  {
    type: 'mondayCreateItem',
    name: 'Monday.com: Create Item',
    icon: Calendar,
    description: 'Create a new item in a Monday.com board',
    category: 'integrations',
    defaultConfig: {
      boardId: '',
      groupId: '',
      itemName: '{{input.name}}',
      columnValues: {}
    },
    configSchema: {
      boardId: { 
        label: 'Board ID', 
        type: 'string', 
        required: true,
        helperText: 'The ID of the Monday.com board'
      },
      itemName: { 
        label: 'Item Name', 
        type: 'string', 
        required: true,
        placeholder: '{{input.name}}'
      },
      columnValues: { 
        label: 'Column Values (JSON)', 
        type: 'json', 
        placeholder: '{"status": "Working on it", "date": "2024-01-15"}'
      }
    },
    inputHandles: ['itemData'],
    outputHandles: ['item', 'error']
  },

  {
    type: 'linearCreateIssue',
    name: 'Linear: Create Issue',
    icon: Briefcase,
    description: 'Create a new issue in Linear project management',
    category: 'integrations',
    defaultConfig: {
      teamId: '',
      title: '{{input.title}}',
      description: '{{input.description}}',
      priority: 1,
      labelIds: []
    },
    configSchema: {
      teamId: { 
        label: 'Team ID', 
        type: 'string', 
        required: true,
        helperText: 'The ID of the Linear team'
      },
      title: { 
        label: 'Issue Title', 
        type: 'string', 
        required: true 
      },
      description: { 
        label: 'Issue Description', 
        type: 'textarea' 
      },
      priority: { 
        label: 'Priority', 
        type: 'select', 
        options: [
          { value: 1, label: 'Urgent' },
          { value: 2, label: 'High' },
          { value: 3, label: 'Medium' },
          { value: 4, label: 'Low' }
        ],
        defaultValue: 3
      }
    },
    inputHandles: ['issueData'],
    outputHandles: ['issue', 'error']
  },

  {
    type: 'clickupCreateTask',
    name: 'ClickUp: Create Task',
    icon: Briefcase,
    description: 'Create a new task in ClickUp workspace',
    category: 'integrations',
    defaultConfig: {
      listId: '',
      name: '{{input.name}}',
      description: '{{input.description}}',
      status: 'open',
      priority: 3
    },
    configSchema: {
      listId: { 
        label: 'List ID', 
        type: 'string', 
        required: true,
        helperText: 'The ID of the ClickUp list'
      },
      name: { 
        label: 'Task Name', 
        type: 'string', 
        required: true 
      },
      description: { 
        label: 'Task Description', 
        type: 'textarea' 
      },
      priority: { 
        label: 'Priority', 
        type: 'select', 
        options: [
          { value: 1, label: 'Urgent' },
          { value: 2, label: 'High' },
          { value: 3, label: 'Normal' },
          { value: 4, label: 'Low' }
        ]
      }
    },
    inputHandles: ['taskData'],
    outputHandles: ['task', 'error']
  },

  // Design & Creative
  {
    type: 'figmaCreateComment',
    name: 'Figma: Create Comment',
    icon: Palette,
    description: 'Add a comment to a Figma file or frame',
    category: 'integrations',
    defaultConfig: {
      fileKey: '',
      message: '{{input.comment}}',
      position: { x: 0, y: 0 }
    },
    configSchema: {
      fileKey: { 
        label: 'File Key', 
        type: 'string', 
        required: true,
        helperText: 'The Figma file key from the URL'
      },
      message: { 
        label: 'Comment Message', 
        type: 'textarea', 
        required: true,
        placeholder: '{{input.comment}}'
      }
    },
    inputHandles: ['commentData'],
    outputHandles: ['comment', 'error']
  },

  // Communication & Social
  {
    type: 'discordSendMessage',
    name: 'Discord: Send Message',
    icon: MessageSquare,
    description: 'Send a message to a Discord channel via webhook',
    category: 'integrations',
    defaultConfig: {
      webhookUrl: '',
      content: '{{input.message}}',
      username: 'Kairo Bot',
      embeds: []
    },
    configSchema: {
      webhookUrl: { 
        label: 'Discord Webhook URL', 
        type: 'string', 
        required: true,
        helperText: 'Discord channel webhook URL'
      },
      content: { 
        label: 'Message Content', 
        type: 'textarea', 
        required: true,
        placeholder: '{{input.message}}'
      },
      username: { 
        label: 'Bot Username', 
        type: 'string', 
        defaultValue: 'Kairo Bot' 
      }
    },
    inputHandles: ['messageData'],
    outputHandles: ['message', 'error']
  },

  {
    type: 'teamsPostMessage',
    name: 'Microsoft Teams: Post Message',
    icon: MessageSquare,
    description: 'Post a message to Microsoft Teams channel',
    category: 'integrations',
    defaultConfig: {
      webhookUrl: '',
      title: '{{input.title}}',
      text: '{{input.message}}',
      themeColor: '0076D7'
    },
    configSchema: {
      webhookUrl: { 
        label: 'Teams Webhook URL', 
        type: 'string', 
        required: true 
      },
      title: { 
        label: 'Message Title', 
        type: 'string',
        placeholder: '{{input.title}}'
      },
      text: { 
        label: 'Message Text', 
        type: 'textarea', 
        required: true 
      }
    },
    inputHandles: ['messageData'],
    outputHandles: ['response', 'error']
  },

  // E-commerce & Sales
  {
    type: 'woocommerceCreateOrder',
    name: 'WooCommerce: Create Order',
    icon: ShoppingCart,
    description: 'Create a new order in WooCommerce',
    category: 'integrations',
    defaultConfig: {
      storeUrl: '',
      customerEmail: '{{input.email}}',
      lineItems: [],
      status: 'pending'
    },
    configSchema: {
      storeUrl: { 
        label: 'Store URL', 
        type: 'string', 
        required: true,
        placeholder: 'https://mystore.com'
      },
      customerEmail: { 
        label: 'Customer Email', 
        type: 'string', 
        required: true 
      },
      lineItems: { 
        label: 'Line Items (JSON)', 
        type: 'json', 
        required: true,
        placeholder: '[{"product_id": 123, "quantity": 1}]'
      }
    },
    inputHandles: ['orderData'],
    outputHandles: ['order', 'error']
  },

  {
    type: 'bigcommerceCreateProduct',
    name: 'BigCommerce: Create Product',
    icon: ShoppingCart,
    description: 'Create a new product in BigCommerce store',
    category: 'integrations',
    defaultConfig: {
      storeHash: '',
      name: '{{input.name}}',
      type: 'physical',
      price: '{{input.price}}',
      categories: []
    },
    configSchema: {
      storeHash: { 
        label: 'Store Hash', 
        type: 'string', 
        required: true,
        helperText: 'Your BigCommerce store hash'
      },
      name: { 
        label: 'Product Name', 
        type: 'string', 
        required: true 
      },
      type: { 
        label: 'Product Type', 
        type: 'select', 
        options: ['physical', 'digital'],
        defaultValue: 'physical'
      }
    },
    inputHandles: ['productData'],
    outputHandles: ['product', 'error']
  },

  // Cloud Storage & Files
  {
    type: 'googleDriveCreateFile',
    name: 'Google Drive: Create File',
    icon: Cloud,
    description: 'Create or upload a file to Google Drive',
    category: 'integrations',
    defaultConfig: {
      fileName: '{{input.fileName}}',
      parentFolderId: '',
      content: '{{input.content}}',
      mimeType: 'text/plain'
    },
    configSchema: {
      fileName: { 
        label: 'File Name', 
        type: 'string', 
        required: true,
        placeholder: '{{input.fileName}}'
      },
      parentFolderId: { 
        label: 'Parent Folder ID (Optional)', 
        type: 'string',
        helperText: 'Leave empty to create in root'
      },
      content: { 
        label: 'File Content', 
        type: 'textarea', 
        required: true 
      }
    },
    inputHandles: ['fileData'],
    outputHandles: ['file', 'error']
  },

  {
    type: 'dropboxUploadFile',
    name: 'Dropbox: Upload File',
    icon: Cloud,
    description: 'Upload a file to Dropbox',
    category: 'integrations',
    defaultConfig: {
      filePath: '/{{input.fileName}}',
      content: '{{input.content}}',
      mode: 'add',
      autorename: true
    },
    configSchema: {
      filePath: { 
        label: 'File Path', 
        type: 'string', 
        required: true,
        placeholder: '/folder/file.txt',
        helperText: 'Full path including filename'
      },
      content: { 
        label: 'File Content', 
        type: 'textarea', 
        required: true 
      },
      mode: { 
        label: 'Upload Mode', 
        type: 'select', 
        options: ['add', 'overwrite'],
        defaultValue: 'add'
      }
    },
    inputHandles: ['fileData'],
    outputHandles: ['file', 'error']
  },

  // Analytics & Tracking
  {
    type: 'googleAnalyticsEvent',
    name: 'Google Analytics: Track Event',
    icon: BarChart3,
    description: 'Send custom event to Google Analytics 4',
    category: 'integrations',
    defaultConfig: {
      measurementId: '',
      apiSecret: '',
      clientId: '{{input.clientId}}',
      eventName: '{{input.eventName}}',
      parameters: {}
    },
    configSchema: {
      measurementId: { 
        label: 'Measurement ID', 
        type: 'string', 
        required: true,
        placeholder: 'G-XXXXXXXXXX'
      },
      apiSecret: { 
        label: 'API Secret', 
        type: 'string', 
        required: true,
        helperText: 'GA4 Measurement Protocol API Secret'
      },
      eventName: { 
        label: 'Event Name', 
        type: 'string', 
        required: true,
        placeholder: '{{input.eventName}}'
      },
      parameters: { 
        label: 'Event Parameters (JSON)', 
        type: 'json',
        placeholder: '{"value": 100, "currency": "USD"}'
      }
    },
    inputHandles: ['eventData'],
    outputHandles: ['response', 'error']
  },

  {
    type: 'mixpanelTrackEvent',
    name: 'Mixpanel: Track Event',
    icon: BarChart3,
    description: 'Track events and user actions in Mixpanel',
    category: 'integrations',
    defaultConfig: {
      projectToken: '',
      eventName: '{{input.eventName}}',
      distinctId: '{{input.userId}}',
      properties: {}
    },
    configSchema: {
      projectToken: { 
        label: 'Project Token', 
        type: 'string', 
        required: true 
      },
      eventName: { 
        label: 'Event Name', 
        type: 'string', 
        required: true 
      },
      distinctId: { 
        label: 'User ID', 
        type: 'string', 
        required: true,
        placeholder: '{{input.userId}}'
      },
      properties: { 
        label: 'Event Properties (JSON)', 
        type: 'json',
        placeholder: '{"plan": "premium", "feature": "export"}'
      }
    },
    inputHandles: ['eventData'],
    outputHandles: ['response', 'error']
  }
];

export const HIGH_PRIORITY_CATEGORIES = [
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Notion, Airtable, and productivity tools',
    count: HIGH_PRIORITY_INTEGRATIONS.filter(n => ['notionCreatePage', 'notionUpdatePage', 'airtableCreateRecord', 'airtableUpdateRecord'].includes(n.type)).length
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Monday.com, Linear, ClickUp integrations',
    count: HIGH_PRIORITY_INTEGRATIONS.filter(n => ['mondayCreateItem', 'linearCreateIssue', 'clickupCreateTask'].includes(n.type)).length
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Discord, Teams, and messaging platforms',
    count: HIGH_PRIORITY_INTEGRATIONS.filter(n => ['discordSendMessage', 'teamsPostMessage'].includes(n.type)).length
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'WooCommerce, BigCommerce, and sales platforms',
    count: HIGH_PRIORITY_INTEGRATIONS.filter(n => ['woocommerceCreateOrder', 'bigcommerceCreateProduct'].includes(n.type)).length
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Google Drive, Dropbox, and file management',
    count: HIGH_PRIORITY_INTEGRATIONS.filter(n => ['googleDriveCreateFile', 'dropboxUploadFile'].includes(n.type)).length
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Google Analytics, Mixpanel, and tracking tools',
    count: HIGH_PRIORITY_INTEGRATIONS.filter(n => ['googleAnalyticsEvent', 'mixpanelTrackEvent'].includes(n.type)).length
  }
];