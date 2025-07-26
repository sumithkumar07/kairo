'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info, ExternalLink } from 'lucide-react';

interface RedirectComponentProps {
  to: string;
  tab?: string;
  title: string;
  description: string;
  delay?: number;
  reason?: string;
}

export function RedirectComponent({ 
  to, 
  tab, 
  title, 
  description, 
  delay = 3000, 
  reason = "This page has been moved to provide a better user experience" 
}: RedirectComponentProps) {
  const router = useRouter();
  
  const targetUrl = tab ? `${to}?tab=${tab}` : to;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(targetUrl);
    }, delay);

    return () => clearTimeout(timer);
  }, [router, targetUrl, delay]);

  const handleRedirectNow = () => {
    router.push(targetUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="p-4 bg-gradient-to-r from-primary to-purple-600 rounded-full inline-block mx-auto mb-4">
            <ArrowRight className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Page Moved</CardTitle>
          <CardDescription className="text-base">
            {reason}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="px-4 py-2">
              <Info className="h-4 w-4 mr-2" />
              Redirecting in {delay / 1000} seconds
            </Badge>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">New location:</p>
              <code className="text-sm bg-background px-2 py-1 rounded border">
                {targetUrl}
              </code>
            </div>
          </div>
          
          <Button 
            onClick={handleRedirectNow}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            size="lg"
          >
            Go There Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            You will be automatically redirected shortly. Update your bookmarks to the new location.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}