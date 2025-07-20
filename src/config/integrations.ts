import type { AvailableNodeType } from '@/types/workflow';
import { 
  Database, Mail, TrendingUp, ShoppingCart, FileText, Calendar, 
  MessageSquare, BarChart3, Cloud, Twitter, Linkedin, Instagram, 
  Github, Zap, UserPlus, CreditCard, Smartphone, Globe, 
  Building2, Users, Settings, Bell, Share2, Download, Upload,
  Search, Filter, Hash, AtSign, Phone, MapPin, Clock, Star,
  Heart, ThumbsUp, Eye, Target, DollarSign, Percent, Activity,
  Layers, Palette, Music, Video, Image, File, Folder, Lock,
  Unlock, Shield, AlertTriangle, CheckCircle, XCircle, Info
} from 'lucide-react';

// CRM Integrations
export const CRM_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'salesforceCreateRecord',
    name: 'Salesforce: Create Record',
    icon: Database,
    description: 'Creates a new record in Salesforce (Contact, Lead, Account, Opportunity, etc.)',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      objectType: 'Contact',
      fields: '{"FirstName": "{{input.firstName}}", "LastName": "{{input.lastName}}", "Email": "{{input.email}}"}',
      apiVersion: '58.0',
      instanceUrl: '{{credential.SalesforceInstanceUrl}}',
      accessToken: '{{credential.SalesforceAccessToken}}'
    },
    configSchema: {
      objectType: {
        label: 'Object Type',
        type: 'select',
        options: ['Contact', 'Lead', 'Account', 'Opportunity', 'Case', 'Task', 'Event'],
        defaultValue: 'Contact',
        required: true
      },
      fields: {
        label: 'Fields (JSON)',
        type: 'json',
        placeholder: '{"FirstName": "{{input.firstName}}", "Email": "{{input.email}}"}',
        helperText: 'Object containing field names and values',
        required: true
      },
      apiVersion: {
        label: 'API Version',
        type: 'string',
        defaultValue: '58.0',
        helperText: 'Salesforce API version to use'
      },
      instanceUrl: {
        label: 'Instance URL',
        type: 'string',
        placeholder: 'https://your-instance.salesforce.com',
        helperText: 'Your Salesforce instance URL',
        required: true
      },
      accessToken: {
        label: 'Access Token',
        type: 'string',
        placeholder: '{{credential.SalesforceAccessToken}}',
        helperText: 'OAuth access token for Salesforce API',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['recordId', 'success', 'error']
  },
  {
    type: 'salesforceQueryRecords',
    name: 'Salesforce: Query Records',
    icon: Search,
    description: 'Executes a SOQL query to retrieve records from Salesforce',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      soqlQuery: 'SELECT Id, Name, Email FROM Contact WHERE Email = \'{{input.email}}\'',
      apiVersion: '58.0',
      instanceUrl: '{{credential.SalesforceInstanceUrl}}',
      accessToken: '{{credential.SalesforceAccessToken}}'
    },
    configSchema: {
      soqlQuery: {
        label: 'SOQL Query',
        type: 'textarea',
        placeholder: 'SELECT Id, Name, Email FROM Contact WHERE Email = \'{{input.email}}\'',
        helperText: 'SOQL query to execute',
        required: true
      },
      apiVersion: {
        label: 'API Version',
        type: 'string',
        defaultValue: '58.0'
      },
      instanceUrl: {
        label: 'Instance URL',
        type: 'string',
        placeholder: 'https://your-instance.salesforce.com',
        required: true
      },
      accessToken: {
        label: 'Access Token',
        type: 'string',
        placeholder: '{{credential.SalesforceAccessToken}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['records', 'totalSize', 'error']
  },
  {
    type: 'hubspotCreateContact',
    name: 'HubSpot: Create Contact',
    icon: UserPlus,
    description: 'Creates a new contact in HubSpot CRM',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      email: '{{input.email}}',
      properties: '{"firstname": "{{input.firstName}}", "lastname": "{{input.lastName}}", "phone": "{{input.phone}}"}',
      apiKey: '{{credential.HubSpotApiKey}}'
    },
    configSchema: {
      email: {
        label: 'Email',
        type: 'string',
        placeholder: '{{input.email}}',
        required: true
      },
      properties: {
        label: 'Contact Properties (JSON)',
        type: 'json',
        placeholder: '{"firstname": "{{input.firstName}}", "lastname": "{{input.lastName}}"}',
        helperText: 'HubSpot contact properties',
        required: true
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.HubSpotApiKey}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['contactId', 'success', 'error']
  },
  {
    type: 'pipedriveCreateDeal',
    name: 'Pipedrive: Create Deal',
    icon: TrendingUp,
    description: 'Creates a new deal in Pipedrive CRM',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      title: '{{input.dealTitle}}',
      value: '{{input.dealValue}}',
      currency: 'USD',
      stageId: 1,
      personId: '{{input.personId}}',
      apiToken: '{{credential.PipedriveApiToken}}'
    },
    configSchema: {
      title: {
        label: 'Deal Title',
        type: 'string',
        placeholder: '{{input.dealTitle}}',
        required: true
      },
      value: {
        label: 'Deal Value',
        type: 'number',
        placeholder: '10000'
      },
      currency: {
        label: 'Currency',
        type: 'select',
        options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        defaultValue: 'USD'
      },
      stageId: {
        label: 'Stage ID',
        type: 'number',
        placeholder: '1',
        helperText: 'Pipeline stage ID'
      },
      personId: {
        label: 'Person ID',
        type: 'string',
        placeholder: '{{input.personId}}',
        helperText: 'Associated person ID'
      },
      apiToken: {
        label: 'API Token',
        type: 'string',
        placeholder: '{{credential.PipedriveApiToken}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['dealId', 'success', 'error']
  }
];

// Marketing Integrations
export const MARKETING_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'mailchimpAddToList',
    name: 'Mailchimp: Add to List',
    icon: Mail,
    description: 'Adds a contact to a Mailchimp audience/list',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      listId: '{{input.listId}}',
      email: '{{input.email}}',
      mergeFields: '{"FNAME": "{{input.firstName}}", "LNAME": "{{input.lastName}}"}',
      apiKey: '{{credential.MailchimpApiKey}}',
      dataCenter: '{{credential.MailchimpDataCenter}}'
    },
    configSchema: {
      listId: {
        label: 'List/Audience ID',
        type: 'string',
        placeholder: '{{input.listId}}',
        required: true
      },
      email: {
        label: 'Email',
        type: 'string',
        placeholder: '{{input.email}}',
        required: true
      },
      mergeFields: {
        label: 'Merge Fields (JSON)',
        type: 'json',
        placeholder: '{"FNAME": "{{input.firstName}}", "LNAME": "{{input.lastName}}"}',
        helperText: 'Mailchimp merge fields'
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.MailchimpApiKey}}',
        required: true
      },
      dataCenter: {
        label: 'Data Center',
        type: 'string',
        placeholder: 'us1',
        helperText: 'Mailchimp data center (e.g., us1, us2)',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['contactId', 'success', 'error']
  },
  {
    type: 'convertkitAddSubscriber',
    name: 'ConvertKit: Add Subscriber',
    icon: UserPlus,
    description: 'Adds a subscriber to a ConvertKit form or sequence',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      formId: '{{input.formId}}',
      email: '{{input.email}}',
      firstName: '{{input.firstName}}',
      apiKey: '{{credential.ConvertKitApiKey}}'
    },
    configSchema: {
      formId: {
        label: 'Form ID',
        type: 'string',
        placeholder: '{{input.formId}}',
        required: true
      },
      email: {
        label: 'Email',
        type: 'string',
        placeholder: '{{input.email}}',
        required: true
      },
      firstName: {
        label: 'First Name',
        type: 'string',
        placeholder: '{{input.firstName}}'
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.ConvertKitApiKey}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['subscriberId', 'success', 'error']
  },
  {
    type: 'activecampaignCreateContact',
    name: 'ActiveCampaign: Create Contact',
    icon: Users,
    description: 'Creates a new contact in ActiveCampaign',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      email: '{{input.email}}',
      firstName: '{{input.firstName}}',
      lastName: '{{input.lastName}}',
      phone: '{{input.phone}}',
      apiUrl: '{{credential.ActiveCampaignApiUrl}}',
      apiKey: '{{credential.ActiveCampaignApiKey}}'
    },
    configSchema: {
      email: {
        label: 'Email',
        type: 'string',
        placeholder: '{{input.email}}',
        required: true
      },
      firstName: {
        label: 'First Name',
        type: 'string',
        placeholder: '{{input.firstName}}'
      },
      lastName: {
        label: 'Last Name',
        type: 'string',
        placeholder: '{{input.lastName}}'
      },
      phone: {
        label: 'Phone',
        type: 'string',
        placeholder: '{{input.phone}}'
      },
      apiUrl: {
        label: 'API URL',
        type: 'string',
        placeholder: 'https://your-account.api-us1.com',
        required: true
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.ActiveCampaignApiKey}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['contactId', 'success', 'error']
  }
];

// E-commerce Integrations
export const ECOMMERCE_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'shopifyCreateOrder',
    name: 'Shopify: Create Order',
    icon: ShoppingCart,
    description: 'Creates a new order in Shopify',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      customerId: '{{input.customerId}}',
      lineItems: '[{"variant_id": "{{input.variantId}}", "quantity": "{{input.quantity}}"}]',
      financialStatus: 'pending',
      shopDomain: '{{credential.ShopifyShopDomain}}',
      accessToken: '{{credential.ShopifyAccessToken}}'
    },
    configSchema: {
      customerId: {
        label: 'Customer ID',
        type: 'string',
        placeholder: '{{input.customerId}}',
        helperText: 'Optional customer ID'
      },
      lineItems: {
        label: 'Line Items (JSON Array)',
        type: 'json',
        placeholder: '[{"variant_id": "123456", "quantity": 1}]',
        helperText: 'Array of line items with variant_id and quantity',
        required: true
      },
      financialStatus: {
        label: 'Financial Status',
        type: 'select',
        options: ['pending', 'paid', 'refunded', 'partially_refunded'],
        defaultValue: 'pending'
      },
      shopDomain: {
        label: 'Shop Domain',
        type: 'string',
        placeholder: 'your-shop.myshopify.com',
        required: true
      },
      accessToken: {
        label: 'Access Token',
        type: 'string',
        placeholder: '{{credential.ShopifyAccessToken}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['orderId', 'success', 'error']
  },
  {
    type: 'stripeCreatePaymentLink',
    name: 'Stripe: Create Payment Link',
    icon: CreditCard,
    description: 'Creates a Stripe Payment Link for one-time or recurring payments',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      lineItems: '[{"price_data": {"currency": "usd", "product_data": {"name": "Product"}, "unit_amount": 2000}, "quantity": 1}]',
      apiKey: '{{credential.StripeApiKey}}'
    },
    configSchema: {
      lineItems: {
        label: 'Line Items (JSON Array)',
        type: 'json',
        placeholder: '[{"price_data": {"currency": "usd", "product_data": {"name": "Product"}, "unit_amount": 2000}, "quantity": 1}]',
        helperText: 'Array of line items for the payment link',
        required: true
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.StripeApiKey}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['paymentLinkId', 'paymentLinkUrl', 'error']
  }
];

// Productivity Integrations
export const PRODUCTIVITY_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'notionCreatePage',
    name: 'Notion: Create Page',
    icon: FileText,
    description: 'Creates a new page in Notion database',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      databaseId: '{{input.databaseId}}',
      properties: '{"Title": {"title": [{"text": {"content": "{{input.title}}"}}]}, "Status": {"select": {"name": "{{input.status}}"}}}',
      apiKey: '{{credential.NotionApiKey}}'
    },
    configSchema: {
      databaseId: {
        label: 'Database ID',
        type: 'string',
        placeholder: '{{input.databaseId}}',
        required: true
      },
      properties: {
        label: 'Properties (JSON)',
        type: 'json',
        placeholder: '{"Title": {"title": [{"text": {"content": "Page Title"}}]}}',
        helperText: 'Notion page properties in API format',
        required: true
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.NotionApiKey}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['pageId', 'success', 'error']
  },
  {
    type: 'airtableCreateRecord',
    name: 'Airtable: Create Record',
    icon: Database,
    description: 'Creates a new record in Airtable base',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      baseId: '{{input.baseId}}',
      tableName: '{{input.tableName}}',
      fields: '{"Name": "{{input.name}}", "Email": "{{input.email}}"}',
      apiKey: '{{credential.AirtableApiKey}}'
    },
    configSchema: {
      baseId: {
        label: 'Base ID',
        type: 'string',
        placeholder: '{{input.baseId}}',
        required: true
      },
      tableName: {
        label: 'Table Name',
        type: 'string',
        placeholder: '{{input.tableName}}',
        required: true
      },
      fields: {
        label: 'Fields (JSON)',
        type: 'json',
        placeholder: '{"Name": "{{input.name}}", "Email": "{{input.email}}"}',
        helperText: 'Record fields as JSON object',
        required: true
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.AirtableApiKey}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['recordId', 'success', 'error']
  }
];

// Communication Integrations
export const COMMUNICATION_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'slackPostMessage',
    name: 'Slack: Post Message',
    icon: MessageSquare,
    description: 'Posts a message to a Slack channel',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      channel: '#general',
      text: '{{input.message}}',
      token: '{{credential.SlackBotToken}}'
    },
    configSchema: {
      channel: {
        label: 'Channel',
        type: 'string',
        placeholder: '#general or C12345678',
        required: true
      },
      text: {
        label: 'Message Text',
        type: 'textarea',
        placeholder: '{{input.message}}',
        required: true
      },
      token: {
        label: 'Bot Token',
        type: 'string',
        placeholder: '{{credential.SlackBotToken}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },
  {
    type: 'discordSendMessage',
    name: 'Discord: Send Message',
    icon: MessageSquare,
    description: 'Sends a message to a Discord channel',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      channelId: '{{input.channelId}}',
      content: '{{input.message}}',
      webhookUrl: '{{credential.DiscordWebhookUrl}}'
    },
    configSchema: {
      channelId: {
        label: 'Channel ID',
        type: 'string',
        placeholder: '{{input.channelId}}',
        required: true
      },
      content: {
        label: 'Message Content',
        type: 'textarea',
        placeholder: '{{input.message}}',
        required: true
      },
      webhookUrl: {
        label: 'Webhook URL',
        type: 'string',
        placeholder: '{{credential.DiscordWebhookUrl}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },
  {
    type: 'twilioSendSms',
    name: 'Twilio: Send SMS',
    icon: Smartphone,
    description: 'Sends an SMS message using Twilio',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      to: '{{input.phoneNumber}}',
      from: '{{credential.TwilioFromNumber}}',
      body: '{{input.message}}',
      accountSid: '{{credential.TwilioAccountSid}}',
      authToken: '{{credential.TwilioAuthToken}}'
    },
    configSchema: {
      to: {
        label: 'To Phone Number',
        type: 'string',
        placeholder: '+15551234567',
        required: true
      },
      from: {
        label: 'From Phone Number',
        type: 'string',
        placeholder: '{{credential.TwilioFromNumber}}',
        required: true
      },
      body: {
        label: 'Message Body',
        type: 'textarea',
        placeholder: '{{input.message}}',
        required: true
      },
      accountSid: {
        label: 'Account SID',
        type: 'string',
        placeholder: '{{credential.TwilioAccountSid}}',
        required: true
      },
      authToken: {
        label: 'Auth Token',
        type: 'string',
        placeholder: '{{credential.TwilioAuthToken}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['messageSid', 'success', 'error']
  }
];

// Analytics Integrations
export const ANALYTICS_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'googleAnalyticsTrackEvent',
    name: 'Google Analytics: Track Event',
    icon: BarChart3,
    description: 'Tracks custom events in Google Analytics 4',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      measurementId: '{{credential.GAMeasurementId}}',
      apiSecret: '{{credential.GAApiSecret}}',
      eventName: '{{input.eventName}}',
      parameters: '{"custom_parameter": "{{input.value}}"}'
    },
    configSchema: {
      measurementId: {
        label: 'Measurement ID',
        type: 'string',
        placeholder: 'G-XXXXXXXXXX',
        required: true
      },
      apiSecret: {
        label: 'API Secret',
        type: 'string',
        placeholder: '{{credential.GAApiSecret}}',
        required: true
      },
      eventName: {
        label: 'Event Name',
        type: 'string',
        placeholder: '{{input.eventName}}',
        required: true
      },
      parameters: {
        label: 'Event Parameters (JSON)',
        type: 'json',
        placeholder: '{"custom_parameter": "value"}',
        helperText: 'Custom parameters for the event'
      }
    },
    inputHandles: ['input'],
    outputHandles: ['success', 'error']
  }
];

// Storage Integrations
export const STORAGE_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'awsS3UploadFile',
    name: 'AWS S3: Upload File',
    icon: Upload,
    description: 'Uploads a file to AWS S3 bucket',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      bucketName: '{{input.bucketName}}',
      key: '{{input.fileKey}}',
      content: '{{input.fileContent}}',
      contentType: 'text/plain',
      accessKeyId: '{{credential.AWSAccessKeyId}}',
      secretAccessKey: '{{credential.AWSSecretAccessKey}}',
      region: '{{credential.AWSRegion}}'
    },
    configSchema: {
      bucketName: {
        label: 'Bucket Name',
        type: 'string',
        placeholder: '{{input.bucketName}}',
        required: true
      },
      key: {
        label: 'File Key/Path',
        type: 'string',
        placeholder: '{{input.fileKey}}',
        required: true
      },
      content: {
        label: 'File Content',
        type: 'textarea',
        placeholder: '{{input.fileContent}}',
        required: true
      },
      contentType: {
        label: 'Content Type',
        type: 'string',
        defaultValue: 'text/plain',
        placeholder: 'application/json'
      },
      accessKeyId: {
        label: 'Access Key ID',
        type: 'string',
        placeholder: '{{credential.AWSAccessKeyId}}',
        required: true
      },
      secretAccessKey: {
        label: 'Secret Access Key',
        type: 'string',
        placeholder: '{{credential.AWSSecretAccessKey}}',
        required: true
      },
      region: {
        label: 'Region',
        type: 'string',
        placeholder: 'us-east-1',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['fileUrl', 'success', 'error']
  }
];

// Social Media Integrations
export const SOCIAL_MEDIA_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'twitterPostTweet',
    name: 'Twitter/X: Post Tweet',
    icon: Twitter,
    description: 'Posts a tweet to Twitter/X',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      text: '{{input.tweetText}}',
      apiKey: '{{credential.TwitterApiKey}}',
      apiSecret: '{{credential.TwitterApiSecret}}',
      accessToken: '{{credential.TwitterAccessToken}}',
      accessTokenSecret: '{{credential.TwitterAccessTokenSecret}}'
    },
    configSchema: {
      text: {
        label: 'Tweet Text',
        type: 'textarea',
        placeholder: '{{input.tweetText}}',
        required: true
      },
      apiKey: {
        label: 'API Key',
        type: 'string',
        placeholder: '{{credential.TwitterApiKey}}',
        required: true
      },
      apiSecret: {
        label: 'API Secret',
        type: 'string',
        placeholder: '{{credential.TwitterApiSecret}}',
        required: true
      },
      accessToken: {
        label: 'Access Token',
        type: 'string',
        placeholder: '{{credential.TwitterAccessToken}}',
        required: true
      },
      accessTokenSecret: {
        label: 'Access Token Secret',
        type: 'string',
        placeholder: '{{credential.TwitterAccessTokenSecret}}',
        required: true
      }
    },
    inputHandles: ['input'],
    outputHandles: ['tweetId', 'success', 'error']
  }
];

// Import top 50 integrations
import { TOP_50_INTEGRATIONS } from './top-50-integrations';

// Combine all integrations
export const ALL_INTEGRATIONS: AvailableNodeType[] = [
  ...CRM_INTEGRATIONS,
  ...MARKETING_INTEGRATIONS,
  ...ECOMMERCE_INTEGRATIONS,
  ...PRODUCTIVITY_INTEGRATIONS,
  ...COMMUNICATION_INTEGRATIONS,
  ...ANALYTICS_INTEGRATIONS,
  ...STORAGE_INTEGRATIONS,
  ...SOCIAL_MEDIA_INTEGRATIONS,
  ...TOP_50_INTEGRATIONS
];

// Integration categories for organization
export const INTEGRATION_CATEGORIES = {
  'CRM': CRM_INTEGRATIONS,
  'Marketing': MARKETING_INTEGRATIONS,
  'E-commerce': ECOMMERCE_INTEGRATIONS,
  'Productivity': PRODUCTIVITY_INTEGRATIONS,
  'Communication': COMMUNICATION_INTEGRATIONS,
  'Analytics': ANALYTICS_INTEGRATIONS,
  'Storage': STORAGE_INTEGRATIONS,
  'Social Media': SOCIAL_MEDIA_INTEGRATIONS
};