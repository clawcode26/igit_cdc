import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'CDC | IGIT Sarang',
    template: '%s | CDC IGIT'
  },
  description: 'Official portal for Career Development Centre, Indira Gandhi Institute of Technology (IGIT), Sarang.',
  icons: {
    icon: '/igit-logo.png',
  },
}

import { Suspense } from 'react'
import { RouteProgressBar } from '@/components/layout/RouteProgressBar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: 'none',
            },
          }}
        />
      </body>
    </html>
  )
}
