
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
4.  Set up your environment variables by creating a `.env.local` file (refer to `.env.example` if provided, or configure based on `src/app/actions.ts` for database/email if using live mode).
5.  Run the development server: `npm run dev` or `yarn dev`.
6.  Open [http://localhost:9002](http://localhost:9002) (or your configured port) in your browser.

The main workflow editor is accessible at the `/workflow` route. Explore the homepage for an overview and navigation links.
