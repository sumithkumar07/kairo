
import type { WorkflowNode, WorkflowConnection, ExampleWorkflow } from '@/types/workflow';
import { NODE_HEIGHT, NODE_WIDTH } from './nodes';

export const EXAMPLE_WORKFLOWS: ExampleWorkflow[] = [
  {
    name: 'Test Case: Failing API Fetch',
    description: 'This workflow is intentionally broken to test the AI debugging feature. Running it in "Live Mode" will cause an error, which will be automatically sent to the AI assistant for analysis.',
    nodes: [
      {
        id: 'webhook_trigger_1',
        type: 'webhookTrigger',
        name: 'Simulated Webhook Trigger',
        description: 'Simulates an HTTP call to start the workflow.',
        position: { x: 50, y: 50 },
        config: { 
          pathSuffix: 'simple-api-trigger', 
          simulatedRequestBody: '{"start_signal": true}',
          simulatedRequestHeaders: '{}',
          simulatedRequestQuery: '{}',
        },
        inputHandles: [],
        outputHandles: ['requestBody', 'requestHeaders', 'requestQuery', 'error'],
        category: 'trigger',
        aiExplanation: 'This node simulates an incoming webhook request that triggers the workflow. Its outputs (like requestBody) can be used by subsequent nodes.'
      },
      {
        id: 'http_1',
        type: 'httpRequest',
        name: 'Fetch Posts API (Intentionally Broken)',
        description: 'This node is configured with an invalid URL to cause a failure.',
        position: { x: 50, y: 50 + NODE_HEIGHT + 40 },
        config: {
          url: '{{non_existent_source.url}}', // This will fail to resolve
          method: 'GET',
          simulatedResponse: '[{"id":1, "title":"Example Post", "body":"This is a test."}]',
          simulatedStatusCode: 200,
        },
        inputHandles: ['input'],
        outputHandles: ['response', 'status_code', 'error'],
        category: 'action',
        aiExplanation: 'This node is intentionally broken with an invalid URL placeholder ({{non_existent_source.url}}) to demonstrate the automated AI debugging feature. When you run this workflow in Live Mode, the node will fail, and the error message will be passed through its "error" output handle. We have connected this handle to a logging node to demonstrate a proper error-handling pattern.'
      },
      {
        id: 'log_api_failure',
        type: 'logMessage',
        name: 'Log API Failure',
        description: 'Logs the error message if the API call fails.',
        position: { x: 50 + NODE_WIDTH + 60, y: 50 + NODE_HEIGHT + 40 },
        config: {
          message: 'HTTP request failed with error: {{http_1.error}}',
        },
        inputHandles: ['input'],
        outputHandles: ['output'],
        category: 'io',
        aiExplanation: 'This node catches and logs any error from the "Fetch Posts API" node, using the dedicated error path.'
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
        outputHandles: ['output', 'error'],
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
      { id: 'conn_1', sourceNodeId: 'webhook_trigger_1', sourceHandle: 'requestBody', targetNodeId: 'http_1', targetHandle: 'input' },
      { id: 'conn_2', sourceNodeId: 'http_1', sourceHandle: 'response', targetNodeId: 'parse_1', targetHandle: 'input' },
      { id: 'conn_3', sourceNodeId: 'parse_1', sourceHandle: 'output', targetNodeId: 'log_1', targetHandle: 'input' },
      { id: 'conn_err_1', sourceNodeId: 'http_1', sourceHandle: 'error', targetNodeId: 'log_api_failure', targetHandle: 'input' }
    ],
  },
  {
    name: 'Conditional Email Sender',
    description: 'Triggers via (simulated) HTTP, checks a condition, then sends different emails.',
    nodes: [
      {
        id: 'webhook_trigger_ex2',
        type: 'webhookTrigger',
        name: 'Order Webhook',
        description: 'Simulates an incoming order webhook.',
        position: { x: 50, y: 50 },
        config: { 
            pathSuffix: 'example-order-hook',
            simulatedRequestBody: '{"user_id": "user123", "order_value": 150, "customer_email": "test@example.com"}', 
            simulatedRequestHeaders: '{}',
            simulatedRequestQuery: '{}',
        },
        inputHandles: [], 
        outputHandles: ['requestBody', 'requestHeaders', 'requestQuery', 'error'], 
        category: 'trigger',
        aiExplanation: 'This node simulates an HTTP POST request that triggers the workflow, providing simulated user and order data in its requestBody output handle.'
      },
      {
        id: 'condition_ex2',
        type: 'conditionalLogic',
        name: 'Check Order Value > 100',
        description: 'Checks if the order value is greater than 100.',
        position: { x: 50, y: 50 + NODE_HEIGHT + 40 },
        config: {
          condition: '{{webhook_trigger_ex2.requestBody.order_value}} > 100',
        },
        inputHandles: ['input'],
        outputHandles: ['result'],
        category: 'logic',
        aiExplanation: 'Evaluates if the "order_value" from the webhook_trigger_ex2.requestBody is greater than 100. Outputs a boolean result.'
      },
      {
        id: 'email_high_value_ex2',
        type: 'sendEmail',
        name: 'Send High Value Email',
        description: 'Sends an email for high value orders.',
        position: { x: 50 - NODE_WIDTH - 30, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          to: '{{webhook_trigger_ex2.requestBody.customer_email}}',
          subject: 'High Value Order Confirmation! User: {{webhook_trigger_ex2.requestBody.user_id}}',
          body: 'Thank you for your high value order! Details for user {{webhook_trigger_ex2.requestBody.user_id}} are being processed.',
          _flow_run_condition: '{{condition_ex2.result}}', 
          simulatedMessageId: 'sim-email-high-value'
        },
        inputHandles: ['input'],
        outputHandles: ['messageId', 'error'],
        category: 'action',
        aiExplanation: 'Sends an email if condition_ex2.result is true. Uses customer_email from trigger. Includes user_id in subject/body.'
      },
      {
        id: 'email_standard_value_ex2',
        type: 'sendEmail',
        name: 'Send Standard Email',
        description: 'Sends an email for standard value orders.',
        position: { x: 50 + NODE_WIDTH + 30, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          to: '{{webhook_trigger_ex2.requestBody.customer_email}}',
          subject: 'Standard Order Confirmation: User {{webhook_trigger_ex2.requestBody.user_id}}',
          body: 'Thank you for your order! Details for user {{webhook_trigger_ex2.requestBody.user_id}} are being processed.',
          _flow_run_condition: '{{condition_ex2.result}} == false', 
          simulatedMessageId: 'sim-email-standard-value'
        },
        inputHandles: ['input'],
        outputHandles: ['messageId', 'error'],
        category: 'action',
        aiExplanation: 'Sends an email if condition_ex2.result is false. Uses customer_email from trigger. Includes user_id in subject/body.'
      },
    ],
    connections: [
      { id: 'conn_ex2_1', sourceNodeId: 'webhook_trigger_ex2', sourceHandle: 'requestBody', targetNodeId: 'condition_ex2', targetHandle: 'input' },
      { id: 'conn_ex2_2', sourceNodeId: 'condition_ex2', sourceHandle: 'result', targetNodeId: 'email_high_value_ex2', targetHandle: 'input' },
      { id: 'conn_ex2_3', sourceNodeId: 'condition_ex2', sourceHandle: 'result', targetNodeId: 'email_standard_value_ex2', targetHandle: 'input' },
    ],
  },
  {
    name: 'Content Summarization & Email',
    description: 'Fetches (simulated) article content, summarizes it using AI, and emails the summary.',
    nodes: [
      {
        id: 'trigger_summarize',
        type: 'webhookTrigger',
        name: 'Start Summarization',
        description: 'Trigger to start the content summarization process.',
        position: { x: 50, y: 50 },
        config: {
          pathSuffix: 'summarize-content-trigger',
          simulatedRequestBody: '{"article_url": "https://example.com/article-to-summarize"}',
          simulatedRequestHeaders: '{}',
          simulatedRequestQuery: '{}',
        },
        inputHandles: [],
        outputHandles: ['requestBody', 'requestHeaders', 'requestQuery', 'error'],
        category: 'trigger',
        aiExplanation: 'Simulates a trigger (e.g., new article event) with a dummy article URL.'
      },
      {
        id: 'fetch_article_summarize',
        type: 'httpRequest',
        name: 'Fetch Article Content',
        description: 'Simulates fetching content of an article.',
        position: { x: 50, y: 50 + NODE_HEIGHT + 40 },
        config: {
          url: '{{trigger_summarize.requestBody.article_url}}',
          method: 'GET',
          simulatedResponse: '{"title": "The Future of AI", "content": "Artificial intelligence is rapidly evolving. This article explores various aspects including machine learning, natural language processing, and ethical considerations. It highlights potential breakthroughs and challenges ahead. The impact on society could be transformative."}',
          simulatedStatusCode: 200,
        },
        inputHandles: ['input'],
        outputHandles: ['response', 'status_code', 'error'],
        category: 'action',
        aiExplanation: 'Simulates fetching article data. In a real scenario, this would fetch actual content from the URL provided by the trigger.'
      },
      {
        id: 'summarize_ai_task',
        type: 'aiTask',
        name: 'Summarize Content (AI)',
        description: 'Uses AI to summarize the fetched article content.',
        position: { x: 50, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          prompt: 'Summarize the following article content in two sentences: {{fetch_article_summarize.response.content}}',
          model: 'googleai/gemini-1.5-flash-latest',
          simulatedOutput: 'AI is evolving fast, with breakthroughs in ML and NLP, presenting both opportunities and ethical challenges for society.',
        },
        inputHandles: ['input'],
        outputHandles: ['output', 'error'],
        category: 'ai',
        aiExplanation: 'Sends the article content to an AI model for summarization. Uses the content from the fetch_article_summarize node.'
      },
      {
        id: 'email_summary',
        type: 'sendEmail',
        name: 'Email Article Summary',
        description: 'Emails the generated summary.',
        position: { x: 50, y: 50 + (NODE_HEIGHT + 40) * 3 },
        config: {
          to: '{{env.SUMMARY_RECIPIENT_EMAIL}}',
          subject: 'AI Summary: {{fetch_article_summarize.response.title}}',
          body: 'Here is the AI-generated summary for the article "{{fetch_article_summarize.response.title}}":\\n\\n{{summarize_ai_task.output}}\\n\\nOriginal URL: {{trigger_summarize.requestBody.article_url}}',
          simulatedMessageId: 'sim-email-summary-id',
        },
        inputHandles: ['input'],
        outputHandles: ['messageId', 'error'],
        category: 'action',
        aiExplanation: 'Emails the AI-generated summary. The recipient email should be set via the {{env.SUMMARY_RECIPIENT_EMAIL}} environment variable. It uses the article title and summary from previous steps.'
      },
    ],
    connections: [
      { id: 'conn_s1', sourceNodeId: 'trigger_summarize', sourceHandle: 'requestBody', targetNodeId: 'fetch_article_summarize', targetHandle: 'input' },
      { id: 'conn_s2', sourceNodeId: 'fetch_article_summarize', sourceHandle: 'response', targetNodeId: 'summarize_ai_task', targetHandle: 'input' },
      { id: 'conn_s3', sourceNodeId: 'summarize_ai_task', sourceHandle: 'output', targetNodeId: 'email_summary', targetHandle: 'input' },
    ],
  },
  {
    name: 'Daily YouTube Trending to Slack',
    description: 'A complete workflow that runs daily, fetches top trending YouTube videos, and posts them to a Slack channel.',
    nodes: [
      {
        id: 'daily_schedule',
        type: 'schedule',
        name: 'Daily at 9 AM',
        description: 'Triggers this workflow every day at 9 AM.',
        position: { x: 50, y: 50 },
        config: { cron: '0 9 * * *' },
        inputHandles: [],
        outputHandles: ['triggered_at'],
        category: 'trigger',
        aiExplanation: 'This Schedule node kicks off the workflow every day at 9 AM based on its CRON expression. Note that in this prototype, scheduled triggers are conceptual and must be run manually.'
      },
      {
        id: 'fetch_trending',
        type: 'youtubeFetchTrending',
        name: 'Fetch Trending Videos',
        description: 'Fetches the top 3 trending videos from YouTube for the US region.',
        position: { x: 50, y: 190 },
        config: { region: 'US', maxResults: 3, apiKey: '{{credential.YouTubeApiKey}}', simulated_config: { videos: [{id: 'sim1', title: 'Simulated Trending Video 1'}, {id: 'sim2', title: 'Simulated Trending Video 2'}, {id: 'sim3', title: 'Simulated Trending Video 3'}] } },
        inputHandles: ['input'],
        outputHandles: ['output', 'error'],
        category: 'integrations',
        aiExplanation: 'This node calls the YouTube API to get the top 3 trending videos. It requires a YouTube API key, which should be stored as a credential named `YouTubeApiKey`.'
      },
      {
        id: 'for_each_video',
        type: 'forEach',
        name: 'For Each Video',
        description: 'Loops through the list of videos fetched from the previous step.',
        position: { x: 50, y: 330 },
        config: {
          inputArrayPath: '{{fetch_trending.output.videos}}',
          iterationNodes: '[{"id":"format_message","type":"concatenateStrings","name":"Format Slack Message","position":{"x":10,"y":10},"config":{"stringsToConcatenate":["New Trending Video on YouTube!\\\\n*Title:* ","{{item.title}}","\\\\n*URL:* https://www.youtube.com/watch?v=","{{item.id}}"],"separator":""}},{"id":"post_to_slack","type":"slackPostMessage","name":"Post to Slack","position":{"x":10,"y":150},"config":{"channel":"#youtube-trends","text":"{{format_message.output_data}}","token":"{{credential.SlackBotToken}}","simulated_config":{"ok":true}}}]',
          iterationConnections: '[{"id":"iter_conn_1","sourceNodeId":"format_message","sourceHandle":"output_data","targetNodeId":"post_to_slack","targetHandle":"input"}]',
          continueOnError: true,
        },
        inputHandles: ['input_array_data'],
        outputHandles: ['results', 'error'],
        category: 'iteration',
        aiExplanation: 'This node iterates through the array of video objects from the "Fetch Trending Videos" node. For each video, it executes a sub-flow (defined in its configuration) that formats a message and posts it to Slack.'
      },
      {
        id: 'final_log',
        type: 'logMessage',
        name: 'Log Completion',
        description: 'Logs a message when the entire workflow has finished.',
        position: { x: 50, y: 470 },
        config: { message: 'YouTube to Slack workflow completed. Status: {{for_each_video.status}}. See individual iteration results for details.' },
        inputHandles: ['input'],
        outputHandles: ['output'],
        category: 'io',
        aiExplanation: 'This final node logs a completion message once the loop has finished processing all videos. It includes the overall status of the loop operation.'
      }
    ],
    connections: [
      { id: 'conn_zap_1', sourceNodeId: 'daily_schedule', sourceHandle: 'triggered_at', targetNodeId: 'fetch_trending', targetHandle: 'input' },
      { id: 'conn_zap_2', sourceNodeId: 'fetch_trending', sourceHandle: 'output', targetNodeId: 'for_each_video', targetHandle: 'input_array_data' },
      { id: 'conn_zap_3', sourceNodeId: 'for_each_video', sourceHandle: 'results', targetNodeId: 'final_log', targetHandle: 'input' }
    ],
  },
  {
    name: 'Database User Onboarding',
    description: 'Receives new user data, adds to database (simulated), and sends a welcome email.',
    nodes: [
      {
        id: 'webhook_onboard',
        type: 'webhookTrigger',
        name: 'New User Signup',
        description: 'Simulates a new user signing up.',
        position: { x: 50, y: 50 },
        config: {
          pathSuffix: 'new-user-onboarding',
          simulatedRequestBody: '{"name": "Jane Doe", "email": "jane.doe@example.com", "user_id": "usr_789"}',
          simulatedRequestHeaders: '{}',
          simulatedRequestQuery: '{}',
        },
        inputHandles: [],
        outputHandles: ['requestBody', 'requestHeaders', 'requestQuery', 'error'],
        category: 'trigger',
        aiExplanation: 'Simulates a webhook trigger for new user signups, providing name, email, and user_id.'
      },
      {
        id: 'db_add_user',
        type: 'databaseQuery',
        name: 'Add User to Database',
        description: 'Simulates adding the new user to a database.',
        position: { x: 50, y: 50 + NODE_HEIGHT + 40 },
        config: {
          queryText: 'INSERT INTO users (id, name, email, created_at) VALUES ($1, $2, $3, NOW());',
          queryParams: '["{{webhook_onboard.requestBody.user_id}}", "{{webhook_onboard.requestBody.name}}", "{{webhook_onboard.requestBody.email}}"]',
          simulatedResults: '[]', 
          simulatedRowCount: 1, 
        },
        inputHandles: ['input'],
        outputHandles: ['results', 'rowCount', 'error'],
        category: 'io',
        aiExplanation: 'Simulates an INSERT SQL query to add the new user to a "users" table. Uses data from the webhook_onboard trigger. A real database would require DB_CONNECTION_STRING to be set.'
      },
      {
        id: 'log_db_result',
        type: 'logMessage',
        name: 'Log DB Operation',
        description: 'Logs the result of the database operation.',
        position: { x: 50 + NODE_WIDTH + 30, y: 50 + NODE_HEIGHT + 40 },
        config: {
          message: 'Database operation for {{webhook_onboard.requestBody.user_id}}: RowCount={{db_add_user.rowCount}}. Error: {{db_add_user.error}}',
        },
        inputHandles: ['input'],
        outputHandles: ['output'],
        category: 'io',
        aiExplanation: 'Logs the status and row count (or error) from the db_add_user node for monitoring.'
      },
      {
        id: 'email_welcome',
        type: 'sendEmail',
        name: 'Send Welcome Email',
        description: 'Sends a welcome email to the new user.',
        position: { x: 50, y: 50 + (NODE_HEIGHT + 40) * 2 },
        config: {
          to: '{{webhook_onboard.requestBody.email}}',
          subject: 'Welcome to Kairo, {{webhook_onboard.requestBody.name}}!',
          body: 'Hi {{webhook_onboard.requestBody.name}},\\n\\nWelcome aboard! We are excited to have you.\\n\\nBest,\\nThe Kairo Team',
          simulatedMessageId: 'sim-welcome-email-id',
          _flow_run_condition: '{{db_add_user.rowCount}} == 1',
        },
        inputHandles: ['input'],
        outputHandles: ['messageId', 'error'],
        category: 'action',
        aiExplanation: 'Sends a welcome email to the new user. This node only runs if the db_add_user node was successful (i.e. rowCount is 1). Email server env vars (EMAIL_HOST, etc.) needed for live mode.'
      },
    ],
    connections: [
      { id: 'conn_db1', sourceNodeId: 'webhook_onboard', sourceHandle: 'requestBody', targetNodeId: 'db_add_user', targetHandle: 'input' },
      { id: 'conn_db2_success', sourceNodeId: 'db_add_user', sourceHandle: 'rowCount', targetNodeId: 'log_db_result', targetHandle: 'input' },
      { id: 'conn_db2_error', sourceNodeId: 'db_add_user', sourceHandle: 'error', targetNodeId: 'log_db_result', targetHandle: 'input' },
      { id: 'conn_db3', sourceNodeId: 'db_add_user', sourceHandle: 'rowCount', targetNodeId: 'email_welcome', targetHandle: 'input' },
    ],
  },
];
