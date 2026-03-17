import { Toaster } from 'react-hot-toast'
import InitStore from '@/components/InitStore'
import './globals.css'

export const metadata = {
  // ── Basic ────────────────────────────────────────────────
  title:       'BazaarSathi — Fresh Groceries Delivered Fast',
  description: 'Shop fresh vegetables, fruits, dairy, snacks and daily essentials. Best prices with cash on delivery.',

  // ── Keywords ─────────────────────────────────────────────
  keywords: [
    'online grocery',
    'fresh vegetables',
    'fruits delivery',
    'dairy products',
    'daily essentials',
    'cash on delivery',
    'bazaarsathi',
  ],

  // ── Author ───────────────────────────────────────────────
  authors: [{ name: 'BazaarSathi' }],
  creator: 'BazaarSathi',

  // ── Favicon ──────────────────────────────────────────────
  icons: {
    icon:    '/favicon.ico',
    apple:   '/favicon.png',
    shortcut:'/favicon.png',
  },

  // ── Open Graph (WhatsApp, Facebook preview) ───────────────
  openGraph: {
    title:       'BazaarSathi — Fresh Groceries Delivered Fast',
    description: 'Shop fresh vegetables, fruits, dairy, snacks and daily essentials at best prices.',
    url:         'https://bazaarsathi.vercel.app',
    siteName:    'BazaarSathi',
    images: [
      {
        url:    '/logo.png',
        width:  800,
        height: 600,
        alt:    'BazaarSathi Logo',
      },
    ],
    locale: 'en_IN',
    type:   'website',
  },

  // ── Twitter card ─────────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       'BazaarSathi — Fresh Groceries Delivered Fast',
    description: 'Shop fresh vegetables, fruits, dairy and daily essentials.',
    images:      ['/logo.png'],
  },

  // ── Misc ─────────────────────────────────────────────────
  metadataBase: new URL('https://bazaarsathi.vercel.app'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <InitStore />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E3A3A',
              color:      '#fff',
              fontWeight: '500',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}