'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Home, ArrowLeft } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Agreement to Terms</CardTitle>
              <CardDescription>
                Please read these Terms of Service carefully before using Kairo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-sm leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Kairo ("Service", "Platform"), operated by Kairo Technologies ("Company", "we", "us", or "our"), 
                  you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
                <p className="text-muted-foreground mb-3">
                  Kairo is an AI-powered workflow automation platform that enables users to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Create and manage automated workflows</li>
                  <li>Integrate with third-party services and APIs</li>
                  <li>Generate workflows using AI assistance</li>
                  <li>Monitor and analyze workflow performance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
                <p className="text-muted-foreground mb-3">
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">4. Subscription Plans and Billing</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Free Plan:</strong> Access to basic features with usage limitations.</p>
                  <p><strong>Gold Plan ($9/month):</strong> Enhanced features with higher usage limits.</p>
                  <p><strong>Diamond Plan ($19/month):</strong> Premium features with unlimited usage.</p>
                  <p>All subscriptions automatically renew unless cancelled. You may cancel at any time through your account settings.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">5. Acceptable Use Policy</h2>
                <p className="text-muted-foreground mb-3">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit malicious code or conduct security attacks</li>
                  <li>Spam, harass, or abuse other users</li>
                  <li>Attempt to reverse engineer the platform</li>
                  <li>Use the service for illegal or unauthorized purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">6. Data and Privacy</h2>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                  to understand our practices regarding the collection, use, and disclosure of your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">7. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The Service and its original content, features, and functionality are owned by Kairo Technologies and are protected by 
                  international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall Kairo Technologies, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                  be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                  loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">9. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                  under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                  we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">11. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-3 text-muted-foreground">
                  <p>Email: kairoaihelp@gmail.com</p>
                  <p>Website: <Link href="/" className="text-primary hover:underline">Kairo Platform</Link></p>
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign Up
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}