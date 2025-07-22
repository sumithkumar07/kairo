
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
  title: 'Kairo',
  description: 'AI-powered workflow automation and design.',
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
