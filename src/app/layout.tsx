import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Goat Beard - Gubernatorial Transgression Tracker',
  description: 'Evidence platform tracking gubernatorial transgressions in India (1951-present). A goat\'s beard is as worthless as a state\'s governor.',
  metadataBase: new URL('https://goatbeards.jdlabs.top'),
  openGraph: {
    title: 'Goat Beard Governors',
    description: 'Track gubernatorial transgressions in India since 1951. 50+ incidents, 33+ governors documented.',
    url: 'https://goatbeards.jdlabs.top',
    siteName: 'Goat Beard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Goat Beard - Gubernatorial Transgression Tracker',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goat Beard Governors',
    description: 'Track gubernatorial transgressions in India since 1951',
    images: ['/og-image.png'],
    creator: '@1nimit',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
