import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/query-provider';
import { Header } from '@/components/header';
import { AuthProvider } from '@/contexts/auth-context';
import { RealtimeProvider } from '@/contexts/realtime-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Masterlist - Project Management & Analytics',
  description: 'A comprehensive project management and analytics platform',
  keywords: ['project management', 'analytics', 'insights', 'collaboration'],
  authors: [{ name: 'Masterlist Team' }],
  openGraph: {
    title: 'Masterlist - Project Management & Analytics',
    description: 'A comprehensive project management and analytics platform',
    type: 'website',
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
      </body>
    </html>
  );
}