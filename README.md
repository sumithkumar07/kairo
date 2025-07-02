
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
*   **Cloud & Example Storage**: Save your workflows to your Supabase cloud database for persistent storage, or load pre-built example workflows to explore features.

## Getting Started

1.  Ensure you have Node.js and npm/yarn installed.
2.  Clone the repository.
3.  Install dependencies: `npm install` or `yarn install`.
4.  **Set up Environment Variables**:
    *   Create a `.env.local` file in the root directory by copying `.env`.
    *   Refer to the "Environment Variables Setup" section below for essential variables. **Pay special attention to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for authentication and database features, and `GOOGLE_API_KEY` for AI features.**
5.  **Set up the Database**:
    *   To save workflows and view run history, you must set up the database tables in your Supabase project.
    *   Go to the "Production Database Setup (Supabase)" section below, copy the SQL commands, and run them in the **SQL Editor** in your Supabase dashboard.
6.  Run the development server: `npm run dev`
7.  Open [http://localhost:3000](http://localhost:3000) (or your configured port) in your browser.

The main workflow editor is accessible at the `/workflow` route.

## Environment Variables Setup

Create a `.env.local` file in the project root for local development, or set these variables in your deployment environment:

*   **Supabase (Authentication & Database):**
    *   You **must** set up a Supabase project and provide the following variables.
    *   In your Supabase project dashboard, navigate to "Project Settings" > "API". You will find your Project URL and anon public key there.
    *   `NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"`

*   **Genkit AI Features (All AI functionality):**
    *   `GOOGLE_API_KEY=YOUR_GOOGLE_CLOUD_API_KEY`
        *   **CRITICAL for ALL AI functionality.** You **MUST** provide a valid Google Cloud API key associated with a project where the "Generative Language API" is enabled.
        *   If the AI Assistant responds with errors about "AI service configuration", a missing or invalid `GOOGLE_API_KEY` is the most common cause.

*   **AI Agent Hub API:**
    *   `KAIRO_MCP_API_KEY=YOUR_SECRET_API_KEY`
        *   A secret key you define. This key is used to authenticate requests to the `/api/mcp` endpoint, allowing you to programmatically control the AI agent.

*   **Database Queries (`databaseQuery` node in Live Mode):**
    *   `DB_CONNECTION_STRING="postgresql://user:password@host:port/database"`
        *   Replace with your actual PostgreSQL connection string. You can get this from your Supabase project dashboard under "Project Settings" > "Database" > "Connection string". Choose the "URI" option for direct connections.

*   **Email Sending (`sendEmail` node in Live Mode):**
    *   `EMAIL_HOST="your_smtp_host"`
    *   `EMAIL_PORT="your_smtp_port"`
    *   `EMAIL_USER="your_smtp_username"`
    *   `EMAIL_PASS="your_smtp_password"`
    *   `EMAIL_FROM="notifications@example.com"`
    *   `EMAIL_SECURE="true"` (Use `true` for SSL/TLS)

*   **Credential Placeholders (`{{credential.NAME}}`):**
    *   The application simulates a Credential Manager by resolving placeholders like `{{credential.MyApiKey}}` to environment variables named `MyApiKey`. For example, if a node uses `{{credential.OpenAI_API_Key}}`, you must set an environment variable: `OpenAI_API_Key="your_actual_key"`. The Agent Hub's "Credentials" tab lists common keys used by the available nodes.

## Production Database Setup (Supabase)

To enable saving workflows, run history, and agent configurations, you must create the necessary tables in your Supabase project.

1.  Navigate to your Supabase project dashboard.
2.  Go to the **SQL Editor**.
3.  Click **"+ New query"**.
4.  Copy the entire SQL script below, paste it into the editor, and click **"RUN"**.

```sql
-- Create the table for storing user-saved workflows
CREATE TABLE public.workflows (
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    workflow_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT workflows_pkey PRIMARY KEY (user_id, name),
    CONSTRAINT workflows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create the table for storing workflow run history
CREATE TABLE public.run_history (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    workflow_name character varying NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    status text NOT NULL,
    execution_result jsonb,
    initial_data jsonb,
    workflow_snapshot jsonb,
    CONSTRAINT run_history_pkey PRIMARY KEY (id),
    CONSTRAINT run_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.run_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own run history" ON public.run_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create the table for storing AI Agent Hub command history
CREATE TABLE public.mcp_command_history (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    command text NOT NULL,
    response text,
    status text NOT NULL,
    CONSTRAINT mcp_command_history_pkey PRIMARY KEY (id),
    CONSTRAINT mcp_command_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.mcp_command_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own command history" ON public.mcp_command_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create the table for storing AI Agent configurations (enabled tools)
CREATE TABLE public.agent_config (
    user_id uuid NOT NULL,
    enabled_tools jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agent_config_pkey PRIMARY KEY (user_id),
    CONSTRAINT agent_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own agent config" ON public.agent_config FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a PostgreSQL function to securely search for a workflow by its webhook path
-- This function can be called via RPC and respects Row Level Security.
create or replace function find_workflow_by_webhook_path(path_suffix_to_find text)
returns jsonb
language plpgsql
security definer
as $$
begin
  return (
    select w.workflow_data
    from public.workflows as w
    where w.workflow_data->'nodes' @> jsonb_build_array(jsonb_build_object('type', 'webhookTrigger', 'config', jsonb_build_object('pathSuffix', path_suffix_to_find)))
    limit 1
  );
end;
$$;
```

## Live Mode & Deployment Considerations

### Live Webhook Trigger (`webhookTrigger` node)

*   **Base URL:** Live webhooks are exposed at `/api/workflow-webhooks/YOUR_PATH_SUFFIX`. Replace `YOUR_PATH_SUFFIX` with the value configured in the `webhookTrigger` node.
*   **Workflow Storage:** For a webhook to be triggered in a live environment, the workflow containing it **must be saved to the server** (using the "Save As..." or "Save" feature in the editor).
*   **Security Token:** If a `securityToken` (e.g., `{{credential.MyWebhookSecret}}`) is configured in the `webhookTrigger` node, the incoming live request must include an `X-Webhook-Token` header with the matching resolved secret value.

### AI Agent Hub API (`/api/mcp`)

*   To interact with the agent API, send a `POST` request to `/api/mcp`.
*   You must include an `Authorization` header with the value `Bearer YOUR_KAIRO_MCP_API_KEY`.
*   The request body should be a JSON object: `{ "command": "Your command for the AI" }`.
*   The AI will process the command and can generate and return a full workflow definition in the JSON response.

By keeping these points in mind, you can more effectively test and utilize the live mode capabilities of Kairo.

## Project Structure

A brief overview of the key directories in the project:

-   `/src/app`: Contains all the Next.js pages and API routes for the application.
-   `/src/ai`: The heart of the AI functionality, containing Genkit flows (`/flows`) and tools (`/tools`).
-   `/src/components`: Reusable React components, including UI components from shadcn/ui.
-   `/src/config`: Static configuration files for nodes (`nodes.ts`) and example workflows.
-   `/src/contexts`: React Context providers for managing global state like subscriptions.
-   `/src/services`: Server-side logic for interacting with the Supabase database.
-   `/src/types`: TypeScript type definitions used throughout the application.
-   `/src/lib`: Utility functions, including `cn` for classnames and workflow logic helpers.

## Known Limitations

This prototype is highly functional but has some limitations to be aware of before deploying to a large-scale production environment:

*   **Single Instance Deployment**: To prevent potential race conditions with certain operations, it's recommended to deploy this application as a single instance.
*   **No Automated Tests**: The project does not currently include a testing framework (e.g., Jest, Playwright). For a production-grade application, a comprehensive test suite would be essential.

## Future Enhancements

Here are some ideas for future development to build upon Kairo's foundation:

*   **Real-time Collaboration**: Implement features for multiple users to collaborate on the same workflow in real-time using Supabase's Realtime capabilities.
*   **Credential Manager UI**: Build a secure UI for managing credentials, storing them encrypted in the database instead of relying solely on environment variables.
*   **Expanded Node Library**: Continuously add new integration and utility nodes to expand the platform's capabilities.
*   **Workflow Versioning**: Allow users to save and revert to different versions of their workflows.


    