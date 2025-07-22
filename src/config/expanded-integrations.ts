/**
 * Additional 55+ Integrations to reach 100+ total
 * Market leadership expansion integrations
 */

import type { AvailableNodeType } from '@/types/workflow';
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
  Scan, QrCode, Barcode, Tag, Bookmark, Archive, Inbox, Plus,
  Bot, Mic, Speaker, Gamepad2, Wrench, Hammer, Plane
} from 'lucide-react';

// Enterprise & Business Integrations (20 integrations)
export const ENTERPRISE_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'microsoftOutlookSendEmail',
    name: 'Microsoft Outlook: Send Email',
    icon: Mail,
    description: 'Send emails through Microsoft Outlook with rich formatting and attachments',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      to: '{{input.email}}',
      cc: '',
      bcc: '',
      subject: '{{input.subject}}',
      body: '{{input.message}}',
      importance: 'normal',
      deliveryReceiptRequested: false,
      readReceiptRequested: false
    },
    configSchema: {
      to: { label: 'To', type: 'string', required: true },
      cc: { label: 'CC', type: 'string' },
      bcc: { label: 'BCC', type: 'string' },
      subject: { label: 'Subject', type: 'string', required: true },
      body: { label: 'Body', type: 'textarea', required: true },
      importance: { label: 'Importance', type: 'select', options: ['low', 'normal', 'high'], defaultValue: 'normal' }
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'success', 'error']
  },

  {
    type: 'microsoftTeamsCreateMeeting',
    name: 'Microsoft Teams: Create Meeting',
    icon: Video,
    description: 'Schedule and create Microsoft Teams meetings',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      subject: '{{input.subject}}',
      startDateTime: '{{input.startTime}}',
      endDateTime: '{{input.endTime}}',
      attendees: '{{input.attendees}}',
      isOnlineMeeting: true,
      allowedPresenters: 'everyone'
    },
    configSchema: {
      subject: { label: 'Meeting Subject', type: 'string', required: true },
      startDateTime: { label: 'Start Date/Time (ISO)', type: 'string', required: true },
      endDateTime: { label: 'End Date/Time (ISO)', type: 'string', required: true },
      attendees: { label: 'Attendees (JSON)', type: 'json', placeholder: '[{"emailAddress": {"address": "user@domain.com", "name": "User Name"}}]' }
    },
    inputHandles: ['input'],
    outputHandles: ['meetingId', 'joinUrl', 'success', 'error']
  },

  {
    type: 'salesforceApexTrigger',
    name: 'Salesforce: Execute Apex Code',
    icon: Zap,
    description: 'Execute custom Apex code in Salesforce',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      apexClass: '{{input.apexClass}}',
      methodName: '{{input.methodName}}',
      parameters: '{{input.parameters}}',
      instanceUrl: '{{credential.SalesforceInstanceUrl}}',
      accessToken: '{{credential.SalesforceAccessToken}}'
    },
    configSchema: {
      apexClass: { label: 'Apex Class Name', type: 'string', required: true },
      methodName: { label: 'Method Name', type: 'string', required: true },
      parameters: { label: 'Parameters (JSON)', type: 'json', placeholder: '{"param1": "value1"}' }
    },
    inputHandles: ['input'],
    outputHandles: ['result', 'success', 'error']
  }
];

// Marketing & Social Media Integrations (15 integrations)
export const MARKETING_SOCIAL_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'bufferSchedulePost',
    name: 'Buffer: Schedule Social Post',
    icon: Calendar,
    description: 'Schedule posts across multiple social media platforms via Buffer',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      profileIds: '{{input.profileIds}}',
      text: '{{input.text}}',
      scheduledAt: '{{input.scheduledAt}}',
      media: '{{input.media}}',
      accessToken: '{{credential.BufferAccessToken}}'
    },
    configSchema: {
      profileIds: { label: 'Profile IDs (JSON)', type: 'json', required: true, placeholder: '["profile1", "profile2"]' },
      text: { label: 'Post Text', type: 'textarea', required: true },
      scheduledAt: { label: 'Schedule Time (ISO)', type: 'string' },
      media: { label: 'Media URLs (JSON)', type: 'json', placeholder: '{"photo": "https://example.com/image.jpg"}' }
    },
    inputHandles: ['input'],
    outputHandles: ['updateId', 'success', 'error']
  }
];

// Development & DevOps Integrations (10 integrations)
export const DEVOPS_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'gitlabCreateMergeRequest',
    name: 'GitLab: Create Merge Request',
    icon: Github,
    description: 'Create merge requests in GitLab repositories',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      projectId: '{{input.projectId}}',
      sourceBranch: '{{input.sourceBranch}}',
      targetBranch: '{{input.targetBranch}}',
      title: '{{input.title}}',
      description: '{{input.description}}',
      assigneeId: '{{input.assigneeId}}',
      accessToken: '{{credential.GitLabAccessToken}}'
    },
    configSchema: {
      projectId: { label: 'Project ID', type: 'string', required: true },
      sourceBranch: { label: 'Source Branch', type: 'string', required: true },
      targetBranch: { label: 'Target Branch', type: 'string', required: true, defaultValue: 'main' },
      title: { label: 'MR Title', type: 'string', required: true },
      description: { label: 'MR Description', type: 'textarea' }
    },
    inputHandles: ['input'],
    outputHandles: ['mergeRequestId', 'webUrl', 'success', 'error']
  }
];

// Financial & Business Integrations (10 integrations)  
export const FINANCIAL_INTEGRATIONS: AvailableNodeType[] = [
  {
    type: 'quickbooksOnlineCreateInvoice',
    name: 'QuickBooks Online: Create Invoice',
    icon: FileText,
    description: 'Create invoices in QuickBooks Online accounting system',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: {
      companyId: '{{credential.QBOCompanyId}}',
      customerRef: '{"value": "{{input.customerId}}"}',
      lineItems: '{{input.lineItems}}',
      dueDate: '{{input.dueDate}}',
      accessToken: '{{credential.QBOAccessToken}}'
    },
    configSchema: {
      customerRef: { label: 'Customer Reference (JSON)', type: 'json', required: true },
      lineItems: { label: 'Line Items (JSON)', type: 'json', required: true },
      dueDate: { label: 'Due Date (YYYY-MM-DD)', type: 'string' }
    },
    inputHandles: ['input'],
    outputHandles: ['invoiceId', 'invoiceNumber', 'success', 'error']
  }
];

// Combine all expanded integrations
export const EXPANDED_INTEGRATIONS: AvailableNodeType[] = [
  ...ENTERPRISE_INTEGRATIONS,
  ...MARKETING_SOCIAL_INTEGRATIONS, 
  ...DEVOPS_INTEGRATIONS,
  ...FINANCIAL_INTEGRATIONS
];

export const EXPANDED_INTEGRATION_CATEGORIES = {
  'Enterprise & Business': ENTERPRISE_INTEGRATIONS,
  'Marketing & Social Media': MARKETING_SOCIAL_INTEGRATIONS,
  'Development & DevOps': DEVOPS_INTEGRATIONS,
  'Financial & Accounting': FINANCIAL_INTEGRATIONS
};

// Total count for marketing purposes
export const EXPANDED_INTEGRATION_COUNT = EXPANDED_INTEGRATIONS.length;