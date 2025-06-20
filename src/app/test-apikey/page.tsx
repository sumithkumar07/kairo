
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { testApiKeyAction } from '@/app/actions';
import Link from 'next/link';
import { Workflow, KeyRound, Loader2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import type { TestApiKeyOutput } from '@/ai/flows/test-api-key-flow';

export default function TestApiKeyPage() {
  const [testResult, setTestResult] = useState<TestApiKeyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestApiKey = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const result = await testApiKeyAction();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Client-side error calling test action: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav>
            <Button variant="ghost" asChild>
              <Link href="/workflow">
                Workflow Editor
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center border-b pb-4">
            <KeyRound className="h-12 w-12 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl">Test Google API Key</CardTitle>
            <CardDescription className="text-sm">
              Verify if your <code className="bg-muted px-1 py-0.5 rounded-sm">GOOGLE_API_KEY</code> is working correctly with Genkit.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Click the button below to make a simple AI call. Check your server console for detailed logs, including API key presence.
            </p>
            <Button onClick={handleTestApiKey} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Testing...' : 'Run API Key Test'}
            </Button>

            {testResult && (
              <div className={`mt-6 p-4 rounded-md border ${testResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <div className="flex items-start space-x-3">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-destructive-foreground dark:text-destructive'}`}>
                      {testResult.message}
                    </p>
                    {testResult.data && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        AI Response: <span className="font-mono bg-muted/50 px-1 py-0.5 rounded-sm">{testResult.data}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
             <p className="text-xs text-muted-foreground text-center pt-2">
              Remember to check the <code className="bg-muted px-1 py-0.5 rounded-sm">[ASSISTANT CHAT FLOW] GOOGLE_API_KEY check</code> and <code className="bg-muted px-1 py-0.5 rounded-sm">[SERVER ACTION - testApiKeyAction] GOOGLE_API_KEY check</code> logs in your server console.
            </p>
          </CardContent>
          
          <CardFooter className="border-t pt-6">
            <Button asChild variant="outline" className="w-full group">
              <Link href="/">
                <ExternalLink className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
        </p>
      </footer>
    </div>
  );
}
