'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'
import type { GalleryPhoto } from '@/types'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/landing/Header'

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

export default function GalleryPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [gallery, setGallery] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const T = {
    bg:        isDark ? '#020617'              : '#FFFFFF',
    text:      isDark ? '#F1F5F9'              : '#0F172A',
    muted:     isDark ? '#94A3B8'              : '#64748B',
    border:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    surface:   isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
  }

  useEffect(() => {
    const unsubGallery = onSnapshot(collection(db, 'gallery'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryPhoto))
      setGallery(data.sort((a, b) => b.created_at.localeCompare(a.created_at)))
      setLoading(false)
    })
    return () => unsubGallery()
  }, [])

  const activeGallery = gallery.length > 0 ? gallery : [
    { id: 'p1', image_url: 'https://images.unsplash.com/photo-1590159491612-da7d25e0c06a?q=80&w=2000&auto=format&fit=crop', title: 'Department Entrance', description: 'Civil Engineering, IGIT SARANG', created_at: '' },
    { id: 'p2', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2000&auto=format&fit=crop', title: 'Construction Lab', description: 'Civil Engineering, IGIT SARANG', created_at: '' },
    { id: 'p3', image_url: 'https://plus.unsplash.com/premium_photo-1661962283999-906969543884?q=80&w=2000&auto=format&fit=crop', title: 'Surveying Session', description: 'Civil Engineering, IGIT SARANG', created_at: '' },
  ]

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
      
      <main style={{ padding: isMobile ? '40px 5% 80px' : '60px 8% 120px', maxWidth: '1440px', margin: '0 auto' }}>
        <FadeUp>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 900, marginBottom: '16px', color: T.text }}>Gallery</h1>
            <p style={{ fontSize: isMobile ? '16px' : '18px', color: T.muted, maxWidth: '600px', lineHeight: 1.6 }}>Moments, events, and memories from the Department of Civil Engineering.</p>
          </div>
        </FadeUp>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: `3px solid ${T.border}`, borderTop: '3px solid #6366F1' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {activeGallery.map((photo, i) => (
              <FadeUp key={photo.id || i} delay={i * 0.1}>
                <div style={{ 
                  borderRadius: '12px', overflow: 'hidden', border: `1px solid ${T.border}`, background: T.surface,
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ width: '100%', height: '250px', position: 'relative', background: '#000' }}>
                    <img 
                      src={photo.image_url || ''} 
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px) brightness(0.6) saturate(1.2)' }} 
                      alt=""
                    />
                    <img src={photo.image_url || ''} alt={photo.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} />
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: T.text, marginBottom: '8px' }}>{photo.title || 'Departmental Highlight'}</h3>
                    <div style={{ fontSize: '14px', color: T.muted, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                      <span>📍</span> {photo.description || 'Civil Engineering, IGIT SARANG'}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
