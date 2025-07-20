/**
 * Top 50 Most-Requested Integrations
 * Based on competitive analysis and market research
 */

import { AvailableNodeType } from '@/types/workflow';
import { 
  Database, Mail, TrendingUp, ShoppingCart, FileText, Calendar, 
  MessageSquare, BarChart3, Cloud, Twitter, Linkedin, Instagram, 
  Github, UserPlus, CreditCard, Smartphone, Globe, Building2, 
  Users, Settings, Bell, Share2, Download, Upload, Search, 
  Filter, Hash, AtSign, Phone, MapPin, Clock, Star, Heart, 
  ThumbsUp, Eye, Target, DollarSign, Percent, Activity, Layers, 
  Palette, Music, Video, Image, File, Folder, Lock, Unlock, 
  Shield, AlertTriangle, CheckCircle, XCircle, Info, Zap, 
  Play, Pause, SkipForward, Volume2, Headphones, Camera, 
  Edit, Copy, Scissors, RotateCw, Move, Package, Truck,
  Calculator, PieChart, LineChart, BarChart, Monitor, Cpu,
  HardDrive, Wifi, Bluetooth, MousePointer, Keyboard, Printer,
  Scan, QrCode, Barcode, Tag, Bookmark, Archive, Inbox, Plus
} from 'lucide-react';

// Top 50 Most-Requested Integrations
export const TOP_50_INTEGRATIONS: AvailableNodeType[] = [
  // 1. Google Workspace Suite
  {
    type: 'googleSheetsReadWrite',
    name: 'Google Sheets: Read/Write Data',
    icon: FileText,
    description: 'Read from and write to Google Sheets with full formatting support',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      spreadsheetId: '{{input.spreadsheetId}}',
      range: 'Sheet1!A1:Z1000',
      operation: 'read',
      values: '[[]]',
      serviceAccountKey: '{{credential.GoogleServiceAccount}}'
    },
    configSchema: {
      spreadsheetId: { label: 'Spreadsheet ID', type: 'string', required: true },
      range: { label: 'Range (A1 notation)', type: 'string', defaultValue: 'Sheet1!A1:Z1000' },
      operation: { label: 'Operation', type: 'select', options: ['read', 'write', 'append'], defaultValue: 'read' },
      values: { label: 'Values to Write (JSON)', type: 'json', placeholder: '[["Name", "Email"], ["John", "john@example.com"]]' },
      serviceAccountKey: { label: 'Service Account Key', type: 'string', placeholder: '{{credential.GoogleServiceAccount}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['data', 'rowCount', 'success', 'error']
  },

  {
    type: 'gmailSendEmail',
    name: 'Gmail: Send Email',
    icon: Mail,
    description: 'Send emails through Gmail with attachments and formatting',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      to: '{{input.email}}',
      subject: '{{input.subject}}',
      body: '{{input.message}}',
      html: false,
      attachments: '[]',
      accessToken: '{{credential.GmailAccessToken}}'
    },
    configSchema: {
      to: { label: 'To Email', type: 'string', required: true },
      cc: { label: 'CC (comma separated)', type: 'string' },
      bcc: { label: 'BCC (comma separated)', type: 'string' },
      subject: { label: 'Subject', type: 'string', required: true },
      body: { label: 'Message Body', type: 'textarea', required: true },
      html: { label: 'HTML Format', type: 'boolean', defaultValue: false },
      attachments: { label: 'Attachments (JSON)', type: 'json', placeholder: '[{"name": "file.pdf", "content": "base64content"}]' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.GmailAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },

  {
    type: 'googleCalendarCreateEvent',
    name: 'Google Calendar: Create Event',
    icon: Calendar,
    description: 'Create calendar events with attendees and reminders',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      calendarId: 'primary',
      summary: '{{input.title}}',
      description: '{{input.description}}',
      startDateTime: '{{input.startTime}}',
      endDateTime: '{{input.endTime}}',
      attendees: '[]',
      accessToken: '{{credential.GoogleCalendarAccessToken}}'
    },
    configSchema: {
      calendarId: { label: 'Calendar ID', type: 'string', defaultValue: 'primary' },
      summary: { label: 'Event Title', type: 'string', required: true },
      description: { label: 'Description', type: 'textarea' },
      startDateTime: { label: 'Start Date/Time (ISO)', type: 'string', required: true },
      endDateTime: { label: 'End Date/Time (ISO)', type: 'string', required: true },
      attendees: { label: 'Attendees (JSON)', type: 'json', placeholder: '[{"email": "attendee@example.com"}]' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.GoogleCalendarAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['eventId', 'eventLink', 'success', 'error']
  },

  {
    type: 'googleDriveUploadFile',
    name: 'Google Drive: Upload File',
    icon: Upload,
    description: 'Upload files to Google Drive with folder organization',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      fileName: '{{input.fileName}}',
      content: '{{input.content}}',
      mimeType: 'text/plain',
      parentFolderId: '',
      accessToken: '{{credential.GoogleDriveAccessToken}}'
    },
    configSchema: {
      fileName: { label: 'File Name', type: 'string', required: true },
      content: { label: 'File Content (base64 or text)', type: 'textarea', required: true },
      mimeType: { label: 'MIME Type', type: 'string', defaultValue: 'text/plain' },
      parentFolderId: { label: 'Parent Folder ID', type: 'string', helperText: 'Leave empty for root' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.GoogleDriveAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['fileId', 'fileLink', 'success', 'error']
  },

  // 2. Microsoft 365 Suite
  {
    type: 'outlookSendEmail',
    name: 'Outlook: Send Email',
    icon: Mail,
    description: 'Send emails through Microsoft Outlook/Office 365',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      to: '{{input.email}}',
      subject: '{{input.subject}}',
      body: '{{input.message}}',
      importance: 'normal',
      accessToken: '{{credential.OutlookAccessToken}}'
    },
    configSchema: {
      to: { label: 'To Email', type: 'string', required: true },
      cc: { label: 'CC (comma separated)', type: 'string' },
      subject: { label: 'Subject', type: 'string', required: true },
      body: { label: 'Message Body', type: 'textarea', required: true },
      importance: { label: 'Importance', type: 'select', options: ['low', 'normal', 'high'], defaultValue: 'normal' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.OutlookAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },

  {
    type: 'oneDriveUploadFile',
    name: 'OneDrive: Upload File',
    icon: Cloud,
    description: 'Upload files to Microsoft OneDrive',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      fileName: '{{input.fileName}}',
      content: '{{input.content}}',
      folderPath: '/',
      accessToken: '{{credential.OneDriveAccessToken}}'
    },
    configSchema: {
      fileName: { label: 'File Name', type: 'string', required: true },
      content: { label: 'File Content', type: 'textarea', required: true },
      folderPath: { label: 'Folder Path', type: 'string', defaultValue: '/', helperText: 'Path to upload folder' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.OneDriveAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['fileId', 'downloadUrl', 'success', 'error']
  },

  {
    type: 'teamsPostMessage',
    name: 'Microsoft Teams: Post Message',
    icon: MessageSquare,
    description: 'Post messages to Microsoft Teams channels',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      teamId: '{{input.teamId}}',
      channelId: '{{input.channelId}}',
      message: '{{input.message}}',
      accessToken: '{{credential.TeamsAccessToken}}'
    },
    configSchema: {
      teamId: { label: 'Team ID', type: 'string', required: true },
      channelId: { label: 'Channel ID', type: 'string', required: true },
      message: { label: 'Message', type: 'textarea', required: true },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.TeamsAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },

  // 3. Productivity & Project Management
  {
    type: 'notionDatabaseQuery',
    name: 'Notion: Query Database',
    icon: Database,
    description: 'Query and filter Notion database records',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      databaseId: '{{input.databaseId}}',
      filter: '{}',
      sorts: '[]',
      pageSize: 100,
      apiKey: '{{credential.NotionApiKey}}'
    },
    configSchema: {
      databaseId: { label: 'Database ID', type: 'string', required: true },
      filter: { label: 'Filter (JSON)', type: 'json', placeholder: '{"property": "Status", "select": {"equals": "Active"}}' },
      sorts: { label: 'Sorts (JSON)', type: 'json', placeholder: '[{"property": "Created", "direction": "descending"}]' },
      pageSize: { label: 'Page Size', type: 'number', defaultValue: 100 },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.NotionApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['results', 'hasMore', 'nextCursor', 'error']
  },

  {
    type: 'asanaCreateTask',
    name: 'Asana: Create Task',
    icon: CheckCircle,
    description: 'Create tasks in Asana projects with assignments and due dates',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      projectId: '{{input.projectId}}',
      name: '{{input.taskName}}',
      notes: '{{input.description}}',
      assigneeId: '{{input.assigneeId}}',
      dueDate: '{{input.dueDate}}',
      accessToken: '{{credential.AsanaAccessToken}}'
    },
    configSchema: {
      projectId: { label: 'Project ID', type: 'string', required: true },
      name: { label: 'Task Name', type: 'string', required: true },
      notes: { label: 'Task Description', type: 'textarea' },
      assigneeId: { label: 'Assignee ID', type: 'string' },
      dueDate: { label: 'Due Date (YYYY-MM-DD)', type: 'string' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.AsanaAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['taskId', 'taskUrl', 'success', 'error']
  },

  {
    type: 'trelloCreateCard',
    name: 'Trello: Create Card',
    icon: FileText,
    description: 'Create cards in Trello boards with labels and due dates',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      listId: '{{input.listId}}',
      name: '{{input.cardName}}',
      description: '{{input.description}}',
      dueDate: '{{input.dueDate}}',
      labels: '[]',
      apiKey: '{{credential.TrelloApiKey}}',
      token: '{{credential.TrelloToken}}'
    },
    configSchema: {
      listId: { label: 'List ID', type: 'string', required: true },
      name: { label: 'Card Name', type: 'string', required: true },
      description: { label: 'Description', type: 'textarea' },
      dueDate: { label: 'Due Date (ISO)', type: 'string' },
      labels: { label: 'Label IDs (JSON)', type: 'json', placeholder: '["label1", "label2"]' },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.TrelloApiKey}}', required: true },
      token: { label: 'Token', type: 'string', placeholder: '{{credential.TrelloToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['cardId', 'cardUrl', 'success', 'error']
  },

  {
    type: 'mondayCreateItem',
    name: 'Monday.com: Create Item',
    icon: UserPlus, // Temporarily using UserPlus instead of Plus
    description: 'Create items in Monday.com boards with custom field values',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      boardId: '{{input.boardId}}',
      itemName: '{{input.itemName}}',
      columnValues: '{}',
      groupId: '{{input.groupId}}',
      apiKey: '{{credential.MondayApiKey}}'
    },
    configSchema: {
      boardId: { label: 'Board ID', type: 'string', required: true },
      itemName: { label: 'Item Name', type: 'string', required: true },
      columnValues: { label: 'Column Values (JSON)', type: 'json', placeholder: '{"status": {"label": "Done"}, "date": {"date": "2024-01-01"}}' },
      groupId: { label: 'Group ID', type: 'string' },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.MondayApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['itemId', 'success', 'error']
  },

  {
    type: 'clickupCreateTask',
    name: 'ClickUp: Create Task',
    icon: Target,
    description: 'Create tasks in ClickUp with custom fields and time tracking',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      listId: '{{input.listId}}',
      name: '{{input.taskName}}',
      description: '{{input.description}}',
      assignees: '[]',
      priority: 3,
      dueDate: '{{input.dueDate}}',
      apiKey: '{{credential.ClickUpApiKey}}'
    },
    configSchema: {
      listId: { label: 'List ID', type: 'string', required: true },
      name: { label: 'Task Name', type: 'string', required: true },
      description: { label: 'Description', type: 'textarea' },
      assignees: { label: 'Assignee IDs (JSON)', type: 'json', placeholder: '[12345, 67890]' },
      priority: { label: 'Priority', type: 'select', options: ['1', '2', '3', '4'], defaultValue: '3' },
      dueDate: { label: 'Due Date (timestamp)', type: 'string' },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.ClickUpApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['taskId', 'taskUrl', 'success', 'error']
  },

  // 4. Communication & Messaging
  {
    type: 'slackCreateChannel',
    name: 'Slack: Create Channel',
    icon: Hash,
    description: 'Create public or private channels in Slack',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      name: '{{input.channelName}}',
      isPrivate: false,
      purpose: '{{input.purpose}}',
      topic: '{{input.topic}}',
      token: '{{credential.SlackBotToken}}'
    },
    configSchema: {
      name: { label: 'Channel Name', type: 'string', required: true },
      isPrivate: { label: 'Private Channel', type: 'boolean', defaultValue: false },
      purpose: { label: 'Channel Purpose', type: 'string' },
      topic: { label: 'Channel Topic', type: 'string' },
      token: { label: 'Bot Token', type: 'string', placeholder: '{{credential.SlackBotToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['channelId', 'channelName', 'success', 'error']
  },

  {
    type: 'slackInviteToChannel',
    name: 'Slack: Invite Users to Channel',
    icon: UserPlus,
    description: 'Invite users to Slack channels',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      channelId: '{{input.channelId}}',
      users: '{{input.userIds}}',
      token: '{{credential.SlackBotToken}}'
    },
    configSchema: {
      channelId: { label: 'Channel ID', type: 'string', required: true },
      users: { label: 'User IDs (comma separated)', type: 'string', required: true },
      token: { label: 'Bot Token', type: 'string', placeholder: '{{credential.SlackBotToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['success', 'error']
  },

  {
    type: 'discordCreateChannel',
    name: 'Discord: Create Channel',
    icon: Hash,
    description: 'Create text or voice channels in Discord servers',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      guildId: '{{input.guildId}}',
      name: '{{input.channelName}}',
      type: 0,
      topic: '{{input.topic}}',
      botToken: '{{credential.DiscordBotToken}}'
    },
    configSchema: {
      guildId: { label: 'Guild/Server ID', type: 'string', required: true },
      name: { label: 'Channel Name', type: 'string', required: true },
      type: { label: 'Channel Type', type: 'select', options: ['0', '2'], defaultValue: '0', helperText: '0=Text, 2=Voice' },
      topic: { label: 'Channel Topic', type: 'string' },
      botToken: { label: 'Bot Token', type: 'string', placeholder: '{{credential.DiscordBotToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['channelId', 'success', 'error']
  },

  {
    type: 'whatsappSendMessage',
    name: 'WhatsApp: Send Message',
    icon: MessageSquare,
    description: 'Send WhatsApp messages via Business API',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      to: '{{input.phoneNumber}}',
      message: '{{input.message}}',
      type: 'text',
      accessToken: '{{credential.WhatsAppAccessToken}}',
      phoneNumberId: '{{credential.WhatsAppPhoneNumberId}}'
    },
    configSchema: {
      to: { label: 'To Phone Number', type: 'string', required: true, helperText: 'Include country code' },
      message: { label: 'Message', type: 'textarea', required: true },
      type: { label: 'Message Type', type: 'select', options: ['text', 'template'], defaultValue: 'text' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.WhatsAppAccessToken}}', required: true },
      phoneNumberId: { label: 'Phone Number ID', type: 'string', placeholder: '{{credential.WhatsAppPhoneNumberId}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },

  // 5. E-commerce & Payments
  {
    type: 'shopifyGetOrders',
    name: 'Shopify: Get Orders',
    icon: ShoppingCart,
    description: 'Retrieve orders from Shopify store with filtering',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      status: 'any',
      limit: 50,
      createdAtMin: '',
      createdAtMax: '',
      financialStatus: 'any',
      shopDomain: '{{credential.ShopifyShopDomain}}',
      accessToken: '{{credential.ShopifyAccessToken}}'
    },
    configSchema: {
      status: { label: 'Order Status', type: 'select', options: ['open', 'closed', 'cancelled', 'any'], defaultValue: 'any' },
      limit: { label: 'Limit', type: 'number', defaultValue: 50 },
      createdAtMin: { label: 'Created After (ISO)', type: 'string' },
      createdAtMax: { label: 'Created Before (ISO)', type: 'string' },
      financialStatus: { label: 'Financial Status', type: 'select', options: ['authorized', 'paid', 'pending', 'refunded', 'any'], defaultValue: 'any' },
      shopDomain: { label: 'Shop Domain', type: 'string', placeholder: 'your-shop.myshopify.com', required: true },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.ShopifyAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['orders', 'count', 'success', 'error']
  },

  {
    type: 'shopifyUpdateInventory',
    name: 'Shopify: Update Inventory',
    icon: Package,
    description: 'Update product inventory levels in Shopify',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      variantId: '{{input.variantId}}',
      quantity: '{{input.quantity}}',
      locationId: '{{input.locationId}}',
      shopDomain: '{{credential.ShopifyShopDomain}}',
      accessToken: '{{credential.ShopifyAccessToken}}'
    },
    configSchema: {
      variantId: { label: 'Variant ID', type: 'string', required: true },
      quantity: { label: 'New Quantity', type: 'number', required: true },
      locationId: { label: 'Location ID', type: 'string', required: true },
      shopDomain: { label: 'Shop Domain', type: 'string', placeholder: 'your-shop.myshopify.com', required: true },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.ShopifyAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['inventoryItemId', 'success', 'error']
  },

  {
    type: 'woocommerceGetOrders',
    name: 'WooCommerce: Get Orders',
    icon: ShoppingCart,
    description: 'Retrieve WooCommerce orders with filtering options',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      status: 'any',
      per_page: 10,
      after: '',
      before: '',
      consumerKey: '{{credential.WooCommerceKey}}',
      consumerSecret: '{{credential.WooCommerceSecret}}',
      siteUrl: '{{credential.WooCommerceSiteUrl}}'
    },
    configSchema: {
      status: { label: 'Order Status', type: 'select', options: ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed', 'any'], defaultValue: 'any' },
      per_page: { label: 'Orders per Page', type: 'number', defaultValue: 10 },
      after: { label: 'After Date (ISO)', type: 'string' },
      before: { label: 'Before Date (ISO)', type: 'string' },
      consumerKey: { label: 'Consumer Key', type: 'string', placeholder: '{{credential.WooCommerceKey}}', required: true },
      consumerSecret: { label: 'Consumer Secret', type: 'string', placeholder: '{{credential.WooCommerceSecret}}', required: true },
      siteUrl: { label: 'Site URL', type: 'string', placeholder: 'https://yourstore.com', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['orders', 'totalOrders', 'success', 'error']
  },

  {
    type: 'stripeRetrievePayment',
    name: 'Stripe: Retrieve Payment',
    icon: CreditCard,
    description: 'Retrieve payment details from Stripe',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      paymentIntentId: '{{input.paymentIntentId}}',
      apiKey: '{{credential.StripeSecretKey}}'
    },
    configSchema: {
      paymentIntentId: { label: 'Payment Intent ID', type: 'string', required: true },
      apiKey: { label: 'Secret Key', type: 'string', placeholder: '{{credential.StripeSecretKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['payment', 'status', 'amount', 'currency', 'error']
  },

  {
    type: 'stripeCreateCustomer',
    name: 'Stripe: Create Customer',
    icon: UserPlus,
    description: 'Create a new customer in Stripe',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      email: '{{input.email}}',
      name: '{{input.name}}',
      phone: '{{input.phone}}',
      description: '{{input.description}}',
      metadata: '{}',
      apiKey: '{{credential.StripeSecretKey}}'
    },
    configSchema: {
      email: { label: 'Email', type: 'string', required: true },
      name: { label: 'Name', type: 'string' },
      phone: { label: 'Phone', type: 'string' },
      description: { label: 'Description', type: 'string' },
      metadata: { label: 'Metadata (JSON)', type: 'json', placeholder: '{"user_id": "123"}' },
      apiKey: { label: 'Secret Key', type: 'string', placeholder: '{{credential.StripeSecretKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['customerId', 'success', 'error']
  },

  {
    type: 'paypalCreatePayment',
    name: 'PayPal: Create Payment',
    icon: CreditCard,
    description: 'Create payment requests through PayPal',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      amount: '{{input.amount}}',
      currency: 'USD',
      description: '{{input.description}}',
      returnUrl: '{{input.returnUrl}}',
      cancelUrl: '{{input.cancelUrl}}',
      clientId: '{{credential.PayPalClientId}}',
      clientSecret: '{{credential.PayPalClientSecret}}',
      environment: 'sandbox'
    },
    configSchema: {
      amount: { label: 'Amount', type: 'number', required: true },
      currency: { label: 'Currency', type: 'string', defaultValue: 'USD' },
      description: { label: 'Description', type: 'string', required: true },
      returnUrl: { label: 'Return URL', type: 'string', required: true },
      cancelUrl: { label: 'Cancel URL', type: 'string', required: true },
      clientId: { label: 'Client ID', type: 'string', placeholder: '{{credential.PayPalClientId}}', required: true },
      clientSecret: { label: 'Client Secret', type: 'string', placeholder: '{{credential.PayPalClientSecret}}', required: true },
      environment: { label: 'Environment', type: 'select', options: ['sandbox', 'production'], defaultValue: 'sandbox' }
    },
    inputHandles: ['input'],
    outputHandles: ['paymentId', 'approvalUrl', 'success', 'error']
  },

  // 6. Social Media & Marketing
  {
    type: 'facebookPostToPage',
    name: 'Facebook: Post to Page',
    icon: Share2,
    description: 'Post content to Facebook business pages',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      pageId: '{{input.pageId}}',
      message: '{{input.message}}',
      link: '{{input.link}}',
      published: true,
      accessToken: '{{credential.FacebookPageAccessToken}}'
    },
    configSchema: {
      pageId: { label: 'Page ID', type: 'string', required: true },
      message: { label: 'Post Message', type: 'textarea', required: true },
      link: { label: 'Link URL', type: 'string' },
      published: { label: 'Publish Immediately', type: 'boolean', defaultValue: true },
      accessToken: { label: 'Page Access Token', type: 'string', placeholder: '{{credential.FacebookPageAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['postId', 'success', 'error']
  },

  {
    type: 'instagramPostPhoto',
    name: 'Instagram: Post Photo',
    icon: Image,
    description: 'Post photos to Instagram business accounts',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      accountId: '{{input.accountId}}',
      imageUrl: '{{input.imageUrl}}',
      caption: '{{input.caption}}',
      accessToken: '{{credential.InstagramAccessToken}}'
    },
    configSchema: {
      accountId: { label: 'Instagram Account ID', type: 'string', required: true },
      imageUrl: { label: 'Image URL', type: 'string', required: true },
      caption: { label: 'Caption', type: 'textarea' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.InstagramAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['postId', 'success', 'error']
  },

  {
    type: 'linkedinPostToProfile',
    name: 'LinkedIn: Post to Profile',
    icon: Linkedin,
    description: 'Share posts on LinkedIn personal or company profiles',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      profileId: '{{input.profileId}}',
      text: '{{input.text}}',
      visibility: 'PUBLIC',
      accessToken: '{{credential.LinkedInAccessToken}}'
    },
    configSchema: {
      profileId: { label: 'Profile/Company ID', type: 'string', required: true },
      text: { label: 'Post Text', type: 'textarea', required: true },
      visibility: { label: 'Visibility', type: 'select', options: ['PUBLIC', 'CONNECTIONS'], defaultValue: 'PUBLIC' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.LinkedInAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['postId', 'success', 'error']
  },

  {
    type: 'youtubeUploadVideo',
    name: 'YouTube: Upload Video',
    icon: Video,
    description: 'Upload videos to YouTube with metadata',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      title: '{{input.title}}',
      description: '{{input.description}}',
      tags: '{{input.tags}}',
      categoryId: '22',
      privacy: 'public',
      videoFile: '{{input.videoFile}}',
      accessToken: '{{credential.YouTubeAccessToken}}'
    },
    configSchema: {
      title: { label: 'Video Title', type: 'string', required: true },
      description: { label: 'Description', type: 'textarea' },
      tags: { label: 'Tags (comma separated)', type: 'string' },
      categoryId: { label: 'Category ID', type: 'string', defaultValue: '22' },
      privacy: { label: 'Privacy', type: 'select', options: ['public', 'unlisted', 'private'], defaultValue: 'public' },
      videoFile: { label: 'Video File (base64)', type: 'textarea', required: true },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.YouTubeAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['videoId', 'videoUrl', 'success', 'error']
  },

  {
    type: 'tiktokPostVideo',
    name: 'TikTok: Post Video',
    icon: Video,
    description: 'Upload videos to TikTok for Business',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      videoFile: '{{input.videoFile}}',
      caption: '{{input.caption}}',
      privacy: 'PUBLIC_TO_EVERYONE',
      accessToken: '{{credential.TikTokAccessToken}}'
    },
    configSchema: {
      videoFile: { label: 'Video File (base64)', type: 'textarea', required: true },
      caption: { label: 'Caption', type: 'textarea' },
      privacy: { label: 'Privacy', type: 'select', options: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIEND', 'FOLLOWER_OF_CREATOR'], defaultValue: 'PUBLIC_TO_EVERYONE' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.TikTokAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['videoId', 'shareUrl', 'success', 'error']
  },

  // 7. Analytics & Data
  {
    type: 'googleAnalyticsGetReports',
    name: 'Google Analytics: Get Reports',
    icon: BarChart3,
    description: 'Retrieve analytics data and reports from Google Analytics 4',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      propertyId: '{{input.propertyId}}',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      metrics: '["sessions", "pageviews"]',
      dimensions: '["date"]',
      accessToken: '{{credential.GoogleAnalyticsAccessToken}}'
    },
    configSchema: {
      propertyId: { label: 'Property ID', type: 'string', required: true },
      startDate: { label: 'Start Date (YYYY-MM-DD)', type: 'string', required: true },
      endDate: { label: 'End Date (YYYY-MM-DD)', type: 'string', required: true },
      metrics: { label: 'Metrics (JSON array)', type: 'json', placeholder: '["sessions", "pageviews", "users"]' },
      dimensions: { label: 'Dimensions (JSON array)', type: 'json', placeholder: '["date", "country"]' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.GoogleAnalyticsAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['data', 'totalRows', 'success', 'error']
  },

  {
    type: 'mixpanelTrackEvent',
    name: 'Mixpanel: Track Event',
    icon: Activity,
    description: 'Track custom events and user actions in Mixpanel',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      event: '{{input.eventName}}',
      distinctId: '{{input.userId}}',
      properties: '{}',
      projectToken: '{{credential.MixpanelProjectToken}}'
    },
    configSchema: {
      event: { label: 'Event Name', type: 'string', required: true },
      distinctId: { label: 'User ID', type: 'string', required: true },
      properties: { label: 'Event Properties (JSON)', type: 'json', placeholder: '{"category": "signup", "plan": "premium"}' },
      projectToken: { label: 'Project Token', type: 'string', placeholder: '{{credential.MixpanelProjectToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['success', 'error']
  },

  {
    type: 'amplitudeTrackEvent',
    name: 'Amplitude: Track Event',
    icon: BarChart3,
    description: 'Send event data to Amplitude for user analytics',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      eventType: '{{input.eventType}}',
      userId: '{{input.userId}}',
      eventProperties: '{}',
      userProperties: '{}',
      apiKey: '{{credential.AmplitudeApiKey}}'
    },
    configSchema: {
      eventType: { label: 'Event Type', type: 'string', required: true },
      userId: { label: 'User ID', type: 'string', required: true },
      eventProperties: { label: 'Event Properties (JSON)', type: 'json', placeholder: '{"category": "purchase", "amount": 99.99}' },
      userProperties: { label: 'User Properties (JSON)', type: 'json', placeholder: '{"plan": "premium", "country": "US"}' },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.AmplitudeApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['success', 'error']
  },

  {
    type: 'hotjarCreateFunnel',
    name: 'Hotjar: Create Funnel',
    icon: Filter,
    description: 'Create conversion funnels in Hotjar',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      siteId: '{{input.siteId}}',
      name: '{{input.funnelName}}',
      steps: '[]',
      apiKey: '{{credential.HotjarApiKey}}'
    },
    configSchema: {
      siteId: { label: 'Site ID', type: 'string', required: true },
      name: { label: 'Funnel Name', type: 'string', required: true },
      steps: { label: 'Funnel Steps (JSON)', type: 'json', placeholder: '[{"url": "/signup", "name": "Sign Up"}, {"url": "/dashboard", "name": "Dashboard"}]', required: true },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.HotjarApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['funnelId', 'success', 'error']
  },

  // 8. Development & DevOps
  {
    type: 'githubCreatePullRequest',
    name: 'GitHub: Create Pull Request',
    icon: Github,
    description: 'Create pull requests in GitHub repositories',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      owner: '{{input.owner}}',
      repo: '{{input.repo}}',
      title: '{{input.title}}',
      body: '{{input.description}}',
      head: '{{input.headBranch}}',
      base: 'main',
      draft: false,
      token: '{{credential.GitHubToken}}'
    },
    configSchema: {
      owner: { label: 'Repository Owner', type: 'string', required: true },
      repo: { label: 'Repository Name', type: 'string', required: true },
      title: { label: 'PR Title', type: 'string', required: true },
      body: { label: 'PR Description', type: 'textarea' },
      head: { label: 'Head Branch', type: 'string', required: true },
      base: { label: 'Base Branch', type: 'string', defaultValue: 'main' },
      draft: { label: 'Draft PR', type: 'boolean', defaultValue: false },
      token: { label: 'GitHub Token', type: 'string', placeholder: '{{credential.GitHubToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['prId', 'prUrl', 'prNumber', 'success', 'error']
  },

  {
    type: 'githubMergePullRequest',
    name: 'GitHub: Merge Pull Request',
    icon: GitMerge,
    description: 'Merge pull requests in GitHub repositories',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      owner: '{{input.owner}}',
      repo: '{{input.repo}}',
      pullNumber: '{{input.pullNumber}}',
      commitTitle: '{{input.commitTitle}}',
      commitMessage: '{{input.commitMessage}}',
      mergeMethod: 'merge',
      token: '{{credential.GitHubToken}}'
    },
    configSchema: {
      owner: { label: 'Repository Owner', type: 'string', required: true },
      repo: { label: 'Repository Name', type: 'string', required: true },
      pullNumber: { label: 'Pull Request Number', type: 'number', required: true },
      commitTitle: { label: 'Merge Commit Title', type: 'string' },
      commitMessage: { label: 'Merge Commit Message', type: 'textarea' },
      mergeMethod: { label: 'Merge Method', type: 'select', options: ['merge', 'squash', 'rebase'], defaultValue: 'merge' },
      token: { label: 'GitHub Token', type: 'string', placeholder: '{{credential.GitHubToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['commitSha', 'merged', 'success', 'error']
  },

  {
    type: 'jiraCreateIssue',
    name: 'Jira: Create Issue',
    icon: AlertTriangle,
    description: 'Create issues in Jira projects',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      projectKey: '{{input.projectKey}}',
      issueType: 'Task',
      summary: '{{input.summary}}',
      description: '{{input.description}}',
      assignee: '{{input.assignee}}',
      priority: 'Medium',
      apiToken: '{{credential.JiraApiToken}}',
      email: '{{credential.JiraEmail}}',
      baseUrl: '{{credential.JiraBaseUrl}}'
    },
    configSchema: {
      projectKey: { label: 'Project Key', type: 'string', required: true },
      issueType: { label: 'Issue Type', type: 'string', defaultValue: 'Task' },
      summary: { label: 'Issue Summary', type: 'string', required: true },
      description: { label: 'Description', type: 'textarea' },
      assignee: { label: 'Assignee Email', type: 'string' },
      priority: { label: 'Priority', type: 'select', options: ['Highest', 'High', 'Medium', 'Low', 'Lowest'], defaultValue: 'Medium' },
      apiToken: { label: 'API Token', type: 'string', placeholder: '{{credential.JiraApiToken}}', required: true },
      email: { label: 'Email', type: 'string', placeholder: '{{credential.JiraEmail}}', required: true },
      baseUrl: { label: 'Base URL', type: 'string', placeholder: 'https://yourcompany.atlassian.net', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['issueId', 'issueKey', 'issueUrl', 'success', 'error']
  },

  {
    type: 'confluenceCreatePage',
    name: 'Confluence: Create Page',
    icon: FileText,
    description: 'Create pages in Confluence spaces',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      spaceKey: '{{input.spaceKey}}',
      title: '{{input.title}}',
      body: '{{input.content}}',
      parentId: '{{input.parentId}}',
      apiToken: '{{credential.ConfluenceApiToken}}',
      email: '{{credential.ConfluenceEmail}}',
      baseUrl: '{{credential.ConfluenceBaseUrl}}'
    },
    configSchema: {
      spaceKey: { label: 'Space Key', type: 'string', required: true },
      title: { label: 'Page Title', type: 'string', required: true },
      body: { label: 'Page Content (HTML)', type: 'textarea', required: true },
      parentId: { label: 'Parent Page ID', type: 'string', helperText: 'Leave empty for root level' },
      apiToken: { label: 'API Token', type: 'string', placeholder: '{{credential.ConfluenceApiToken}}', required: true },
      email: { label: 'Email', type: 'string', placeholder: '{{credential.ConfluenceEmail}}', required: true },
      baseUrl: { label: 'Base URL', type: 'string', placeholder: 'https://yourcompany.atlassian.net', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['pageId', 'pageUrl', 'success', 'error']
  },

  {
    type: 'dockerHubPushImage',
    name: 'Docker Hub: Push Image',
    icon: Package,
    description: 'Push Docker images to Docker Hub repositories',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      namespace: '{{input.namespace}}',
      repository: '{{input.repository}}',
      tag: '{{input.tag}}',
      dockerfile: '{{input.dockerfile}}',
      buildContext: '{{input.buildContext}}',
      username: '{{credential.DockerHubUsername}}',
      password: '{{credential.DockerHubPassword}}'
    },
    configSchema: {
      namespace: { label: 'Namespace/Username', type: 'string', required: true },
      repository: { label: 'Repository Name', type: 'string', required: true },
      tag: { label: 'Image Tag', type: 'string', defaultValue: 'latest' },
      dockerfile: { label: 'Dockerfile Content', type: 'textarea', required: true },
      buildContext: { label: 'Build Context (base64 tar)', type: 'textarea', required: true },
      username: { label: 'Docker Hub Username', type: 'string', placeholder: '{{credential.DockerHubUsername}}', required: true },
      password: { label: 'Docker Hub Password', type: 'string', placeholder: '{{credential.DockerHubPassword}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['imageId', 'imageUrl', 'success', 'error']
  },

  // 9. Cloud Storage & Files
  {
    type: 'dropboxListFiles',
    name: 'Dropbox: List Files',
    icon: Folder,
    description: 'List files and folders in Dropbox',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      path: '/',
      recursive: false,
      includeMediaInfo: false,
      includeDeleted: false,
      accessToken: '{{credential.DropboxAccessToken}}'
    },
    configSchema: {
      path: { label: 'Folder Path', type: 'string', defaultValue: '/', helperText: 'Path to list (use / for root)' },
      recursive: { label: 'Recursive', type: 'boolean', defaultValue: false, helperText: 'List files in subfolders' },
      includeMediaInfo: { label: 'Include Media Info', type: 'boolean', defaultValue: false },
      includeDeleted: { label: 'Include Deleted', type: 'boolean', defaultValue: false },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.DropboxAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['files', 'folders', 'hasMore', 'cursor', 'error']
  },

  {
    type: 'dropboxDownloadFile',
    name: 'Dropbox: Download File',
    icon: Download,
    description: 'Download files from Dropbox',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      path: '{{input.filePath}}',
      rev: '{{input.revision}}',
      accessToken: '{{credential.DropboxAccessToken}}'
    },
    configSchema: {
      path: { label: 'File Path', type: 'string', required: true },
      rev: { label: 'File Revision', type: 'string', helperText: 'Specific revision to download' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.DropboxAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'contentType', 'size', 'lastModified', 'error']
  },

  {
    type: 'awsS3ListObjects',
    name: 'AWS S3: List Objects',
    icon: Cloud,
    description: 'List objects in AWS S3 buckets',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      bucket: '{{input.bucketName}}',
      prefix: '{{input.prefix}}',
      delimiter: '',
      maxKeys: 1000,
      accessKeyId: '{{credential.AWSAccessKeyId}}',
      secretAccessKey: '{{credential.AWSSecretAccessKey}}',
      region: '{{credential.AWSRegion}}'
    },
    configSchema: {
      bucket: { label: 'Bucket Name', type: 'string', required: true },
      prefix: { label: 'Prefix Filter', type: 'string', helperText: 'Filter objects by prefix' },
      delimiter: { label: 'Delimiter', type: 'string', helperText: 'Group objects by delimiter' },
      maxKeys: { label: 'Max Keys', type: 'number', defaultValue: 1000 },
      accessKeyId: { label: 'Access Key ID', type: 'string', placeholder: '{{credential.AWSAccessKeyId}}', required: true },
      secretAccessKey: { label: 'Secret Access Key', type: 'string', placeholder: '{{credential.AWSSecretAccessKey}}', required: true },
      region: { label: 'Region', type: 'string', placeholder: 'us-east-1', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['objects', 'commonPrefixes', 'isTruncated', 'nextMarker', 'error']
  },

  {
    type: 'awsS3DownloadObject',
    name: 'AWS S3: Download Object',
    icon: Download,
    description: 'Download objects from AWS S3 buckets',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      bucket: '{{input.bucketName}}',
      key: '{{input.objectKey}}',
      versionId: '{{input.versionId}}',
      accessKeyId: '{{credential.AWSAccessKeyId}}',
      secretAccessKey: '{{credential.AWSSecretAccessKey}}',
      region: '{{credential.AWSRegion}}'
    },
    configSchema: {
      bucket: { label: 'Bucket Name', type: 'string', required: true },
      key: { label: 'Object Key', type: 'string', required: true },
      versionId: { label: 'Version ID', type: 'string', helperText: 'Specific version to download' },
      accessKeyId: { label: 'Access Key ID', type: 'string', placeholder: '{{credential.AWSAccessKeyId}}', required: true },
      secretAccessKey: { label: 'Secret Access Key', type: 'string', placeholder: '{{credential.AWSSecretAccessKey}}', required: true },
      region: { label: 'Region', type: 'string', placeholder: 'us-east-1', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'contentType', 'contentLength', 'lastModified', 'etag', 'error']
  },

  // 10. Additional High-Value Integrations
  {
    type: 'openaiChatCompletion',
    name: 'OpenAI: Chat Completion',
    icon: Bot,
    description: 'Generate responses using OpenAI GPT models',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      model: 'gpt-4',
      messages: '[{"role": "user", "content": "{{input.prompt}}"}]',
      temperature: 0.7,
      maxTokens: 150,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      apiKey: '{{credential.OpenAIApiKey}}'
    },
    configSchema: {
      model: { label: 'Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'], defaultValue: 'gpt-4' },
      messages: { label: 'Messages (JSON)', type: 'json', required: true },
      temperature: { label: 'Temperature', type: 'number', defaultValue: 0.7 },
      maxTokens: { label: 'Max Tokens', type: 'number', defaultValue: 150 },
      topP: { label: 'Top P', type: 'number', defaultValue: 1 },
      frequencyPenalty: { label: 'Frequency Penalty', type: 'number', defaultValue: 0 },
      presencePenalty: { label: 'Presence Penalty', type: 'number', defaultValue: 0 },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.OpenAIApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'finishReason', 'usage', 'error']
  },

  {
    type: 'anthropicClaude',
    name: 'Anthropic: Claude AI',
    icon: Bot,
    description: 'Generate responses using Anthropic Claude models',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      model: 'claude-3-sonnet-20240229',
      messages: '[{"role": "user", "content": "{{input.prompt}}"}]',
      maxTokens: 1024,
      temperature: 0.7,
      topP: 1,
      apiKey: '{{credential.AnthropicApiKey}}'
    },
    configSchema: {
      model: { label: 'Model', type: 'select', options: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'], defaultValue: 'claude-3-sonnet-20240229' },
      messages: { label: 'Messages (JSON)', type: 'json', required: true },
      maxTokens: { label: 'Max Tokens', type: 'number', defaultValue: 1024 },
      temperature: { label: 'Temperature', type: 'number', defaultValue: 0.7 },
      topP: { label: 'Top P', type: 'number', defaultValue: 1 },
      apiKey: { label: 'API Key', type: 'string', placeholder: '{{credential.AnthropicApiKey}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['content', 'usage', 'error']
  },

  {
    type: 'zapierWebhook',
    name: 'Zapier: Trigger Webhook',
    icon: Zap,
    description: 'Trigger Zapier workflows via webhooks',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      webhookUrl: '{{input.webhookUrl}}',
      data: '{{input.data}}',
      method: 'POST'
    },
    configSchema: {
      webhookUrl: { label: 'Zapier Webhook URL', type: 'string', required: true },
      data: { label: 'Data to Send (JSON)', type: 'json', required: true },
      method: { label: 'HTTP Method', type: 'select', options: ['POST', 'PUT'], defaultValue: 'POST' }
    },
    inputHandles: ['input'],
    outputHandles: ['response', 'status', 'success', 'error']
  },

  {
    type: 'makeWebhook',
    name: 'Make: Trigger Webhook',
    icon: Zap,
    description: 'Trigger Make.com (Integromat) scenarios via webhooks',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      webhookUrl: '{{input.webhookUrl}}',
      data: '{{input.data}}',
      method: 'POST'
    },
    configSchema: {
      webhookUrl: { label: 'Make Webhook URL', type: 'string', required: true },
      data: { label: 'Data to Send (JSON)', type: 'json', required: true },
      method: { label: 'HTTP Method', type: 'select', options: ['POST', 'PUT'], defaultValue: 'POST' }
    },
    inputHandles: ['input'],
    outputHandles: ['response', 'status', 'success', 'error']
  },

  {
    type: 'quickbooksCreateInvoice',
    name: 'QuickBooks: Create Invoice',
    icon: FileText,
    description: 'Create invoices in QuickBooks Online',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      companyId: '{{input.companyId}}',
      customerId: '{{input.customerId}}',
      lineItems: '[]',
      dueDate: '{{input.dueDate}}',
      accessToken: '{{credential.QuickBooksAccessToken}}'
    },
    configSchema: {
      companyId: { label: 'Company ID', type: 'string', required: true },
      customerId: { label: 'Customer ID', type: 'string', required: true },
      lineItems: { label: 'Line Items (JSON)', type: 'json', placeholder: '[{"ItemRef": {"value": "1"}, "Qty": 1, "UnitPrice": 100}]', required: true },
      dueDate: { label: 'Due Date (YYYY-MM-DD)', type: 'string' },
      accessToken: { label: 'Access Token', type: 'string', placeholder: '{{credential.QuickBooksAccessToken}}', required: true }
    },
    inputHandles: ['input'],
    outputHandles: ['invoiceId', 'invoiceNumber', 'totalAmount', 'success', 'error']
  }
];

// Integration categories for organization
export const INTEGRATION_CATEGORIES = {
  'Google Workspace': [0, 1, 2, 3], // indices in TOP_50_INTEGRATIONS
  'Microsoft 365': [4, 5, 6],
  'Productivity': [7, 8, 9, 10, 11],
  'Communication': [12, 13, 14, 15],
  'E-commerce & Payments': [16, 17, 18, 19, 20, 21],
  'Social Media': [22, 23, 24, 25, 26],
  'Analytics': [27, 28, 29, 30],
  'Development': [31, 32, 33, 34, 35],
  'Cloud Storage': [36, 37, 38, 39],
  'AI & Automation': [40, 41, 42, 43, 44]
};

// Export count for marketing
export const INTEGRATION_COUNT = TOP_50_INTEGRATIONS.length;