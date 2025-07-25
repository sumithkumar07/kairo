'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const endpoints = [
  {
    method: 'POST',
    path: '/api/workflows/run',
    description: 'Execute a workflow with input data',
    auth: 'Bearer Token',
    example: {
      request: `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/workflows/run" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "workflow_123",
    "input": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'`,
      response: `{
  "id": "run_456",
  "status": "completed",
  "result": {
    "success": true,
    "output": {
      "message": "Email sent successfully"
    }
  },
  "executionTime": 1250
}`
    }
  },
  {
    method: 'GET',
    path: '/api/workflows',
    description: 'List all workflows in your account',
    auth: 'Bearer Token',
    example: {
      request: `curl -X GET "${typeof window !== 'undefined' ? window.location.origin : ''}/api/workflows" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "workflows": [
    {
      "id": "workflow_123",
      "name": "Welcome Email Sequence",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 1
}`
    }
  },
  {
    method: 'POST',
    path: '/api/agent-hub',
    description: 'Send commands to AI agent for workflow generation',
    auth: 'Bearer Token',
    example: {
      request: `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/agent-hub" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "command": "Create a workflow that sends me weather updates every morning"
  }'`,
      response: `{
  "id": "cmd_789",
  "response": "I'll create a weather notification workflow for you...",
  "workflowGenerated": true,
  "workflowId": "workflow_new_123"
}`
    }
  }
];

const sdks = [
  {
    language: 'JavaScript',
    icon: '🟨',
    install: 'npm install @kairo/sdk',
    example: `import { KairoClient } from '@kairo/sdk';

const kairo = new KairoClient({
  apiKey: process.env.KAIRO_API_KEY
});

// Run a workflow
const result = await kairo.workflows.run('workflow_123', {
  name: 'John Doe',
  email: 'john@example.com'
});

console.log(result);`
  },
  {
    language: 'Python',
    icon: '🐍',
    install: 'pip install kairo-sdk',
    example: `from kairo import KairoClient

client = KairoClient(api_key="your_api_key")

# Run a workflow
result = client.workflows.run(
    workflow_id="workflow_123",
    input={
        "name": "John Doe",
        "email": "john@example.com"
    }
)

print(result)`
  },
  {
    language: 'Go',
    icon: '🐹',
    install: 'go get github.com/kairo/go-sdk',
    example: `package main

import (
    "github.com/kairo/go-sdk"
)

func main() {
    client := kairo.NewClient("your_api_key")
    
    result, err := client.Workflows.Run("workflow_123", map[string]interface{}{
        "name":  "John Doe",
        "email": "john@example.com",
    })
    
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println(result)
}`
  }
];

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Kairo</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/pricing" className="hover:text-primary">Pricing</Link>
            <Link href="/help" className="hover:text-primary">Help</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/login" className="hover:text-primary">Log In</Link>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            API Documentation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build powerful automations with our REST API and SDKs
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="#quickstart">Quick Start</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Get API Key</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quickstart" className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Key className="h-6 w-6 text-primary" />
                  <CardTitle>1. Get Your API Key</CardTitle>
                </div>
                <CardDescription>
                  Generate an API key from your dashboard to authenticate requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <code className="text-sm">
                    Authorization: Bearer your_api_key_here
                  </code>
                </div>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard">Generate API Key</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Play className="h-6 w-6 text-primary" />
                  <CardTitle>2. Make Your First Request</CardTitle>
                </div>
                <CardDescription>
                  Test the API with a simple workflow execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto">
                  <div className="text-green-600"># Test API connection</div>
                  <div>curl -H "Authorization: Bearer YOUR_KEY" \</div>
                  <div className="ml-4">{typeof window !== 'undefined' ? window.location.origin : ''}/api/workflows</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">API Reference</h2>
          
          <Tabs defaultValue="endpoints" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="sdks">SDKs</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="endpoints" className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Requires: {endpoint.auth}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="request" className="w-full">
                      <TabsList>
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                      </TabsList>
                      <TabsContent value="request">
                        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {endpoint.example.request}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="response">
                        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {endpoint.example.response}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="sdks" className="space-y-6">
              {sdks.map((sdk, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sdk.icon}</span>
                      <CardTitle>{sdk.language}</CardTitle>
                    </div>
                    <CardDescription>
                      Official SDK for {sdk.language} applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Installation</h4>
                        <div className="bg-muted rounded-lg p-3">
                          <code className="text-sm">{sdk.install}</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Example Usage</h4>
                        <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {sdk.example}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Webhook className="h-6 w-6 text-primary" />
                    <CardTitle>Webhook Events</CardTitle>
                  </div>
                  <CardDescription>
                    Receive real-time notifications about workflow events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Event Types</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code>workflow.completed</code> - Workflow execution finished
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code>workflow.failed</code> - Workflow execution failed
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code>workflow.started</code> - Workflow execution started
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Webhook Payload</h4>
                      <div className="bg-muted rounded-lg p-4">
                        <pre className="text-sm font-mono whitespace-pre-wrap">{`{
  "event": "workflow.completed",
  "workflowId": "workflow_123",
  "runId": "run_456",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "status": "success",
    "executionTime": 1250,
    "output": {...}
  }
}`}</pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-8">
            Our developer support team is here to help you integrate successfully
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">View Guides</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Kairo</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
              <Link href="/contact" className="hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}