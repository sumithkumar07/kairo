'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Home } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex flex-col flex-1 items-center justify-center p-4 bg-muted/40 dot-grid-background">
        <Card className="w-full max-w-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:scale-[1.01] bg-card">
          <CardHeader className="text-center border-b pb-6">
            <div className="p-4 bg-primary/10 rounded-full inline-block mb-4 mx-auto">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Contact Us</CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-1">
              We&apos;d love to hear from you!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-8 text-center">
            <p className="text-muted-foreground leading-relaxed">
              For support, feedback, sales inquiries, or custom integration requests, please don&apos;t hesitate to reach out. We&apos;d love to hear from you!
            </p>
            
            <Button asChild size="lg" className="w-full">
              <a href="mailto:kairoaihelp@gmail.com">
                <Mail className="mr-2 h-5 w-5" /> Email Our Team
              </a>
            </Button>
            
            <p className="text-xs text-muted-foreground pt-4">
              We aim to respond within 24-48 business hours.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-4 border-t pt-6">
            <Button asChild variant="outline" className="w-full group">
              <Link href="/">
                <Home className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  );
}
