
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils'; // Import cn

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
    // Default to dark theme by not adding .light class
    <html lang="en" suppressHydrationWarning={true} className=""> 
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "bg-background text-foreground")} suppressHydrationWarning={true}>
        <SubscriptionProvider>
          {children}
          <Toaster />
        </SubscriptionProvider>
      </body>
    </html>
  );
}
