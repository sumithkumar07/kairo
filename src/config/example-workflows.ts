
import type { WorkflowNode, WorkflowConnection } from '@/types/workflow';
import { NODE_HEIGHT, NODE_WIDTH } from './nodes';

export interface ExampleWorkflow {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export const EXAMPLE_WORKFLOWS: ExampleWorkflow[] = [
  {
    name: 'Simple API Fetch & Log',
    description: 'Fetches data from a public API, parses the JSON, and logs the first item.',
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        name: 'Manual Start',
        description: 'Manually starts the workflow.',
        position: { x: 50, y: 50 },
        config: { event: 'manualStart' },
        inputHandles: [],
        outputHandles: ['output'],
        category: 'trigger',
        aiExplanation: 'This node manually triggers the workflow execution.'
      },
      {
        id: 'http_1',
        type: 'httpRequest',
        name: 'Fetch Posts API',
        description: 'Fetches a list of posts from JSONPlaceholder.',
        position: { x: 50, y: 50 + NODE_HEIGHT + 40 },
        config: {
          url: 'https://jsonplaceholder.typicode.com/posts',
          method: 'GET',
          simulatedResponse: '[{"id":1, "title":"Example Post", "body":"This is a test."}]',
          simulatedStatusCode: 200,
        },
        inputHandles: ['input'],
        outputHandles: ['response', 'status_code', 'error_message', 'status'],
        category: 'action',
        aiExplanation: 'Makes a GET request to JSONPlaceholder to fetch posts. Simulates a successful response.'
      },
      {
        id: 'parse_1',
        type: 'parseJson',
        name: 'Parse API Response',
        description: 'Parses the JSON response from the API.',
        position: { x: 50, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          jsonString: '{{http_1.response}}',
          path: '$[0]', 
        },
        inputHandles: ['input'],
        outputHandles: ['output', 'status', 'error_message'],
        category: 'logic',
        aiExplanation: 'Parses the JSON array from the http_1 node and extracts the first element (index 0).'
      },
      {
        id: 'log_1',
        type: 'logMessage',
        name: 'Log First Post',
        description: 'Logs the details of the first post.',
        position: { x: 50, y: 50 + (NODE_HEIGHT + 40) * 3 },
        config: {
          message: 'First post: {{parse_1.output}}',
        },
        inputHandles: ['input'],
        outputHandles: ['output'],
        category: 'io',
        aiExplanation: 'Logs the output of the parse_1 node (the first post object).'
      },
    ],
    connections: [
      { id: 'conn_1', sourceNodeId: 'trigger_1', sourceHandle: 'output', targetNodeId: 'http_1', targetHandle: 'input' },
      { id: 'conn_2', sourceNodeId: 'http_1', sourceHandle: 'response', targetNodeId: 'parse_1', targetHandle: 'input' },
      { id: 'conn_3', sourceNodeId: 'parse_1', sourceHandle: 'output', targetNodeId: 'log_1', targetHandle: 'input' },
    ],
  },
  {
    name: 'Conditional Email Sender',
    description: 'Triggers via HTTP, checks a condition, then sends different emails.',
    nodes: [
      {
        id: 'http_trigger_1',
        type: 'httpRequest',
        name: 'Webhook Trigger',
        description: 'Acts as an HTTP trigger for the workflow.',
        position: { x: 50, y: 50 },
        config: { 
            url: '/api/webhook/conditional_email', // Conceptual URL
            method: 'POST', 
            simulatedResponse: '{"user_id": "user123", "order_value": 150}', // Simulates incoming payload
            simulatedStatusCode: 200 
        },
        inputHandles: [], // No input handles as it's a trigger
        outputHandles: ['response', 'status_code'], // Outputs the request payload
        category: 'trigger',
        aiExplanation: 'This node simulates an HTTP POST request that triggers the workflow, providing simulated user and order data in its response handle.'
      },
      {
        id: 'condition_1',
        type: 'conditionalLogic',
        name: 'Check Order Value',
        description: 'Checks if the order value is greater than 100.',
        position: { x: 50, y: 50 + NODE_HEIGHT + 40 },
        config: {
          condition: '{{http_trigger_1.response.order_value}} > 100',
        },
        inputHandles: ['input'],
        outputHandles: ['result'],
        category: 'logic',
        aiExplanation: 'Evaluates if the "order_value" from the http_trigger_1 response is greater than 100. Outputs a boolean result.'
      },
      {
        id: 'email_high_value_1',
        type: 'sendEmail',
        name: 'Send High Value Email',
        description: 'Sends an email for high value orders.',
        position: { x: 50 - NODE_WIDTH - 30, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          to: '{{env.SALES_EMAIL_HIGH_VALUE}}',
          subject: 'High Value Order! User: {{http_trigger_1.response.user_id}}',
          body: 'A new order with value > 100 has been placed by {{http_trigger_1.response.user_id}}.',
          _flow_run_condition: '{{condition_1.result}}', // Runs if condition_1.result is true
          simulatedMessageId: 'sim-email-high-value'
        },
        inputHandles: ['input'],
        outputHandles: ['messageId', 'status', 'error_message'],
        category: 'action',
        aiExplanation: 'Sends an email if condition_1.result is true. Uses environment variable for recipient. Includes user_id in subject/body.'
      },
      {
        id: 'email_standard_value_1',
        type: 'sendEmail',
        name: 'Send Standard Email',
        description: 'Sends an email for standard value orders.',
        position: { x: 50 + NODE_WIDTH + 30, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          to: '{{env.SALES_EMAIL_STANDARD_VALUE}}',
          subject: 'New Standard Order: User {{http_trigger_1.response.user_id}}',
          body: 'A new order with value <= 100 has been placed by {{http_trigger_1.response.user_id}}.',
          _flow_run_condition: '{{condition_1.result}} == false', // Runs if condition_1.result is false
          simulatedMessageId: 'sim-email-standard-value'
        },
        inputHandles: ['input'],
        outputHandles: ['messageId', 'status', 'error_message'],
        category: 'action',
        aiExplanation: 'Sends an email if condition_1.result is false. Uses environment variable for recipient. Includes user_id in subject/body.'
      },
    ],
    connections: [
      { id: 'conn_s2_1', sourceNodeId: 'http_trigger_1', sourceHandle: 'response', targetNodeId: 'condition_1', targetHandle: 'input' },
      { id: 'conn_s2_2', sourceNodeId: 'condition_1', sourceHandle: 'result', targetNodeId: 'email_high_value_1', targetHandle: 'input' },
      { id: 'conn_s2_3', sourceNodeId: 'condition_1', sourceHandle: 'result', targetNodeId: 'email_standard_value_1', targetHandle: 'input' },
    ],
  },
];
