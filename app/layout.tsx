import type { Metadata } from 'next';
import './globals.css';
import CosmicBadge from '@/components/CosmicBadge';

export const metadata: Metadata = {
  title: 'Pocket Dicemancer',
  description: 'A turn-based dice battler with inventory management, color matching combos, and Yahtzee-style rerolling. Powered by Cosmic CMS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className="font-sans min-h-screen">
        {children}
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  );
}