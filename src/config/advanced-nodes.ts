import type { AvailableNodeType, RetryConfig, OnErrorWebhookConfig } from '@/types/workflow';
import { 
  GitBranch, 
  Filter, 
  Repeat, 
  RotateCcw, 
  Layers, 
  GitFork, 
  Timer, 
  AlertCircle, 
  Zap, 
  ArrowRightLeft, 
  SplitSquareHorizontal, 
  Combine, 
  RefreshCw,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Workflow,
  Code,
  Binary,
  FileJson,
  Calculator,
  Hash,
  Shuffle,
  ArrowUpDown,
  ArrowLeftRight,
  Merge,
  Split,
  Group,
  Ungroup,
  Shuffle,
  Wand2
} from 'lucide-react';

const GENERIC_RETRY_CONFIG_SCHEMA = {
  retry: { 
    label: 'Retry Config (JSON, Optional)', 
    type: 'json', 
    placeholder: '{\n  "attempts": 3,\n  "delayMs": 1000,\n  "backoffFactor": 2,\n  "retryOnStatusCodes": [500, 503, 429],\n  "retryOnErrorKeywords": ["timeout", "unavailable"]\n}',
    helperText: 'Define retry strategy: attempts, delayMs, backoffFactor (e.g., 2 for exponential), retryOnStatusCodes (for HTTP nodes), retryOnErrorKeywords (case-insensitive keywords to match in error messages for any node type). All fields optional.',
    defaultValue: {} as RetryConfig
  }
};

const GENERIC_ON_ERROR_WEBHOOK_SCHEMA = {
  onErrorWebhook: {
    label: 'On-Error Webhook (JSON, Optional)',
    type: 'json',
    placeholder: '{\n  "url": "https://my-error-logger.com/log",\n  "method": "POST",\n  "headers": {"X-API-Key": "{{env.ERROR_API_KEY}}"},\n  "bodyTemplate": {\n    "nodeId": "{{failed_node_id}}",\n    "nodeName": "{{failed_node_name}}",\n    "errorMessage": "{{error_message}}",\n    "timestamp": "{{timestamp}}",\n    "workflowSnapshot": "{{workflow_data_snapshot_json}}"\n  }\n}',
    helperText: 'If node fails after all retries, send details to this webhook. Placeholders for body/headers: {{failed_node_id}}, {{failed_node_name}}, {{error_message}}, {{timestamp}}, {{workflow_data_snapshot_json}} (full workflow data as JSON string), and {{env.VAR_NAME}}. This is a fire-and-forget notification.',
    defaultValue: undefined as (OnErrorWebhookConfig | undefined)
  }
};

export const ADVANCED_NODES_CONFIG: AvailableNodeType[] = [
  // Enhanced Conditional Branching
  {
    type: 'conditionalBranch',
    name: 'Conditional Branch',
    icon: GitBranch,
    description: 'Advanced conditional logic with multiple branches and complex expressions',
    category: 'logic',
    isAdvanced: true,
    defaultConfig: {
      conditions: [
        { id: 'condition1', expression: '{{input.value}} > 10', label: 'High Value' },
        { id: 'condition2', expression: '{{input.value}} > 5', label: 'Medium Value' }
      ],
      defaultBranch: 'else',
      evaluationMode: 'sequential', // sequential, parallel, all
      strictMode: false
    },
    configSchema: {
      conditions: {
        label: 'Conditions',
        type: 'json',
        placeholder: '[{"id":"cond1","expression":"{{input.value}} > 10","label":"High Value"}]',
        required: true,
        helperText: 'Array of condition objects with id, expression, and label'
      },
      defaultBranch: {
        label: 'Default Branch',
        type: 'string',
        placeholder: 'else',
        helperText: 'Branch to take if no conditions match'
      },
      evaluationMode: {
        label: 'Evaluation Mode',
        type: 'select',
        options: ['sequential', 'parallel', 'all'],
        defaultValue: 'sequential',
        helperText: 'How to evaluate conditions: sequential (stop at first match), parallel (evaluate all), all (all must be true)'
      },
      strictMode: {
        label: 'Strict Mode',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Throw error if condition expression is invalid'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input'],
    outputHandles: ['condition1', 'condition2', 'else', 'error']
  },

  // Enhanced Data Transformation
  {
    type: 'dataTransform',
    name: 'Data Transform',
    icon: Transform,
    description: 'Advanced data transformation with mapping, filtering, aggregation, and custom functions',
    category: 'logic',
    isAdvanced: true,
    defaultConfig: {
      transformType: 'map',
      mappingRules: [
        { source: '{{input.name}}', target: 'fullName', transform: 'toUpperCase' },
        { source: '{{input.email}}', target: 'contactEmail', transform: 'toLowerCase' }
      ],
      filterCondition: '',
      aggregationField: '',
      customFunctions: '',
      outputFormat: 'object' // object, array, primitive
    },
    configSchema: {
      transformType: {
        label: 'Transform Type',
        type: 'select',
        options: ['map', 'filter', 'reduce', 'group', 'aggregate', 'pivot', 'flatten'],
        defaultValue: 'map',
        helperText: 'Type of transformation to apply'
      },
      mappingRules: {
        label: 'Mapping Rules',
        type: 'json',
        placeholder: '[{"source":"{{input.name}}","target":"fullName","transform":"toUpperCase"}]',
        required: true,
        helperText: 'Array of mapping rules with source, target, and optional transform function'
      },
      filterCondition: {
        label: 'Filter Condition',
        type: 'string',
        placeholder: '{{item.age}} > 18',
        helperText: 'Condition for filtering items (only for filter transform)',
        relevantForTypes: ['filter']
      },
      aggregationField: {
        label: 'Aggregation Field',
        type: 'string',
        placeholder: 'amount',
        helperText: 'Field to aggregate (only for aggregate transform)',
        relevantForTypes: ['aggregate']
      },
      customFunctions: {
        label: 'Custom Functions',
        type: 'textarea',
        placeholder: 'function toUpperCase(value) { return value.toUpperCase(); }',
        helperText: 'Custom JavaScript functions for transformation'
      },
      outputFormat: {
        label: 'Output Format',
        type: 'select',
        options: ['object', 'array', 'primitive'],
        defaultValue: 'object',
        helperText: 'Format of the output data'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input'],
    outputHandles: ['transformed', 'error']
  },

  // Enhanced For Each Loop
  {
    type: 'forEachLoop',
    name: 'For Each Loop',
    icon: Repeat,
    description: 'Advanced iteration with parallel execution, batching, and error handling',
    category: 'iteration',
    isAdvanced: true,
    defaultConfig: {
      inputArrayPath: '{{input.items}}',
      iterationNodes: [],
      iterationConnections: [],
      iterationResultSource: '{{last_node.output}}',
      continueOnError: false,
      parallelExecution: false,
      batchSize: 1,
      maxConcurrency: 5,
      delayBetweenIterations: 0,
      iterationTimeout: 30000,
      skipEmptyItems: true,
      collectResults: true
    },
    configSchema: {
      inputArrayPath: {
        label: 'Input Array Path',
        type: 'string',
        placeholder: '{{api_node.response.users}}',
        helperText: 'Path to the array to iterate over',
        required: true
      },
      iterationNodes: {
        label: 'Iteration Nodes',
        type: 'json',
        placeholder: '[{"id":"loop_log","type":"logMessage","name":"Log Item","position":{"x":10,"y":10},"config":{"message":"Processing item: {{item.name}}"}}]',
        helperText: 'Nodes to execute for each item. Use {{item.property}} to access current item data.',
        required: true
      },
      iterationConnections: {
        label: 'Iteration Connections',
        type: 'json',
        placeholder: '[]',
        helperText: 'Connections between nodes within the iteration sub-flow.'
      },
      iterationResultSource: {
        label: 'Result Source',
        type: 'string',
        placeholder: '{{last_node_in_subflow.output}}',
        helperText: 'Path to extract result from each iteration'
      },
      continueOnError: {
        label: 'Continue on Error',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Continue processing if an iteration fails'
      },
      parallelExecution: {
        label: 'Parallel Execution',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Execute iterations in parallel'
      },
      batchSize: {
        label: 'Batch Size',
        type: 'number',
        defaultValue: 1,
        helperText: 'Number of items to process in each batch'
      },
      maxConcurrency: {
        label: 'Max Concurrency',
        type: 'number',
        defaultValue: 5,
        helperText: 'Maximum number of concurrent iterations (parallel mode only)'
      },
      delayBetweenIterations: {
        label: 'Delay Between Iterations (ms)',
        type: 'number',
        defaultValue: 0,
        helperText: 'Delay between iterations to prevent rate limiting'
      },
      iterationTimeout: {
        label: 'Iteration Timeout (ms)',
        type: 'number',
        defaultValue: 30000,
        helperText: 'Maximum time allowed for each iteration'
      },
      skipEmptyItems: {
        label: 'Skip Empty Items',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Skip null or undefined items in the array'
      },
      collectResults: {
        label: 'Collect Results',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Collect and return results from all iterations'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input_array_data'],
    outputHandles: ['results', 'errors', 'summary', 'error']
  },

  // Enhanced While Loop
  {
    type: 'whileLoop',
    name: 'While Loop',
    icon: RotateCcw,
    description: 'Advanced while loop with complex conditions, timeout, and state management',
    category: 'iteration',
    isAdvanced: true,
    defaultConfig: {
      condition: '{{data.status}} === "pending"',
      loopNodes: [],
      loopConnections: [],
      maxIterations: 100,
      loopTimeout: 300000, // 5 minutes
      delayBetweenIterations: 1000,
      stateVariables: {},
      breakCondition: '',
      continueCondition: '',
      iterationCounter: 'iteration_count',
      preserveState: true
    },
    configSchema: {
      condition: {
        label: 'Loop Condition',
        type: 'string',
        placeholder: '{{data.status}} === "pending" || {{counter.value}} < 10',
        helperText: 'Condition to evaluate for continuing the loop',
        required: true
      },
      loopNodes: {
        label: 'Loop Nodes',
        type: 'json',
        placeholder: '[{"id":"loop_action","type":"httpRequest","name":"Check Status","position":{"x":10,"y":10},"config":{"url":"{{api_endpoint}}"}}]',
        helperText: 'Nodes to execute in each iteration',
        required: true
      },
      loopConnections: {
        label: 'Loop Connections',
        type: 'json',
        placeholder: '[]',
        helperText: 'Connections between nodes within the loop sub-flow'
      },
      maxIterations: {
        label: 'Max Iterations',
        type: 'number',
        defaultValue: 100,
        helperText: 'Safety limit to prevent infinite loops'
      },
      loopTimeout: {
        label: 'Loop Timeout (ms)',
        type: 'number',
        defaultValue: 300000,
        helperText: 'Maximum time allowed for the entire loop'
      },
      delayBetweenIterations: {
        label: 'Delay Between Iterations (ms)',
        type: 'number',
        defaultValue: 1000,
        helperText: 'Delay between iterations'
      },
      stateVariables: {
        label: 'State Variables',
        type: 'json',
        placeholder: '{"counter": 0, "accumulated": []}',
        helperText: 'Variables to maintain state between iterations'
      },
      breakCondition: {
        label: 'Break Condition',
        type: 'string',
        placeholder: '{{response.error}} === true',
        helperText: 'Condition to break out of the loop early'
      },
      continueCondition: {
        label: 'Continue Condition',
        type: 'string',
        placeholder: '{{response.skip}} === true',
        helperText: 'Condition to skip current iteration and continue'
      },
      iterationCounter: {
        label: 'Iteration Counter Variable',
        type: 'string',
        defaultValue: 'iteration_count',
        helperText: 'Variable name to store current iteration count'
      },
      preserveState: {
        label: 'Preserve State',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Preserve state variables between iterations'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input_data'],
    outputHandles: ['final_state', 'iterations_completed', 'break_reason', 'error']
  },

  // Error Recovery Node
  {
    type: 'errorRecovery',
    name: 'Error Recovery',
    icon: AlertCircle,
    description: 'Advanced error handling with multiple recovery strategies and circuit breaker pattern',
    category: 'control',
    isAdvanced: true,
    defaultConfig: {
      recoveryStrategy: 'retry',
      retryConfig: {
        maxAttempts: 3,
        backoffMs: 1000,
        backoffFactor: 2,
        retryOnStatusCodes: [500, 503, 429],
        retryOnErrorKeywords: ['timeout', 'unavailable']
      },
      fallbackConfig: {
        fallbackNodeId: '',
        fallbackData: {}
      },
      circuitBreakerConfig: {
        failureThreshold: 5,
        recoveryTimeout: 30000,
        halfOpenMaxCalls: 3
      },
      dlqConfig: {
        dlqEndpoint: '',
        dlqHeaders: {},
        dlqRetries: 3
      }
    },
    configSchema: {
      recoveryStrategy: {
        label: 'Recovery Strategy',
        type: 'select',
        options: ['retry', 'fallback', 'circuit-breaker', 'dead-letter-queue', 'hybrid'],
        defaultValue: 'retry',
        helperText: 'Primary error recovery strategy'
      },
      retryConfig: {
        label: 'Retry Configuration',
        type: 'json',
        placeholder: '{"maxAttempts": 3, "backoffMs": 1000, "backoffFactor": 2}',
        helperText: 'Configuration for retry strategy'
      },
      fallbackConfig: {
        label: 'Fallback Configuration',
        type: 'json',
        placeholder: '{"fallbackNodeId": "backup_node", "fallbackData": {}}',
        helperText: 'Configuration for fallback strategy'
      },
      circuitBreakerConfig: {
        label: 'Circuit Breaker Configuration',
        type: 'json',
        placeholder: '{"failureThreshold": 5, "recoveryTimeout": 30000}',
        helperText: 'Configuration for circuit breaker pattern'
      },
      dlqConfig: {
        label: 'Dead Letter Queue Configuration',
        type: 'json',
        placeholder: '{"dlqEndpoint": "https://api.example.com/dlq", "dlqHeaders": {}}',
        helperText: 'Configuration for dead letter queue'
      },
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input', 'error_input'],
    outputHandles: ['success', 'fallback', 'circuit_open', 'dlq_sent', 'error']
  },

  // Parallel Execution Enhanced
  {
    type: 'parallelExecution',
    name: 'Parallel Execution',
    icon: GitFork,
    description: 'Advanced parallel processing with dynamic branching, load balancing, and result aggregation',
    category: 'control',
    isAdvanced: true,
    defaultConfig: {
      branches: [],
      concurrencyLimit: 0,
      loadBalancingStrategy: 'round-robin',
      resultAggregation: 'collect',
      failureHandling: 'continue',
      timeoutMs: 60000,
      priorityScheduling: false,
      resourceLimits: {},
      dynamicBranching: false,
      branchingCondition: ''
    },
    configSchema: {
      branches: {
        label: 'Branches',
        type: 'json',
        placeholder: '[{"id":"branch_1","name":"Image Processing","nodes":[{"id":"img_op_1","type":"aiTask"}],"connections":[],"inputMapping":{"img_data":"{{parent.image_url}}"},"outputSource":"{{img_op_1.processed_image_url}}","priority":1}]',
        helperText: 'Array of branch configurations with nodes, connections, and priority',
        required: true
      },
      concurrencyLimit: {
        label: 'Concurrency Limit',
        type: 'number',
        defaultValue: 0,
        helperText: 'Maximum number of branches to run simultaneously (0 = unlimited)'
      },
      loadBalancingStrategy: {
        label: 'Load Balancing Strategy',
        type: 'select',
        options: ['round-robin', 'least-loaded', 'priority', 'random'],
        defaultValue: 'round-robin',
        helperText: 'Strategy for distributing work across branches'
      },
      resultAggregation: {
        label: 'Result Aggregation',
        type: 'select',
        options: ['collect', 'merge', 'first', 'fastest', 'majority'],
        defaultValue: 'collect',
        helperText: 'How to aggregate results from all branches'
      },
      failureHandling: {
        label: 'Failure Handling',
        type: 'select',
        options: ['continue', 'fail-fast', 'retry', 'ignore'],
        defaultValue: 'continue',
        helperText: 'How to handle failures in individual branches'
      },
      timeoutMs: {
        label: 'Timeout (ms)',
        type: 'number',
        defaultValue: 60000,
        helperText: 'Maximum time to wait for all branches to complete'
      },
      priorityScheduling: {
        label: 'Priority Scheduling',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Execute branches based on priority order'
      },
      resourceLimits: {
        label: 'Resource Limits',
        type: 'json',
        placeholder: '{"memory": "1GB", "cpu": "50%"}',
        helperText: 'Resource limits for each branch'
      },
      dynamicBranching: {
        label: 'Dynamic Branching',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Create branches dynamically based on input data'
      },
      branchingCondition: {
        label: 'Branching Condition',
        type: 'string',
        placeholder: '{{input.items.length}} > 0',
        helperText: 'Condition for dynamic branch creation'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input'],
    outputHandles: ['results', 'errors', 'summary', 'error']
  },

  // State Management Node
  {
    type: 'stateManager',
    name: 'State Manager',
    icon: Database,
    description: 'Manage workflow state with persistence, caching, and state transitions',
    category: 'io',
    isAdvanced: true,
    defaultConfig: {
      stateKey: 'workflow_state',
      initialState: {},
      stateOperations: [],
      persistenceType: 'memory',
      cacheSettings: {
        ttl: 3600000, // 1 hour
        maxSize: 1000
      },
      stateValidation: {},
      stateTransitions: [],
      conflictResolution: 'latest-wins'
    },
    configSchema: {
      stateKey: {
        label: 'State Key',
        type: 'string',
        placeholder: 'workflow_state',
        helperText: 'Unique identifier for this state',
        required: true
      },
      initialState: {
        label: 'Initial State',
        type: 'json',
        placeholder: '{"counter": 0, "items": []}',
        helperText: 'Initial state value'
      },
      stateOperations: {
        label: 'State Operations',
        type: 'json',
        placeholder: '[{"operation": "set", "path": "counter", "value": "{{input.count}}"}, {"operation": "increment", "path": "counter"}]',
        helperText: 'Array of operations to perform on state'
      },
      persistenceType: {
        label: 'Persistence Type',
        type: 'select',
        options: ['memory', 'database', 'redis', 'file'],
        defaultValue: 'memory',
        helperText: 'Where to persist state data'
      },
      cacheSettings: {
        label: 'Cache Settings',
        type: 'json',
        placeholder: '{"ttl": 3600000, "maxSize": 1000}',
        helperText: 'Cache configuration for state storage'
      },
      stateValidation: {
        label: 'State Validation',
        type: 'json',
        placeholder: '{"required": ["counter"], "types": {"counter": "number"}}',
        helperText: 'Validation rules for state data'
      },
      stateTransitions: {
        label: 'State Transitions',
        type: 'json',
        placeholder: '[{"from": "pending", "to": "active", "condition": "{{input.approved}} === true"}]',
        helperText: 'Allowed state transitions with conditions'
      },
      conflictResolution: {
        label: 'Conflict Resolution',
        type: 'select',
        options: ['latest-wins', 'merge', 'error', 'ignore'],
        defaultValue: 'latest-wins',
        helperText: 'How to resolve state conflicts'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['input'],
    outputHandles: ['state', 'previous_state', 'error']
  },

  // Queue Manager
  {
    type: 'queueManager',
    name: 'Queue Manager',
    icon: Layers,
    description: 'Advanced queue management with priority, scheduling, and batch processing',
    category: 'control',
    isAdvanced: true,
    defaultConfig: {
      queueName: 'default_queue',
      queueType: 'fifo',
      maxQueueSize: 1000,
      processingMode: 'sequential',
      batchSize: 1,
      priority: 0,
      delayMs: 0,
      retentionPolicy: 'auto',
      deadLetterQueue: '',
      visibilityTimeout: 30000,
      messageDeduplication: false
    },
    configSchema: {
      queueName: {
        label: 'Queue Name',
        type: 'string',
        placeholder: 'my_queue',
        helperText: 'Unique name for this queue',
        required: true
      },
      queueType: {
        label: 'Queue Type',
        type: 'select',
        options: ['fifo', 'lifo', 'priority', 'delay'],
        defaultValue: 'fifo',
        helperText: 'Type of queue ordering'
      },
      maxQueueSize: {
        label: 'Max Queue Size',
        type: 'number',
        defaultValue: 1000,
        helperText: 'Maximum number of items in queue'
      },
      processingMode: {
        label: 'Processing Mode',
        type: 'select',
        options: ['sequential', 'parallel', 'batch'],
        defaultValue: 'sequential',
        helperText: 'How to process queue items'
      },
      batchSize: {
        label: 'Batch Size',
        type: 'number',
        defaultValue: 1,
        helperText: 'Number of items to process in each batch'
      },
      priority: {
        label: 'Priority',
        type: 'number',
        defaultValue: 0,
        helperText: 'Queue priority (higher = processed first)'
      },
      delayMs: {
        label: 'Delay (ms)',
        type: 'number',
        defaultValue: 0,
        helperText: 'Delay before processing items'
      },
      retentionPolicy: {
        label: 'Retention Policy',
        type: 'select',
        options: ['auto', 'manual', 'time-based'],
        defaultValue: 'auto',
        helperText: 'How to handle processed items'
      },
      deadLetterQueue: {
        label: 'Dead Letter Queue',
        type: 'string',
        placeholder: 'dlq_queue',
        helperText: 'Queue for failed items'
      },
      visibilityTimeout: {
        label: 'Visibility Timeout (ms)',
        type: 'number',
        defaultValue: 30000,
        helperText: 'Time item is invisible after being received'
      },
      messageDeduplication: {
        label: 'Message Deduplication',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Prevent duplicate messages'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: ['enqueue', 'dequeue', 'peek'],
    outputHandles: ['item', 'queue_status', 'error']
  },

  // Enhanced Scheduler
  {
    type: 'advancedScheduler',
    name: 'Advanced Scheduler',
    icon: Timer,
    description: 'Advanced scheduling with complex cron expressions, time zones, and scheduling policies',
    category: 'trigger',
    isAdvanced: true,
    defaultConfig: {
      scheduleType: 'cron',
      cronExpression: '0 * * * *',
      timezone: 'UTC',
      startDate: '',
      endDate: '',
      maxExecutions: 0,
      schedulingPolicy: 'strict',
      missedExecutionPolicy: 'skip',
      overlapPolicy: 'skip',
      jitter: 0,
      conditions: [],
      holidays: [],
      workingDays: [1, 2, 3, 4, 5] // Monday to Friday
    },
    configSchema: {
      scheduleType: {
        label: 'Schedule Type',
        type: 'select',
        options: ['cron', 'interval', 'once', 'conditional'],
        defaultValue: 'cron',
        helperText: 'Type of scheduling'
      },
      cronExpression: {
        label: 'Cron Expression',
        type: 'string',
        placeholder: '0 9 * * MON',
        helperText: 'Cron expression for scheduling (e.g., "0 9 * * MON" for 9 AM every Monday)',
        required: true
      },
      timezone: {
        label: 'Timezone',
        type: 'string',
        defaultValue: 'UTC',
        placeholder: 'America/New_York',
        helperText: 'Timezone for schedule evaluation'
      },
      startDate: {
        label: 'Start Date',
        type: 'string',
        placeholder: '2024-01-01T00:00:00Z',
        helperText: 'When to start scheduling (ISO 8601 format)'
      },
      endDate: {
        label: 'End Date',
        type: 'string',
        placeholder: '2024-12-31T23:59:59Z',
        helperText: 'When to stop scheduling (ISO 8601 format)'
      },
      maxExecutions: {
        label: 'Max Executions',
        type: 'number',
        defaultValue: 0,
        helperText: 'Maximum number of executions (0 = unlimited)'
      },
      schedulingPolicy: {
        label: 'Scheduling Policy',
        type: 'select',
        options: ['strict', 'flexible', 'best-effort'],
        defaultValue: 'strict',
        helperText: 'How strictly to follow the schedule'
      },
      missedExecutionPolicy: {
        label: 'Missed Execution Policy',
        type: 'select',
        options: ['skip', 'run-once', 'catch-up'],
        defaultValue: 'skip',
        helperText: 'What to do with missed executions'
      },
      overlapPolicy: {
        label: 'Overlap Policy',
        type: 'select',
        options: ['skip', 'queue', 'terminate-previous'],
        defaultValue: 'skip',
        helperText: 'What to do if previous execution is still running'
      },
      jitter: {
        label: 'Jitter (ms)',
        type: 'number',
        defaultValue: 0,
        helperText: 'Random delay to add to prevent thundering herd'
      },
      conditions: {
        label: 'Conditions',
        type: 'json',
        placeholder: '[{"condition": "{{weather.temperature}} > 20", "action": "execute"}]',
        helperText: 'Additional conditions for execution'
      },
      holidays: {
        label: 'Holidays',
        type: 'json',
        placeholder: '["2024-01-01", "2024-12-25"]',
        helperText: 'Dates to skip (ISO date format)'
      },
      workingDays: {
        label: 'Working Days',
        type: 'json',
        placeholder: '[1, 2, 3, 4, 5]',
        helperText: 'Days of week to execute (1=Monday, 7=Sunday)',
        defaultValue: [1, 2, 3, 4, 5]
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA
    },
    inputHandles: [],
    outputHandles: ['triggered_at', 'schedule_info', 'error']
  }
];

// Export function to get all enhanced nodes
export function getAdvancedNodes(): AvailableNodeType[] {
  return ADVANCED_NODES_CONFIG;
}

// Export function to get node by type
export function getAdvancedNodeByType(type: string): AvailableNodeType | undefined {
  return ADVANCED_NODES_CONFIG.find(node => node.type === type);
}