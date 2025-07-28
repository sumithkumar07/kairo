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
  preload: true,
  adjustFontFallback: false, 
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kairo.ai'),
  title: {
    default: 'Kairo AI - Build Workflows at the Speed of Thought',
    template: '%s | Kairo AI'
  },
  description: 'The world\'s most advanced AI-powered workflow automation platform. Build, deploy, and scale intelligent automations with quantum computing capabilities and enterprise-grade security.',
  keywords: [
    'workflow automation',
    'AI automation', 
    'productivity tools',
    'integration platform',
    'no-code automation',
    'enterprise automation',
    'puter.js',
    'quantum computing',
    'business process automation',
    'workflow builder'
  ],
  authors: [{ name: 'Kairo AI Team', url: 'https://kairo.ai' }],
  creator: 'Kairo AI',
  publisher: 'Kairo AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  colorScheme: 'light dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
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
      {
        url: '/icons/icon-512x512.png', 
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kairo AI',
    title: 'Kairo AI - Build Workflows at the Speed of Thought',
    description: 'The world\'s most advanced AI-powered workflow automation platform with quantum computing capabilities. Transform your business with intelligent automation.',
    url: 'https://kairo.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kairo AI Workflow Automation Platform - Build workflows at the speed of thought with AI-powered automation',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Kairo AI Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@KairoAI',
    creator: '@KairoAI',
    title: 'Kairo AI - Workflow Automation Platform',
    description: 'Build workflows at the speed of thought with AI-powered automation and quantum computing capabilities.',
    images: {
      url: '/og-image.png',
      alt: 'Kairo AI Platform - AI-powered workflow automation',
    },
  },
  alternates: {
    canonical: 'https://kairo.ai',
    languages: {
      'en-US': 'https://kairo.ai',
      'x-default': 'https://kairo.ai',
    },
  },
  category: 'technology',
  classification: 'Business Software',
  other: {
    'google-site-verification': 'your-google-verification-code',
    'msvalidate.01': 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize database on server start with error handling
  if (typeof window === 'undefined') {
    initializeDatabase().catch((error) => {
      console.error('[LAYOUT] Database initialization failed:', error);
      // Continue execution - don't block the app
    });
  }

  return (
    <html lang="en" suppressHydrationWarning={true}> 
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kairo AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Enhanced PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://js.puter.com" />
        <link rel="dns-prefetch" href="https://js.puter.com" />
        
        {/* Load Puter.js with enhanced error handling */}
        <script 
          src="https://js.puter.com/v2/" 
          defer 
          onError="console.warn('Failed to load Puter.js - AI features may be limited')"
        />
        
        {/* Enhanced Progressive Web App Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                  })
                    .then(function(registration) {
                      console.log('[SW] Registration successful:', registration.scope);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', () => {
                        console.log('[SW] Update found, installing new version...');
                      });
                    })
                    .catch(function(registrationError) {
                      console.warn('[SW] Registration failed:', registrationError);
                    });
                });
              }
              
              // Enhanced error tracking
              window.addEventListener('error', function(e) {
                console.error('[Global Error]:', e.error);
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('[Unhandled Promise Rejection]:', e.reason);
              });
              
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', () => {
                  setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('[Performance] Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                    }
                  }, 0);
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