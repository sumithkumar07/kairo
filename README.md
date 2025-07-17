
# Kairo - AI Workflow Automation Platform

Kairo is a comprehensive AI-powered workflow automation platform that implements the CARES framework for trustworthy AI automation. Built with Next.js 15, it provides a professional workflow editor with advanced features including real-time collaboration, explainable AI decisions, self-healing data, and comprehensive ROI tracking.

## 🎯 Key Features

### CARES Framework Implementation
- **✅ Comprehensive Explainability**: AI decision tracking with confidence indicators, reasoning explanations, and risk assessment
- **✅ Human-AI Collaboration**: Real-time review requests, escalation triggers, and collaborative workflows
- **✅ Self-Healing Data**: Automatic data validation, duplicate detection, and cross-system lookups
- **✅ Resilient Integration**: Retry logic, error handling, and webhook notifications
- **✅ Dynamic Exception Handling**: Error recovery strategies and alternative execution paths
- **✅ Adoption Boosters**: AI-powered workflow generation and intelligent suggestions
- **✅ Ethical Safeguards**: Role-based access control and audit trails
- **✅ ROI Transparency**: Time saved calculations, cost analysis, and performance metrics

### Advanced Workflow Editor
- **Professional Canvas**: Zoom, pan, minimap, grid snapping, and alignment guides
- **Multi-select Operations**: Box selection, keyboard shortcuts, bulk operations
- **Real-time Collaboration**: Multi-user editing, presence indicators, and comment system
- **Performance Monitoring**: Real-time metrics, bottleneck detection, and optimization recommendations
- **30+ Pre-built Nodes**: Comprehensive library of integrations and actions

### AI-First Architecture
- **Mistral AI Integration**: Advanced reasoning capabilities for complex workflows
- **Google AI (Genkit)**: Workflow generation and intelligent assistance
- **Context-aware Assistant**: Smart suggestions and error diagnosis
- **Natural Language Processing**: Generate workflows from plain English descriptions

## Technology Stack

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS with Radix UI components
*   **AI**: Mistral AI + Google AI (Genkit)
*   **Database & Auth**: Supabase with Row Level Security
*   **Deployment**: Vercel, Firebase App Hosting, Netlify

---

## Local Development Setup

Follow these steps to get a local instance of Kairo running.

### 1. Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Git client (like `git`)

### 2. Clone & Install

```bash
git clone https://github.com/your-repo/kairo.git
cd kairo
npm install
```

### 3. Environment & Database Setup (Crucial)

This is the most important section for getting Kairo running. You **must** configure your environment variables and set up the database schema.

#### **Step 3a: Create Environment File**

Create a file named `.env.local` in the root of your project by copying the `.env` file. You must fill in the following core variables.

*   `NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"`
    *   **Purpose**: Connects to your Supabase project for user accounts and data storage.
    *   **How to get it**: In your Supabase dashboard, go to "Project Settings" > "API".

*   `NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"`
    *   **Purpose**: Public key for client-side interaction with Supabase.
    *   **How to get it**: Found on the same "API" page in your Supabase dashboard.

*   `GOOGLE_API_KEY="YOUR_GOOGLE_CLOUD_API_KEY"`
    *   **Purpose**: Powers all Google AI features (workflow generation, assistant chat, etc.).
    *   **How to get it**: In the Google Cloud Console, create a project, enable the "AI Platform" and "Vertex AI" APIs, and create an API key under "APIs & Services" > "Credentials".

*   `ENCRYPTION_SECRET_KEY="YOUR_32_CHARACTER_ENCRYPTION_SECRET"`
    *   **Purpose**: A **critical** secret key used to encrypt and decrypt credentials managed in the AI Agent Hub (e.g., your OpenAI API key).
    *   **How to get it**: Generate a strong, random string of at least 32 characters. This key must remain private and should be backed up securely. **Changing this key will make all previously saved credentials unreadable.**

*   `SCHEDULER_SECRET_KEY="A_DIFFERENT_SECRET_API_KEY"`
    *   **Purpose**: A secret key to protect the scheduler endpoint (`/api/scheduler/run`), which triggers scheduled workflows.
    *   **How to get it**: Create another strong, secret string, different from your other keys.

#### **Step 3b: Set Up the Database**

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

-- Create a table for user-specific API keys
CREATE TABLE public.user_api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash text NOT NULL UNIQUE,
    prefix text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_used_at timestamptz
);
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own API keys" ON public.user_api_keys FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a function to find a user by their API key hash
CREATE OR REPLACE FUNCTION public.find_user_by_api_key(p_key_hash text)
RETURNS uuid AS $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT user_id INTO v_user_id
    FROM public.user_api_keys
    WHERE key_hash = p_key_hash;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a PostgreSQL function to securely search for a workflow by its webhook path
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

-- Create tables for tracking usage stats
CREATE TABLE public.workflow_runs_monthly (
    user_id uuid NOT NULL,
    year_month text NOT NULL,
    run_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT workflow_runs_monthly_pkey PRIMARY KEY (user_id, year_month),
    CONSTRAINT workflow_runs_monthly_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.workflow_runs_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own run counts" ON public.workflow_runs_monthly FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_generations_monthly (
    user_id uuid NOT NULL,
    year_month text NOT NULL,
    generation_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT ai_generations_monthly_pkey PRIMARY KEY (user_id, year_month),
    CONSTRAINT ai_generations_monthly_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.ai_generations_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own generation counts" ON public.ai_generations_monthly FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create the table for storing user subscription info
CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    subscription_tier text DEFAULT 'Free'::text NOT NULL,
    trial_end_date timestamp with time zone,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Create RPC functions to atomically increment monthly counts
CREATE OR REPLACE FUNCTION increment_run_count(p_user_id uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO public.workflow_runs_monthly (user_id, year_month, run_count)
    VALUES (p_user_id, to_char(CURRENT_DATE, 'YYYY-MM'), 1)
    ON CONFLICT (user_id, year_month)
    DO UPDATE SET run_count = workflow_runs_monthly.run_count + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_generation_count(p_user_id uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO public.ai_generations_monthly (user_id, year_month, generation_count)
    VALUES (p_user_id, to_char(CURRENT_DATE, 'YYYY-MM'), 1)
    ON CONFLICT (user_id, year_month)
    DO UPDATE SET generation_count = ai_generations_monthly.generation_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Add a function and trigger to automatically create a user profile on signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, trial_end_date)
  VALUES (new.id, now() + interval '15 days');
  return new;
END;
$$ language plpgsql security definer;

-- Drop the trigger if it exists to ensure a clean setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that calls the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

### 4. Run Development Server

You are now ready to start the local development server.

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`. The main workflow editor is at `/workflow`.

---

## Deployment Guide

Kairo is architected to be deployed on modern hosting platforms like **Vercel**, **Firebase App Hosting**, or **Netlify**.

### Option 1: Vercel (Recommended)

1.  **Push to GitHub:** Make sure your latest code is pushed to a GitHub repository.
2.  **Import Project:** Sign up for an account on [Vercel](https://vercel.com) and import your Kairo Git repository. The Next.js framework will be automatically detected.
3.  **Configure Environment Variables:** In your project settings on Vercel, navigate to the **Environment Variables** section. Add all the variables from your local `.env.local` file.
4.  **Deploy:** Click the **"Deploy"** button. Your application will be built and deployed. Vercel will automatically provide a public URL.

### Option 2: Firebase App Hosting

1.  **Push to GitHub:** Ensure your latest code is pushed to a GitHub repository.
2.  **Create Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
3.  **Enable App Hosting:** In your project, navigate to the "Build" section and select "App Hosting". Click "Get Started".
4.  **Connect GitHub:** Follow the prompts to connect your GitHub account and select your Kairo repository.
5.  **Configure Backend:** In the App Hosting dashboard for your backend, navigate to the **Settings** tab.
6.  **Add Secret Variables:** This is the most important step. Add all the environment variables from your local `.env.local` file as **Secrets** in the App Hosting settings.
7.  **Deploy:** Once the secrets are saved, new pushes to your main branch will automatically trigger a new build and deployment.

### Option 3: Netlify

1.  **Push to GitHub:** Push your project code to a GitHub, GitLab, or Bitbucket repository.
2.  **Import Project:** Sign up for an account on [Netlify](https://www.netlify.com/) and import your Kairo Git repository. The Next.js framework will be automatically detected.
3.  **Configure Environment Variables:** In your project settings on the Netlify platform, navigate to the **Environment Variables** section. Add all the variables from your local `.env.local` file.
4.  **Deploy:** Click the **"Deploy"** button. Your application will be built and deployed.

---

### Post-Deployment: Configure the Scheduler (Optional)

If you use the `schedule` node to run workflows automatically, you must set up an external service to trigger it.

1.  Use a service like **Vercel Cron Jobs**, **Google Cloud Scheduler**, or a free service like **EasyCron**.
2.  Create a job that runs at your desired frequency (e.g., every minute or every 5 minutes).
3.  The job must send a `POST` request to: `YOUR_DEPLOYED_URL/api/scheduler/run`
4.  The request **MUST** include the following header: `Authorization: Bearer YOUR_SCHEDULER_SECRET_KEY` (using the key you set in your environment variables).
