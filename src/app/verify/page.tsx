'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, where, getDocs, getDoc, doc, query } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function VerifyPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const T = {
    bg:        isDark ? '#020617'              : '#FFFFFF',
    text:      isDark ? '#F1F5F9'              : '#0F172A',
    muted:     isDark ? '#94A3B8'              : '#64748B',
    border:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    surface:   isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    faint:     isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Verification State
  const [vRef, setVRef] = useState('')
  const [vResult, setVResult] = useState<any>(null)
  const [vLoading, setVLoading] = useState(false)
  const [vError, setVError] = useState('')

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!vRef.trim()) return
    setVLoading(true)
    setVError('')
    setVResult(null)

    try {
      await new Promise(r => setTimeout(r, 1200)) // Deluxe delay
      const cleanId = vRef.trim()
      let snap: any = null

      if (!cleanId.includes('/')) {
        const directSnap = await getDoc(doc(db, 'requests', cleanId))
        if (directSnap.exists()) snap = directSnap
      }
      if (!snap) {
        const q = query(collection(db, 'requests'), where('reference_no', '==', cleanId))
        const qSnap = await getDocs(q)
        if (!qSnap.empty) snap = qSnap.docs[0]
      }

      if (snap && snap.exists()) {
        const data = snap.data()
        if (data.status === 'approved') setVResult({ ...data, id: snap.id })
        else setVError('Found, but status is: ' + (data.status || 'PENDING').toUpperCase())
      } else {
        setVError('No record found matching this Reference Number.')
      }
    } catch (err: any) {
      setVError(`Search Error: ${err.message}`)
    } finally {
      setVLoading(false)
    }
  }

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ padding: isMobile ? '60px 5% 100px' : '80px 8% 120px', maxWidth: '1440px', margin: '0 auto', flexGrow: 1, width: '100%' }}>
        <FadeUp>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: 900, marginBottom: '16px', color: T.text }}>Verify Certificates</h1>
            <p style={{ fontSize: isMobile ? '16px' : '18px', color: T.muted, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Enter the Tracking ID / Reference Number to validate any digital document instantly.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              background: isDark ? '#0F172A' : '#FFFFFF',
              border: `1px solid ${T.border}`,
              borderRadius: '8px', padding: isMobile ? '32px 24px' : '52px 60px',
            }}>
              <form onSubmit={handleVerify} style={{ position: 'relative', marginBottom: (vResult || vError || vLoading) ? '32px' : '0' }}>
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID (e.g. IGIT/CE-02...)" 
                  value={vRef}
                  onChange={e => setVRef(e.target.value)}
                  style={{
                    width: '100%', padding: '18px 24px', borderRadius: '16px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: T.text, fontSize: '15px', fontWeight: 600, outline: 'none',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#534AB7')}
                  onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}
                />
                <button 
                  disabled={vLoading}
                  type="submit"
                  style={{
                    position: 'absolute', right: '8px', top: '8px', bottom: '8px',
                    background: '#534AB7', color: '#fff', padding: '0 24px',
                    borderRadius: '12px', border: 'none', fontWeight: 800,
                    cursor: vLoading ? 'wait' : 'pointer', fontSize: '14px',
                  }}
                >
                  {vLoading ? '...' : 'Verify'}
                </button>
              </form>

              {/* Results Area */}
              <AnimatePresence>
                {vLoading && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid rgba(83, 74, 183, 0.2)', borderTop: '3px solid #534AB7', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    <p style={{ marginTop: '12px', color: '#534AB7', fontWeight: 700, fontSize: '13px' }}>Validating document from secure node...</p>
                  </motion.div>
                )}

                {vError && !vLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
                    padding: '24px', borderRadius: '16px', background: 'rgba(226,75,74,0.1)',
                    border: '1.5px solid rgba(226,75,74,0.3)', color: '#E24B4A',
                    display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{vError}</div>
                  </motion.div>
                )}

                {vResult && !vLoading && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{
                    marginTop: '20px', padding: '32px', borderRadius: '8px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    border: `1px solid ${T.border}`, boxShadow: 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'transparent', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>✅</div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: T.text }}>Authentic Document Found</div>
                        <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 700 }}>VERIFIED BY CIVIL DEPT. IGIT SARANG</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                      <div style={{ background: T.faint, padding: '16px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: T.muted, marginBottom: '6px', textTransform: 'uppercase' }}>Student Name</div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{vResult.student_name}</div>
                      </div>
                      <div style={{ background: T.faint, padding: '16px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: T.muted, marginBottom: '6px', textTransform: 'uppercase' }}>Reference No</div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#534AB7' }}>{vResult.reference_no}</div>
                      </div>
                      <div style={{ background: T.faint, padding: '16px', borderRadius: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: T.muted, marginBottom: '6px', textTransform: 'uppercase' }}>Doc Type</div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{vResult.type?.replace('_', ' ').toUpperCase() || 'DOCUMENT'}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '12px', color: T.muted, fontWeight: 600 }}>Issued on: {new Date(vResult.issued_date || vResult.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeUp>
      </main>

      <Footer />
    </div>
  )
}
