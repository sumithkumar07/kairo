
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, Mail, Home } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';

export default function ContactPage() {
  return (
    <AppLayout>
      <div className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out hover:scale-[1.01]">
          <CardHeader className="text-center border-b pb-6">
            <Mail className="h-16 w-16 text-primary mx-auto mb-4 p-2 bg-primary/10 rounded-full" />
            <CardTitle className="text-3xl">Contact Kairo</CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-1">
              We&apos;d love to hear from you!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-8 text-center">
            <p className="text-muted-foreground leading-relaxed">
              For support, feedback, inquiries about enterprise plans, or custom integration requests, please don&apos;t hesitate to reach out to our team.
            </p>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">General Inquiries & Support:</p>
              <a 
                href="mailto:support@kairo.example.com" 
                className="text-lg font-semibold text-primary hover:underline"
              >
                support@kairo.example.com
              </a>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Sales & Enterprise:</p>
              <a 
                href="mailto:sales@kairo.example.com" 
                className="text-lg font-semibold text-primary hover:underline"
              >
                sales@kairo.example.com
              </a>
            </div>
            
            <p className="text-xs text-muted-foreground pt-4">
              We typically respond within 24-48 business hours.
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
      </div>
    </AppLayout>
  );
}

    