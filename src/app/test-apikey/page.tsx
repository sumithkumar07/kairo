
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Workflow, AlertTriangle } from 'lucide-react';

export default function TestApiKeyPageRemoved() {
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
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <CardTitle className="text-2xl">Feature Removed</CardTitle>
            <CardDescription className="text-sm">
              This developer utility page has been removed from the main application to streamline the user experience.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6 text-center">
             <p className="text-sm text-muted-foreground">
              Please use the main application features.
            </p>
            <Button asChild>
              <Link href="/workflow">
                 <Workflow className="mr-2 h-4 w-4" /> Go to Workflow Editor
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
