import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Users, GraduationCap, Building, Briefcase } from 'lucide-react'

const ROLE_ROUTES: Record<string, string> = {
  admin: '/dashboard/admin',
  hod: '/dashboard/hod',
  faculty: '/dashboard/faculty',
  student: '/dashboard/student',
  alumni: '/dashboard/alumni',
}

const StatCard = ({ value, label, icon, isDark }: { value: string; label: string; icon: React.ReactNode; isDark: boolean }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    style={{
      background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #E2E8F0',
      borderRadius: '12px', padding: '12px 16px',
      textAlign: 'center', cursor: 'default',
      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px',
    }}
  >
    <div style={{ color: '#64748B', marginBottom: '6px' }}>{icon}</div>
    <div style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '11px', color: isDark ? '#94A3B8' : '#64748B', marginTop: '4px', fontWeight: 600 }}>{label}</div>
  </motion.div>
)

export function Header({ settings = {} }: { settings?: any }) {
  const { user, profile } = useAuth()
  const { theme, toggle } = useTheme()
  const router = useRouter()
  const isDark = theme === 'dark'
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDashboardRedirect = () => {
    if (profile?.role) router.push(ROLE_ROUTES[profile.role as string] || '/login')
  }

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Faculty', href: '/#faculty' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Storage', href: '/storage' },
    { label: 'Verification', href: '/verify' },
  ]

  return (
    <header style={{ width: '100%', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      {/* Tier 1: Top Utility Bar */}
      <div style={{ background: '#001E43', padding: '8px 8%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
          <button onClick={toggle} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <span style={{ color: '#334155' }}>|</span>
          {user ? (
            <button onClick={handleDashboardRedirect} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Dashboard</button>
          ) : (
            <button onClick={() => router.push('/login')} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>Login</button>
          )}
        </div>
      </div>

      {/* Tier 2: Main Logo Area & Stats */}
      <div style={{ background: isDark ? '#020617' : '#FFFFFF', padding: isMobile ? '24px 5%' : '24px 8%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: '24px', borderBottom: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: isMobile ? '64px' : '80px', height: isMobile ? '64px' : '80px', flexShrink: 0 }}>
            <img src={(settings?.logos && settings.logos[0]) || "/igit-logo.png"} alt="IGIT Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e: any) => { e.target.src = 'https://ui-avatars.com/api/?name=IGIT&background=0F172A&color=fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <h1 style={{ fontSize: isMobile ? '20px' : '32px', fontWeight: 900, color: isDark ? '#F8FAFC' : '#0F172A', letterSpacing: '-0.03em', margin: '0 0 4px 0' }}>Department of Civil Engineering</h1>
            <h2 style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 500, color: isDark ? '#94A3B8' : '#475569', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>Indira Gandhi Institute of Technology, Sarang</h2>
            <p style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: 500, color: isDark ? '#64748B' : '#94A3B8', margin: 0 }}>An Autonomous Institute of Govt. of Odisha</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: '15+',   label: 'Expert Faculty',    icon: <Users size={18} /> },
            { value: '400+',  label: 'Students',          icon: <GraduationCap size={18} /> },
            { value: `${new Date().getFullYear() - 1983}+`,  label: 'Years Legacy',      icon: <Building size={18} /> },
            { value: '30+',   label: 'Placements 2026',   icon: <Briefcase size={18} /> },
          ].map(s => <StatCard key={s.label} {...s} isDark={isDark} />)}
        </div>
      </div>

      {/* Tier 3: Main Navigation */}
      <div style={{ background: '#001E43', padding: isMobile ? '16px 5%' : '0 8%', display: 'flex', justifyContent: isMobile ? 'space-between' : 'center', alignItems: 'center' }}>
        {!isMobile ? (
          <div style={{ display: 'flex', gap: '32px' }}>
            {navItems.map(item => (
              <Link key={item.label} href={item.href} style={{ padding: '12px 0', color: '#F1F5F9', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = '#38BDF8'} onMouseOut={e => e.currentTarget.style.color = '#F1F5F9'}>
                {item.label}
              </Link>
            ))}
          </div>
        ) : (
          <>
            <div style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: 600 }}>Menu</div>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'transparent', border: 'none', color: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {/* Tier 4: Banner Image */}
      <div style={{ width: '100%', borderBottom: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0', overflow: 'hidden' }}>
        <img 
          src="/banner.png" 
          alt="Institute Banner" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>


      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1001 }}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px', background: isDark ? '#020617' : '#FFFFFF', zIndex: 1002, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ fontWeight: 800, fontSize: '16px', color: isDark ? '#F8FAFC' : '#0F172A' }}>Navigation</div>
                <button onClick={() => setMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94A3B8' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <X size={20} />
                </button>
              </div>
              
              {navItems.map(item => (
                <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} style={{ padding: '12px 16px', color: isDark ? '#E2E8F0' : '#334155', fontSize: '15px', fontWeight: 600, borderBottom: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9', textDecoration: 'none', display: 'block' }}>
                  {item.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
