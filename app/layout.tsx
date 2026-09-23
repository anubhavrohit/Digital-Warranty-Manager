import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'WarrantyVault - Digital Warranty Manager & Bill Tracker',
  description: 'Keep your products, purchase details, bills and warranty dates organized in one simple digital vault.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-cream text-forest font-sans antialiased selection:bg-sunshine selection:text-forest">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
