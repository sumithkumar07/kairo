
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AuthProvider } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils'; 
import { ThemeProvider } from '@/components/theme-provider';
import { initializeDatabase } from '@/lib/database';
import ErrorBoundary from '@/components/error-boundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans', 
});

export const metadata: Metadata = {
  title: {
    default: 'Kairo AI - Workflow Automation Platform',
    template: '%s | Kairo AI'
  },
  description: 'Build workflows at the speed of thought with AI-powered automation, quantum computing, and enterprise-grade security.',
  keywords: ['workflow automation', 'AI', 'productivity', 'integration', 'no-code', 'enterprise', 'puter.js', 'quantum'],
  authors: [{ name: 'Kairo Team', url: 'https://kairo.ai' }],
  creator: 'Kairo AI',
  publisher: 'Kairo AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
  colorScheme: 'light dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kairo AI',
    startupImage: [
      {
        url: '/icons/icon-192x192.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kairo AI',
    title: 'Kairo AI - Build Workflows at the Speed of Thought',
    description: 'The world\'s most advanced AI-powered workflow automation platform with quantum computing capabilities.',
    url: 'https://kairo.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kairo AI Workflow Automation Platform - Build workflows at the speed of thought',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@KairoAI',
    creator: '@KairoAI',
    title: 'Kairo AI - Workflow Automation Platform',
    description: 'Build workflows at the speed of thought with AI-powered automation and quantum computing.',
    images: {
      url: '/og-image.png',
      alt: 'Kairo AI Platform',
    },
  },
  alternates: {
    canonical: 'https://kairo.ai',
  },
  category: 'technology',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kairo AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        
        <script src="https://js.puter.com/v2/" defer></script>
        
        {/* Progressive Web App Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={cn("font-sans antialiased", inter.variable, "bg-background text-foreground")} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <SubscriptionProvider>
                {children}
                <Toaster />
              </SubscriptionProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
