import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Network Notifier',
  description: 'Stay informed about your network status',
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
  },
  openGraph: {
    title: 'Network Notifier',
    description: 'Stay informed about your network status',
    url: 'https://v0-network-notifier-redesign.vercel.app',
    siteName: 'Network Notifier',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Network Notifier',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Network Notifier',
    description: 'Stay informed about your network status',
    images: ['/og-image.png'],
  },
}

import { StoreProvider } from '@/lib/store/StoreProvider'

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style dangerouslySetInnerHTML={{
          __html: `
          input, textarea, select {
            font-size: 16px !important; /* Prevents iOS zoom */
          }
          /* Additional zoom prevention */
          @media screen and (-webkit-min-device-pixel-ratio:0) { 
            select,
            textarea,
            input {
              font-size: 16px !important;
            }
          }
        `}} />
      </head>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
      <Script id="prevent-zoom" strategy="afterInteractive">
        {`
          // Prevent zoom on double tap
          document.addEventListener('touchend', function(event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
              event.preventDefault();
              event.target.focus();
            }
          }, false);
        `}
      </Script>
    </html>
  )
}
