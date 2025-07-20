/**
 * No-Code Connector Builder
 * Visual interface for creating custom integrations
 */

export interface ConnectorTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  baseUrl: string;
  authType: 'apiKey' | 'oauth2' | 'basicAuth' | 'bearerToken';
  headers?: Record<string, string>;
  actions: ConnectorAction[];
  triggers: ConnectorTrigger[];
  testEndpoint?: string;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  parameters: ConnectorParameter[];
  responseMapping: ResponseMapping[];
  exampleRequest?: any;
  exampleResponse?: any;
}

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  type: 'webhook' | 'polling';
  endpoint?: string;
  pollInterval?: number;
  parameters: ConnectorParameter[];
  responseMapping: ResponseMapping[];
}

export interface ConnectorParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface ResponseMapping {
  id: string;
  sourcePath: string;
  targetName: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  transform?: string; // JavaScript transform function
}

/**
 * Pre-built connector templates for common APIs
 */
export const CONNECTOR_TEMPLATES: ConnectorTemplate[] = [
  {
    id: 'rest-api-basic',
    name: 'REST API',
    description: 'Generic REST API connector with API key authentication',
    category: 'Generic',
    icon: '🔌',
    color: '#6366f1',
    baseUrl: 'https://api.example.com',
    authType: 'apiKey',
    headers: {
      'Content-Type': 'application/json'
    },
    actions: [
      {
        id: 'get-data',
        name: 'Get Data',
        description: 'Retrieve data from the API',
        method: 'GET',
        endpoint: '/data',
        parameters: [
          {
            id: 'id',
            name: 'ID',
            type: 'string',
            description: 'Resource identifier',
            required: false
          }
        ],
        responseMapping: [
          {
            id: 'id',
            sourcePath: 'id',
            targetName: 'resourceId',
            type: 'string'
          },
          {
            id: 'data',
            sourcePath: 'data',
            targetName: 'result',
            type: 'object'
          }
        ]
      },
      {
        id: 'create-data',
        name: 'Create Data',
        description: 'Create new data via the API',
        method: 'POST',
        endpoint: '/data',
        parameters: [
          {
            id: 'payload',
            name: 'Data',
            type: 'object',
            description: 'Data to create',
            required: true
          }
        ],
        responseMapping: [
          {
            id: 'id',
            sourcePath: 'id',
            targetName: 'createdId',
            type: 'string'
          },
          {
            id: 'success',
            sourcePath: 'success',
            targetName: 'success',
            type: 'boolean'
          }
        ]
      }
    ],
    triggers: [
      {
        id: 'webhook-trigger',
        name: 'Webhook Trigger',
        description: 'Receive webhooks from the API',
        type: 'webhook',
        parameters: [
          {
            id: 'events',
            name: 'Event Types',
            type: 'array',
            description: 'Types of events to listen for',
            required: true,
            options: [
              { label: 'Created', value: 'created' },
              { label: 'Updated', value: 'updated' },
              { label: 'Deleted', value: 'deleted' }
            ]
          }
        ],
        responseMapping: [
          {
            id: 'event_type',
            sourcePath: 'event_type',
            targetName: 'eventType',
            type: 'string'
          },
          {
            id: 'data',
            sourcePath: 'data',
            targetName: 'payload',
            type: 'object'
          }
        ]
      }
    ],
    testEndpoint: '/health'
  },
  {
    id: 'graphql-api',
    name: 'GraphQL API',
    description: 'GraphQL API connector with flexible queries',
    category: 'Generic',
    icon: '📊',
    color: '#e10098',
    baseUrl: 'https://api.example.com/graphql',
    authType: 'bearerToken',
    actions: [
      {
        id: 'execute-query',
        name: 'Execute Query',
        description: 'Execute a GraphQL query',
        method: 'POST',
        endpoint: '',
        parameters: [
          {
            id: 'query',
            name: 'Query',
            type: 'string',
            description: 'GraphQL query string',
            required: true
          },
          {
            id: 'variables',
            name: 'Variables',
            type: 'object',
            description: 'Query variables',
            required: false
          }
        ],
        responseMapping: [
          {
            id: 'data',
            sourcePath: 'data',
            targetName: 'result',
            type: 'object'
          },
          {
            id: 'errors',
            sourcePath: 'errors',
            targetName: 'errors',
            type: 'array'
          }
        ]
      }
    ],
    triggers: []
  }
];

/**
 * Connector Builder Service
 */
export class ConnectorBuilder {
  /**
   * Create a new connector from template
   */
  static createFromTemplate(templateId: string, customConfig: Partial<ConnectorTemplate>): ConnectorTemplate {
    const template = CONNECTOR_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    return {
      ...template,
      ...customConfig,
      id: `custom_${Date.now()}`,
      actions: customConfig.actions || template.actions,
      triggers: customConfig.triggers || template.triggers
    };
  }

  /**
   * Test connector endpoint
   */
  static async testConnector(
    connector: ConnectorTemplate,
    credentials: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const testUrl = connector.testEndpoint ? 
        `${connector.baseUrl}${connector.testEndpoint}` : 
        connector.baseUrl;

      const headers: Record<string, string> = { ...connector.headers };

      // Add authentication
      switch (connector.authType) {
        case 'apiKey':
          headers['X-API-Key'] = credentials.apiKey;
          break;
        case 'bearerToken':
          headers['Authorization'] = `Bearer ${credentials.token}`;
          break;
        case 'basicAuth':
          const auth = btoa(`${credentials.username}:${credentials.password}`);
          headers['Authorization'] = `Basic ${auth}`;
          break;
      }

      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Execute connector action
   */
  static async executeAction(
    connector: ConnectorTemplate,
    actionId: string,
    parameters: Record<string, any>,
    credentials: Record<string, string>
  ): Promise<any> {
    const action = connector.actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    const url = `${connector.baseUrl}${action.endpoint}`;
    const headers: Record<string, string> = { ...connector.headers };

    // Add authentication
    switch (connector.authType) {
      case 'apiKey':
        headers['X-API-Key'] = credentials.apiKey;
        break;
      case 'bearerToken':
        headers['Authorization'] = `Bearer ${credentials.token}`;
        break;
      case 'oauth2':
        headers['Authorization'] = `Bearer ${credentials.accessToken}`;
        break;
      case 'basicAuth':
        const auth = btoa(`${credentials.username}:${credentials.password}`);
        headers['Authorization'] = `Basic ${auth}`;
        break;
    }

    // Prepare request body for POST/PUT/PATCH
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(action.method)) {
      body = JSON.stringify(parameters);
    }

    const response = await fetch(url, {
      method: action.method,
      headers,
      body
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Apply response mapping
    const mappedResponse: Record<string, any> = {};
    action.responseMapping.forEach(mapping => {
      const value = this.getNestedValue(responseData, mapping.sourcePath);
      if (mapping.transform) {
        // Apply JavaScript transformation
        try {
          const transformFn = new Function('value', `return ${mapping.transform}`);
          mappedResponse[mapping.targetName] = transformFn(value);
        } catch (error) {
          console.warn(`Transform error for ${mapping.targetName}:`, error);
          mappedResponse[mapping.targetName] = value;
        }
      } else {
        mappedResponse[mapping.targetName] = value;
      }
    });

    return mappedResponse;
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Generate integration node configuration from connector
   */
  static generateNodeConfig(connector: ConnectorTemplate): any[] {
    const nodes: any[] = [];

    // Generate action nodes
    connector.actions.forEach(action => {
      const configSchema: Record<string, any> = {};
      
      // Add authentication fields
      switch (connector.authType) {
        case 'apiKey':
          configSchema.apiKey = {
            label: 'API Key',
            type: 'string',
            placeholder: '{{credential.ApiKey}}',
            required: true
          };
          break;
        case 'bearerToken':
          configSchema.token = {
            label: 'Bearer Token',
            type: 'string',
            placeholder: '{{credential.BearerToken}}',
            required: true
          };
          break;
        case 'basicAuth':
          configSchema.username = {
            label: 'Username',
            type: 'string',
            placeholder: '{{credential.Username}}',
            required: true
          };
          configSchema.password = {
            label: 'Password',
            type: 'string',
            placeholder: '{{credential.Password}}',
            required: true
          };
          break;
        case 'oauth2':
          configSchema.accessToken = {
            label: 'Access Token',
            type: 'string',
            placeholder: '{{credential.AccessToken}}',
            required: true
          };
          break;
      }

      // Add action parameters
      action.parameters.forEach(param => {
        configSchema[param.id] = {
          label: param.name,
          type: param.type,
          placeholder: param.defaultValue ? param.defaultValue.toString() : '',
          helperText: param.description,
          required: param.required,
          ...(param.options && { options: param.options.map(opt => opt.value) })
        };
      });

      nodes.push({
        type: `${connector.id}_${action.id}`,
        name: `${connector.name}: ${action.name}`,
        icon: connector.icon,
        description: action.description,
        category: 'integrations',
        isAdvanced: true,
        configSchema,
        inputHandles: ['input'],
        outputHandles: action.responseMapping.map(m => m.targetName).concat(['error'])
      });
    });

    // Generate trigger nodes
    connector.triggers.forEach(trigger => {
      const configSchema: Record<string, any> = {};
      
      trigger.parameters.forEach(param => {
        configSchema[param.id] = {
          label: param.name,
          type: param.type,
          placeholder: param.defaultValue ? param.defaultValue.toString() : '',
          helperText: param.description,
          required: param.required,
          ...(param.options && { options: param.options.map(opt => opt.value) })
        };
      });

      if (trigger.type === 'polling' && trigger.pollInterval) {
        configSchema.pollInterval = {
          label: 'Poll Interval (seconds)',
          type: 'number',
          defaultValue: trigger.pollInterval,
          required: true
        };
      }

      nodes.push({
        type: `${connector.id}_${trigger.id}`,
        name: `${connector.name}: ${trigger.name}`,
        icon: connector.icon,
        description: trigger.description,
        category: 'trigger',
        isAdvanced: true,
        configSchema,
        inputHandles: [],
        outputHandles: trigger.responseMapping.map(m => m.targetName).concat(['error'])
      });
    });

    return nodes;
  }

  /**
   * Validate connector configuration
   */
  static validateConnector(connector: ConnectorTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!connector.name) errors.push('Connector name is required');
    if (!connector.baseUrl) errors.push('Base URL is required');
    if (!connector.authType) errors.push('Authentication type is required');
    
    if (connector.actions.length === 0 && connector.triggers.length === 0) {
      errors.push('At least one action or trigger is required');
    }

    // Validate actions
    connector.actions.forEach((action, index) => {
      if (!action.name) errors.push(`Action ${index + 1}: name is required`);
      if (!action.method) errors.push(`Action ${index + 1}: HTTP method is required`);
      if (!action.endpoint) errors.push(`Action ${index + 1}: endpoint is required`);
    });

    // Validate triggers
    connector.triggers.forEach((trigger, index) => {
      if (!trigger.name) errors.push(`Trigger ${index + 1}: name is required`);
      if (!trigger.type) errors.push(`Trigger ${index + 1}: type is required`);
      if (trigger.type === 'polling' && !trigger.pollInterval) {
        errors.push(`Trigger ${index + 1}: poll interval is required for polling triggers`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}