import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/query-provider';
import { Header } from '@/components/header';
import { AuthProvider } from '@/contexts/auth-context';
import { RealtimeProvider } from '@/contexts/realtime-context';
import { ErrorBoundary } from '@/components/error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Masterlist',
    default: 'Masterlist - AI-Powered Project Management & Analytics Platform',
  },
  description: 'Transform your project management with AI-powered insights, comprehensive analytics, and intelligent automation. Build, deploy, and optimize projects with data-driven decisions.',
  keywords: [
    'project management',
    'AI analytics',
    'business intelligence',
    'project insights',
    'automation',
    'data analytics',
    'project tracking',
    'team collaboration',
    'deployment automation',
    'project optimization'
  ],
  authors: [{ name: 'Masterlist Team' }],
  creator: 'Masterlist Team',
  publisher: 'Masterlist',
  
  // Open Graph
  openGraph: {
    title: 'Masterlist - AI-Powered Project Management & Analytics',
    description: 'Transform your project management with AI-powered insights, comprehensive analytics, and intelligent automation.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Masterlist',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Masterlist - AI-Powered Project Management Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@masterlist',
    creator: '@masterlist',
    title: 'Masterlist - AI-Powered Project Management',
    description: 'Transform your project management with AI-powered insights and analytics.',
    images: ['/images/og-image.png'],
  },

  // Robots
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

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },

  // Alternate languages
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Additional metadata
  category: 'Technology',
  classification: 'Project Management Software',
  
  // App metadata
  applicationName: 'Masterlist',
  referrer: 'origin-when-cross-origin',
  
  // Format detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                <RealtimeProvider>
                  <div className="relative flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <footer className="border-t">
                      <div className="container flex h-16 items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          © 2024 Masterlist. All rights reserved.
                        </p>
                      </div>
                    </footer>
                  </div>
                </RealtimeProvider>
              </AuthProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}