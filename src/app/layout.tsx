
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AuthProvider } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils'; 
import { ThemeProvider } from '@/components/theme-provider';
import { initializeDatabase } from '@/lib/database';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans', 
});

export const metadata: Metadata = {
  title: 'Kairo AI - Workflow Automation Platform',
  description: 'Build workflows at the speed of thought with AI-powered automation, quantum computing, and enterprise-grade security.',
  keywords: 'workflow automation, AI, productivity, integration, no-code, enterprise',
  authors: [{ name: 'Kairo Team' }],
  creator: 'Kairo AI',
  publisher: 'Kairo AI',
  robots: 'index, follow',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  colorScheme: 'light dark',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kairo AI',
  },
  openGraph: {
    type: 'website',
    siteName: 'Kairo AI',
    title: 'Kairo AI - Workflow Automation Platform',
    description: 'Build workflows at the speed of thought with AI-powered automation',
    url: 'https://kairo.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kairo AI Workflow Automation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairo AI - Workflow Automation Platform',
    description: 'Build workflows at the speed of thought with AI-powered automation',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize database on server start
  if (typeof window === 'undefined') {
    initializeDatabase().catch(console.error);
  }

  return (
    <html lang="en" suppressHydrationWarning={true}> 
      <head>
        <script src="https://js.puter.com/v2/" defer></script>
      </head>
      <body className={cn("font-sans antialiased", inter.variable, "bg-background text-foreground")} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SubscriptionProvider>
              {children}
              <Toaster />
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
