
# Kairo - AI Workflow Automation

Kairo is a Next.js application designed to help users visually create, manage, and automate workflows with the assistance of AI. This feature-rich prototype includes an interactive visual editor, AI-driven workflow generation, a live debugging history, and a programmatic API for agent control.

## Key Features

*   **AI-Powered Workflow Generation**: Describe your desired automation in plain text, and Kairo's AI will draft an initial workflow for you on the canvas.
*   **Visual Workflow Editor**: A drag-and-drop interface to build and modify workflows by connecting various functional nodes.
*   **Node Library**: A collection of pre-built nodes for common tasks like HTTP requests, email sending, data parsing, AI tasks, conditional logic, loops, parallel execution, and more.
*   **Live & Simulation Modes**: Test your workflows with mock data in "Simulation Mode" before switching to "Live Mode" for execution with real data and services.
*   **AI Assistant Panel**: Get suggestions for next steps, explanations for existing workflows, and help with node configuration through a conversational chat interface.
*   **Visual Run History & Debugging**: Review past workflow executions with a visual representation of the workflow, including the status of each node and the data that flowed through it. Re-run failed workflows with one click.
*   **AI Agent Hub**: Configure your AI agent's skills (available tools/nodes), manage credentials securely, and get an API key to control the agent programmatically.
*   **Cloud & Example Storage**: Save your workflows to your Supabase cloud database for persistent storage, or load pre-built example workflows to explore features.

## Technology Stack

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS with shadcn/ui components
*   **AI**: Google AI & Genkit
*   **Database & Auth**: Supabase
*   **Deployment**: Ready for Vercel, Netlify, or Firebase App Hosting

## Getting Started

1.  **Prerequisites**: Ensure you have Node.js and npm/yarn installed.
2.  **Clone Repository**: `git clone <repository-url>`
3.  **Install Dependencies**: `npm install`
4.  **Crucial Setup**: Follow the steps in the **"Environment & Database Setup"** section below. This is required for the app to function.
5.  **Run Development Server**: `npm run dev`
6.  **Open in Browser**: Navigate to `http://localhost:3000`. The main editor is at `/workflow`.

---

## Environment & Database Setup

This is the most important section for getting Kairo running.

### Step 1: Set Up Environment Variables

Create a file named `.env.local` in the root of your project by copying the `.env` file. You must fill in the following core variables.

#### **Core App Configuration (Required)**

These are **essential** for the app's core features to function.

*   `NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"`
    *   **Purpose**: Connects to your Supabase project for user accounts and data storage.
    *   **How to get it**: In your Supabase dashboard, go to "Project Settings" > "API".

*   `NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"`
    *   **Purpose**: Public key for client-side interaction with Supabase.
    *   **How to get it**: Found on the same "API" page in your Supabase dashboard.

*   `GOOGLE_API_KEY="YOUR_GOOGLE_CLOUD_API_KEY"`
    *   **Purpose**: Powers all AI features (workflow generation, assistant chat, etc.).
    *   **How to get it**: In the Google Cloud Console, create a project, enable the "Generative Language API", and create an API key under "APIs & Services" > "Credentials".

*   `KAIRO_MCP_API_KEY="YOUR_SECRET_API_KEY"`
    *   **Purpose**: A secret key you define to protect the AI Agent Hub's programmatic API endpoint.
    *   **How to get it**: Create any strong, secret string. You will use this in the `Authorization: Bearer <key>` header when calling `/api/mcp`.

*   `ENCRYPTION_SECRET_KEY="YOUR_32_CHARACTER_ENCRYPTION_SECRET"`
    *   **Purpose**: A **critical** secret key used to encrypt and decrypt credentials managed in the AI Agent Hub (e.g., your OpenAI API key).
    *   **How to get it**: Generate a strong, random string of at least 32 characters. This key must remain private and should be backed up securely. **Changing this key will make all previously saved credentials unreadable.**


---

### Step 2: Set Up the Database

To save workflows and view run history, you must set up the database tables in your Supabase project. **This is a one-time setup.**

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

-- Create the table for storing managed credentials
CREATE TABLE public.credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    value text NOT NULL, -- This field stores the encrypted credential payload.
    service character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT credentials_pkey PRIMARY KEY (id),
    CONSTRAINT credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT credentials_user_id_name_key UNIQUE (user_id, name)
);
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own credentials" ON public.credentials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a PostgreSQL function to securely search for a workflow by its webhook path
-- This function can be called via RPC and respects Row Level Security.
CREATE OR REPLACE FUNCTION find_workflow_by_webhook_path(path_suffix_to_find text)
RETURNS TABLE(user_id_result uuid, workflow_data_result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT w.user_id, w.workflow_data
  FROM public.workflows AS w,
       jsonb_array_elements(w.workflow_data->'nodes') AS node
  WHERE node->>'type' = 'webhookTrigger'
    AND node->'config'->>'pathSuffix' = path_suffix_to_find
  LIMIT 1;
END;
$$;
```

---

### Step 3: Configure Credentials for Live Mode

The application includes a UI-driven **Credential Manager** in the **AI Agent Hub** (under the "Credentials" tab). This is the recommended way to securely save and manage API keys and other secrets. When you create a credential with the name `MyApiKey`, you can reference it in any node configuration using the placeholder `{{credential.MyApiKey}}`.

The Agent Hub provides a **"Required Credentials Guide"** that automatically inspects all available nodes and tells you which credentials you need to add for specific integrations (e.g., `StripeApiKey` for Stripe nodes).

For local development, the system will fall back to resolving these `{{credential.NAME}}` placeholders from your `.env.local` file if a matching credential is not found in the manager. For example, if `{{credential.OpenAI_API_Key}}` is used in a node but not found in the Credential Manager for your user, the app will look for an environment variable named `OpenAI_API_Key`.

> **Credential Security**: Credentials saved via the UI are encrypted at rest in the database using AES-256-GCM. The security of your credentials depends on the strength and confidentiality of your `ENCRYPTION_SECRET_KEY` set in your environment variables. Ensure this key is kept secret and is backed up.


## Deployment Checklist

Kairo is architected to be deployed on modern hosting platforms like Netlify, Vercel, or Firebase App Hosting.

1.  **Configure Environment Variables**: This is the most critical step. Go to your hosting provider's dashboard and add all variables from the **"Core App Configuration"** section above. Add any optional variables you need as well.
2.  **Run the Database Schema SQL**: If you haven't already, you **must** run the SQL script provided in the database setup section in your production Supabase project's SQL Editor.
3.  **Confirm Build Settings**: Most platforms will detect a Next.js project automatically. Ensure the settings are:
    *   **Build Command**: `next build`
    *   **Publish Directory**: `.next`
4.  **Deploy**: Trigger the deployment from your hosting provider's dashboard.

## API & Agent Hub Details

### Live Webhook Trigger (`webhookTrigger` node)

*   **Base URL:** Live webhooks are exposed at `/api/workflow-webhooks/YOUR_PATH_SUFFIX`.
*   **Workflow Storage:** For a webhook to be triggered, the workflow containing it **must be saved** using the editor's "Save" feature.
*   **Security:** If a `securityToken` (e.g., `{{credential.MyWebhookSecret}}`) is configured, the live request must include an `X-Webhook-Token` header with the matching secret value.

### AI Agent Hub API (`/api/mcp`)

*   Send a `POST` request to `/api/mcp`.
*   Include an `Authorization` header with the value `Bearer YOUR_KAIRO_MCP_API_KEY`.
*   The request body should be a JSON object: `{ "command": "Your command for the AI" }`.

## Project Structure

-   `/src/app`: Next.js pages and API routes.
-   `/src/ai`: Genkit flows (`/flows`) and tools (`/tools`).
-   `/src/components`: Reusable React components.
-   `/src/config`: Static configuration for nodes and example workflows.
-   `/src/contexts`: React Context providers for global state.
-   `/src/services`: Server-side logic for interacting with the Supabase database.
-   `/src/types`: TypeScript type definitions.
-   `/src/lib`: Utility functions.

## Known Limitations

*   **Single Instance Deployment**: To prevent potential race conditions, deploying as a single instance is recommended.
*   **No Automated Tests**: The project does not currently include a testing framework (e.g., Jest, Playwright).

## Future Enhancements

*   **Real-time Collaboration**: Implement features for multiple users to collaborate on the same workflow in real-time.
*   **Expanded Node Library**: Continuously add new integration and utility nodes.
*   **Workflow Versioning**: Allow users to save and revert to different versions of their workflows.
*   **Team Management Features**: Introduce roles, permissions, and shared workspaces for collaborative projects.

