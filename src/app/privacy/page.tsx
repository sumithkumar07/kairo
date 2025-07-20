'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Your Privacy Matters</CardTitle>
              <CardDescription>
                This Privacy Policy describes how Kairo collects, uses, and protects your information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-sm leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Account Information</h3>
                    <p>When you create an account, we collect your email address, name, and encrypted password.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Usage Data</h3>
                    <p>We collect information about how you use Kairo, including workflow creation, execution logs, and feature usage.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Technical Information</h3>
                    <p>We automatically collect device information, IP addresses, browser type, and operating system for security and optimization.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide and maintain the Kairo service</li>
                  <li>Process your workflows and automations</li>
                  <li>Send important service notifications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Provide customer support</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">3. Data Security</h2>
                <p className="text-muted-foreground mb-3">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure data centers with 24/7 monitoring</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and employee background checks</li>
                  <li>SOC 2 Type II compliance (in progress)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">4. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-3">
                  We do not sell, trade, or rent your personal information. We may share information only in these circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>With your explicit consent</li>
                  <li>To provide services you requested (e.g., third-party integrations)</li>
                  <li>With trusted service providers under strict confidentiality agreements</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In case of merger, acquisition, or sale of assets (with notice)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">5. Third-Party Integrations</h2>
                <p className="text-muted-foreground">
                  When you connect third-party services (like Salesforce, Slack, etc.) to Kairo, we only access the specific data 
                  necessary for your workflows. We use OAuth protocols and never store your credentials for these services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">6. AI and Data Processing</h2>
                <p className="text-muted-foreground">
                  We use Mistral AI for workflow generation and optimization. Your workflow descriptions may be processed by AI services, 
                  but we ensure that personal and sensitive data is filtered out before processing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">7. Your Rights and Choices</h2>
                <p className="text-muted-foreground mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data</li>
                  <li>Object to processing for marketing purposes</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">8. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your data only as long as necessary to provide services or as required by law. 
                  Workflow data is typically retained for 90 days after account deletion unless you request immediate deletion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">9. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your data may be processed in countries other than your own. We ensure adequate protection through 
                  standard contractual clauses and appropriate safeguards.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">10. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use essential cookies for authentication and site functionality. We also use analytics cookies 
                  to understand how you use Kairo and improve our service. You can manage cookie preferences in your browser.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">11. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Kairo is not intended for users under 13 years of age. We do not knowingly collect personal information 
                  from children under 13. If you believe we have collected such information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">12. Changes to Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy periodically. We will notify you of significant changes via email 
                  or through the platform. Your continued use constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 text-foreground">13. Contact Us</h2>
                <p className="text-muted-foreground mb-3">
                  If you have questions about this Privacy Policy or want to exercise your rights, contact us:
                </p>
                <div className="text-muted-foreground">
                  <p>Email: kairoaihelp@gmail.com</p>
                  <p>Website: <Link href="/" className="text-primary hover:underline">Kairo Platform</Link></p>
                </div>
                <p className="text-muted-foreground mt-3">
                  We will respond to your requests within 30 days.
                </p>
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