
# Kairo - AI Workflow Automation

Kairo is a Next.js application designed to help users visually create, manage, and automate workflows with the assistance of AI. This feature-rich prototype includes an interactive visual editor, AI-driven workflow generation, a live debugging history, and a programmatic API for agent control.

## Key Features

*   **AI-Powered Workflow Generation**: Describe your desired automation in plain text, and Kairo's AI will draft an initial workflow for you on the canvas.
*   **Visual Workflow Editor**: A drag-and-drop interface to build and modify workflows by connecting various functional nodes.
*   **Node Library**: A collection of pre-built nodes for common tasks like HTTP requests, email sending, data parsing, AI tasks, conditional logic, loops, parallel execution, and more.
*   **Live & Simulation Modes**: Test your workflows with mock data in "Simulation Mode" before switching to "Live Mode" for execution with real data and services.
*   **AI Assistant Panel**: Get suggestions for next steps, explanations for existing workflows, and help with node configuration through a conversational chat interface.
*   **Visual Run History & Debugging**: Review past workflow executions with a visual representation of the workflow, including the status of each node and the data that flowed through it. Re-run failed workflows with one click.
*   **AI Agent Hub**: Configure your AI agent's skills (available tools/nodes), view credential requirements, and get an API key to control the agent programmatically.
*   **Local & Server-Side Storage**: Save your workflows to your browser's local storage for quick access, or save them to the server to make them available for live webhook triggers.

## Getting Started

1.  Ensure you have Node.js and npm/yarn installed.
2.  Clone the repository.
3.  Install dependencies: `npm install` or `yarn install`.
4.  **Set up Environment Variables**:
    *   Create a `.env.local` file in the root directory by copying `.env`.
    *   Refer to the "Environment Variables Setup" section below for essential variables. **Pay special attention to `GOOGLE_API_KEY` for AI features.**
5.  Run the development server: `npm run dev`
6.  Open [http://localhost:3000](http://localhost:3000) (or your configured port) in your browser.

The main workflow editor is accessible at the `/workflow` route.

## Environment Variables Setup

Create a `.env.local` file in the project root for local development, or set these variables in your deployment environment:

*   **Genkit AI Features (All AI functionality):**
    *   `GOOGLE_API_KEY=YOUR_GOOGLE_CLOUD_API_KEY`
        *   **CRITICAL for ALL AI functionality.** You **MUST** provide a valid Google Cloud API key associated with a project where the "Generative Language API" is enabled.
        *   If the AI Assistant responds with errors about "AI service configuration", a missing or invalid `GOOGLE_API_KEY` is the most common cause.

*   **AI Agent Hub API:**
    *   `KAIRO_MCP_API_KEY=YOUR_SECRET_API_KEY`
        *   A secret key you define. This key is used to authenticate requests to the `/api/mcp` endpoint, allowing you to programmatically control the AI agent.

*   **Database Queries (`databaseQuery` node in Live Mode):**
    *   `DB_CONNECTION_STRING="postgresql://user:password@host:port/database"`
        *   Replace with your actual PostgreSQL connection string.

*   **Email Sending (`sendEmail` node in Live Mode):**
    *   `EMAIL_HOST="your_smtp_host"`
    *   `EMAIL_PORT="your_smtp_port"`
    *   `EMAIL_USER="your_smtp_username"`
    *   `EMAIL_PASS="your_smtp_password"`
    *   `EMAIL_FROM="notifications@example.com"`
    *   `EMAIL_SECURE="true"` (Use `true` for SSL/TLS)

*   **Credential Placeholders (`{{credential.NAME}}`):**
    *   The application simulates a Credential Manager by resolving placeholders like `{{credential.MyApiKey}}` to environment variables named `MyApiKey`. For example, if a node uses `{{credential.OpenAI_API_Key}}`, you must set an environment variable: `OpenAI_API_Key="your_actual_key"`. The Agent Hub's "Credentials" tab lists common keys used by the available nodes.

## Live Mode & Deployment Considerations

### Live Webhook Trigger (`webhookTrigger` node)

*   **Base URL:** Live webhooks are exposed at `/api/workflow-webhooks/YOUR_PATH_SUFFIX`. Replace `YOUR_PATH_SUFFIX` with the value configured in the `webhookTrigger` node.
*   **Workflow Storage:** For a webhook to be triggered in a live environment, the workflow containing it **must be saved to the server** (using the "Save As..." or "Save" feature in the editor). Workflows saved only to the browser's local storage are not accessible by the webhook API route.
*   **Security Token:** If a `securityToken` (e.g., `{{credential.MyWebhookSecret}}`) is configured in the `webhookTrigger` node, the incoming live request must include an `X-Webhook-Token` header with the matching resolved secret value.

### AI Agent Hub API (`/api/mcp`)

*   To interact with the agent API, send a `POST` request to `/api/mcp`.
*   You must include an `Authorization` header with the value `Bearer YOUR_KAIRO_MCP_API_KEY`.
*   The request body should be a JSON object: `{ "command": "Your command for the AI" }`.
*   The AI will process the command and can generate and return a full workflow definition in the JSON response.

By keeping these points in mind, you can more effectively test and utilize the live mode capabilities of Kairo.
