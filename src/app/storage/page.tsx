'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/landing/Header'
import LandingStorageSearch from '@/components/landing/LandingStorageSearch'

export default function StoragePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const T = {
    bg:        isDark ? '#020617'              : '#FFFFFF',
    text:      isDark ? '#F1F5F9'              : '#0F172A',
    muted:     isDark ? '#94A3B8'              : '#64748B',
    border:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    surface:   isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    accent:    '#6366F1',
    faint:     isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Header />
      
      <main style={{ padding: isMobile ? '20px 0 80px' : '40px 0 120px' }}>
        <LandingStorageSearch isDark={isDark} T={T} />
      </main>

      <Footer />
    </div>
  )
}
