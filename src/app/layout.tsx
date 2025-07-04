
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils'; 
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ 
  subsets: ['latin'],
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
  return (
    <html lang="en" suppressHydrationWarning={true}> 
      <body className={cn("font-sans antialiased", inter.variable, "bg-background text-foreground")} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SubscriptionProvider>
            {children}
            <Toaster />
          </SubscriptionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
