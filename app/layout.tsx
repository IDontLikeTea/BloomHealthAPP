import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';
import { FeedbackButton } from '@/components/ui/feedback-button';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  return {
    title: 'Bloom — Health Tracker',
    description: 'Track your nutrition, stay hydrated, and get AI-powered insights for a healthier you.',
    metadataBase: new URL(baseUrl),
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    openGraph: {
      title: 'Bloom — Health Tracker',
      description: 'Track your nutrition, stay hydrated, and get AI-powered insights.',
      images: ['/og-image.png'],
      type: 'website',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className="font-sans antialiased min-h-screen bg-gray-50">
        <Providers>
          {children}
          <MobileBottomNav />
          <FeedbackButton />
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
