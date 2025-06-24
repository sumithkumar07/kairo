
# Kairo - AI Workflow Automation

Kairo is a Next.js application designed to help users visually create, manage, and automate workflows with the assistance of AI.

## Key Features

*   **AI-Powered Workflow Generation**: Describe your desired automation in plain text, and Kairo's AI will draft an initial workflow for you.
*   **Visual Workflow Editor**: A drag-and-drop interface to build and modify workflows by connecting various functional nodes.
*   **Node Library**: A collection of pre-built nodes for common tasks like HTTP requests, email sending, data parsing, AI tasks, conditional logic, and more.
*   **Simulation Mode**: Test your workflows with mock data before deploying them for live execution.
*   **AI Assistant**: Get suggestions for next steps, explanations for existing workflows, and help with node configuration.
*   **Local Workflow Storage**: Save and load your workflows directly in your browser.
*   **Subscription Tiers**: (Simulated) Free and Pro tiers with different feature access.

## Getting Started

1.  Ensure you have Node.js and npm/yarn installed.
2.  Clone the repository.
3.  Install dependencies: `npm install` or `yarn install`.
4.  **Set up Environment Variables**:
    *   Create a `.env.local` file in the root directory by copying `.env` (if it's empty, just create the file).
    *   Refer to the "Important Considerations for Live Mode & Deployment" section below for essential variables needed for live features. **Pay special attention to `GOOGLE_API_KEY` for AI features.**
5.  Run the development server: `npm run dev` or `yarn dev`.
6.  Open [http://localhost:3000](http://localhost:3000) (or your configured port) in your browser.

The main workflow editor is accessible at the `/workflow` route. Explore the homepage for an overview and navigation links.

## Important Considerations for Live Mode & Deployment

When you switch a workflow from "Simulation Mode" to "Live Mode", or deploy this application, certain features will require environment variables to be properly configured.

### Essential Environment Variables

Create a `.env.local` file in the project root for local development, or set these variables in your deployment environment:

*   **Genkit AI Features (`aiTask` node, AI suggestions, AI Assistant Chat, etc.):**
    *   **`GOOGLE_API_KEY=YOUR_GOOGLE_CLOUD_API_KEY`**
        *   **CRITICAL for AI functionality.** You **MUST** provide a valid Google Cloud API key here.
        *   This key needs to be associated with a Google Cloud Project where the "Generative Language API" (sometimes referred to as "Vertex AI API" or similar, e.g., `generativelanguage.googleapis.com`) is enabled.
        *   If Genkit is deployed to a Google Cloud environment (like Cloud Run, App Engine) that has Application Default Credentials (ADC) correctly configured with permissions for the Generative Language API, this variable might not be strictly necessary as Genkit might pick up ADC. However, for local development or non-Google Cloud deployments, this environment variable is the primary way to authenticate.
        *   **Troubleshooting AI Assistant Errors:** If the AI Assistant frequently responds with "There's an issue with the AI service configuration. Please contact support if this persists." or "An unexpected error occurred...", a missing, invalid, or incorrectly configured `GOOGLE_API_KEY` (or the API not being enabled in your GCP project) is the most common cause. Double-check your key and project settings.
*   **Database Queries (`databaseQuery` node in Live Mode):**
    *   `DB_CONNECTION_STRING="postgresql://user:password@host:port/database"`
        *   Replace with your actual PostgreSQL connection string.
*   **Email Sending (`sendEmail` node in Live Mode):**
    *   `EMAIL_HOST="your_smtp_host"`
    *   `EMAIL_PORT="your_smtp_port"` (e.g., 587 or 465)
    *   `EMAIL_USER="your_smtp_username"`
    *   `EMAIL_PASS="your_smtp_password"`
    *   `EMAIL_FROM="notifications@example.com"` (The "From" address for emails)
    *   `EMAIL_SECURE="true"` (Use `true` for SSL/TLS, `false` for non-secure or STARTTLS on some ports)
*   **Credential Placeholders (`{{credential.NAME}}`):**
    *   The application currently simulates a Credential Manager. Placeholders like `{{credential.MyApiKey}}` or `{{credential.MyDatabaseConnection}}` will attempt to resolve by looking for an environment variable named `MyApiKey` or `MyDatabaseConnection` respectively.
    *   For example, if your workflow uses `{{credential.OpenAI_API_Key}}`, you should set an environment variable: `OpenAI_API_Key="your_actual_openai_key"`.
*   **Custom Environment Variables (`{{env.NAME}}`):**
    *   If your workflows reference custom environment variables like `{{env.MY_CUSTOM_SETTING}}`, ensure these are also defined (e.g., `MY_CUSTOM_SETTING="some_value"`).

### Live Webhook Trigger (`webhookTrigger` node)

*   **Base URL:** Live webhooks are exposed at `/api/workflow-webhooks/YOUR_PATH_SUFFIX`. Replace `YOUR_PATH_SUFFIX` with the value configured in the `webhookTrigger` node.
*   **Current Limitation:** The API route (`src/app/api/workflow-webhooks/[...path]/route.ts`) that handles incoming webhooks is currently designed to execute workflows found within the `EXAMPLE_WORKFLOWS` array (defined in `src/config/example-workflows.ts`) or user-saved workflows stored on the server's file system (`src/data/user_workflows.json`).
    *   This means if you create a new workflow with a `webhookTrigger` node and save it (which saves to your browser's local storage), that specific user-created workflow **will not be directly triggerable by external HTTP calls in a deployed environment.**
    *   To test live webhooks, you would typically modify one of the existing example workflows that already includes a `webhookTrigger` or ensure your custom workflow's path suffix matches one defined in an example and that the example is configured to meet your testing needs.
    *   A robust solution for user-defined, live-triggered webhooks would require a backend database to store and retrieve user workflows, which is beyond the current prototype's scope.
*   **Security Token:** If a `securityToken` (e.g., `{{credential.MyWebhookSecret}}`) is configured in the `webhookTrigger` node, the incoming live request must include an `X-Webhook-Token` header with the matching resolved secret value.

By keeping these points in mind, you can more effectively test and utilize the live mode capabilities of Kairo.
