import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'ShareParks — חניה שיתופית חכמה',
  description: 'מצא חניה פנויה ליד הבית או השכר את החניה שלך וצור הכנסה פסיבית. ShareParks — הדרך החכמה לחנות.',
  metadataBase: new URL('https://shareparks.com'),
  openGraph: {
    title: 'ShareParks — חניה שיתופית חכמה',
    description: 'מצא חניה פנויה ברגע או השכר את שלך.',
    siteName: 'ShareParks',
    locale: 'he_IL',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#374151',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="bg-white text-black antialiased" suppressHydrationWarning>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}} />
      </body>
    </html>
  );
}
