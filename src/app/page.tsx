'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, where, getDocs, getDoc, doc, onSnapshot, query, limit } from 'firebase/firestore'
import type { Profile, NewsEvent } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/landing/Header'

// ─── Scroll-aware fade+slide animation wrapper ────────────────────────────────
const FadeUp = ({ children, delay = 0, style, className }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    style={style}
    className={className}
  >
    {children}
  </motion.div>
)

// ─── Expandable Notice Card ────────────────────────────────────────────────────────
const ExpandableNotice = ({ notice, delay, T, isDark, index }: any) => {
  const [open, setOpen] = useState(false)
  return (
    <FadeUp delay={delay}>
      <motion.div 
        whileHover={{ x: 6, borderColor: 'rgba(100,121,255,0.5)' }}
        onClick={() => setOpen(!open)}
        style={{
          background: open ? (isDark ? 'rgba(100,121,255,0.08)' : 'rgba(100,121,255,0.04)') : T.surface, 
          border: `1px solid ${open ? 'rgba(100,121,255,0.5)' : T.border}`, 
          borderRadius: '16px', padding: '18px 24px', cursor: 'pointer', overflow: 'hidden',
          backdropFilter: isDark ? 'blur(10px)' : 'none', transition: 'all 0.3s',
          boxShadow: T.shadow,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: open ? '#6366F1' : '#64748B', flexShrink: 0, transition: 'background 0.3s' }} />
            <span style={{ fontWeight: 600, fontSize: '15px', color: open ? '#6479FF' : T.text, transition: 'color 0.3s' }}>
              {notice.title || 'Untitled Notice'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: T.muted, whiteSpace: 'nowrap' }}>
              {notice.created_at ? new Date(notice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
            </span>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ color: open ? '#6479FF' : T.muted, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </motion.div>
          </div>
        </div>
        
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div style={{ paddingTop: '16px', marginTop: '14px', borderTop: `1px solid ${T.border}`, fontSize: '14px', color: T.muted, lineHeight: 1.6 }}>
                {notice.description || notice.content || 'No additional details provided for this notice.'}
                
                {(notice.file_url || notice.link) && (
                  <div style={{ marginTop: '16px' }}>
                    <a href={notice.file_url || notice.link} target="_blank" rel="noopener noreferrer" 
                       style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#6479FF', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '12px', transition: 'all 0.2s' }} 
                       onClick={e => e.stopPropagation()}
                       onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                       onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {notice.file_url ? '📄 View Document' : '🔗 Open Link'}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </FadeUp>
  )
}

// ─── Faculty Card ─────────────────────────────────────────────────────────────
const FacultyCard = ({ prof, isDark, T }: { prof: any; isDark: boolean; T: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-30px' }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4 }}
    style={{
      background: isDark ? '#0F172A' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      borderRadius: '8px', padding: '24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '12px', textAlign: 'center', cursor: 'default',
      boxShadow: 'none',
    }}
  >
    <div style={{
      width: '72px', height: '72px', borderRadius: '8px',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', flexShrink: 0,
    }}>
      <img
        src={prof.photo_url || prof.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.full_name || 'F')}&background=6366F1&color=FFFFFF&size=200`}
        alt={prof.full_name || 'Faculty'}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.full_name || 'F')}&background=6366F1&color=FFFFFF&size=200` }}
      />
    </div>
    <div>
      <div style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#191A23', fontSize: '15px' }}>{prof.full_name}</div>
      <div style={{ fontSize: '12px', color: T.accent, marginTop: '4px', fontWeight: 700 }}>{prof.designation || 'Faculty'}</div>
      {prof.expertise && <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)', marginTop: '6px' }}>{prof.expertise}</div>}
    </div>
  </motion.div>
)

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [faculties, setFaculties] = useState<Profile[]>([])
  const [notices, setNotices] = useState<any[]>([])
  const [hod, setHod] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hodImageLoaded, setHodImageLoaded] = useState(false)

  const [settings, setSettings] = useState({
    title: 'Civil Engineering Department, IGIT SARANG',
    subtitle: 'A unified platform for students, faculty, and alumni to collaborate, learn, and grow together.',
    hod_quote: 'Our mission is to nurture technical excellence and ethical leadership in our students.',
    hod_name: 'Dr. Goutam Kumar Pothal',
    hod_photo_url: '',
    show_faculties: true,
    show_gallery: true,
    logos: [],
  })

  // Dynamic theme tokens - Premium Indigo & Slate
  const T = {
    bg:        isDark ? '#020617'              : '#FFFFFF',
    surface:   isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    border:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text:      isDark ? '#F1F5F9'              : '#0F172A',
    muted:     isDark ? '#94A3B8'              : '#64748B',
    faint:     isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    navBg:     isDark ? 'rgba(2, 6, 23, 0.85)'  : 'rgba(255, 255, 255, 0.85)',
    navBorder: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
    orbA:      isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.15)',
    orbB:      isDark ? 'rgba(139, 92, 246, 0.10)' : 'rgba(139, 92, 246, 0.12)',
    shadow:    isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 30px rgba(99, 102, 241, 0.05)',
    accent:    '#6366F1',
    accentDark: '#4F46E5',
    success:   '#6366F1',
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    async function fetchStatics() {
      try {
        const [hodSnap, facSnap, settingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'profiles'), where('role', '==', 'hod'), limit(1))),
          getDocs(query(collection(db, 'profiles'), where('role', '==', 'faculty'), limit(8))),
          getDoc(doc(db, 'settings', 'landing')),
        ])
        if (!hodSnap.empty) setHod(hodSnap.docs[0].data() as Profile)
        setFaculties(facSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile)))
        if (settingsSnap.exists()) setSettings(prev => ({ ...prev, ...settingsSnap.data() }))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchStatics()

    const unsubNotices = onSnapshot(collection(db, 'announcements'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
      setNotices(data.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 5))
    })
    return () => { unsubNotices() }
  }, [])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: `3px solid ${T.border}`, borderTop: '3px solid #6366F1' }} />
      </div>
    )
  }

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden', transition: 'background 0.4s, color 0.4s' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 0px; }
        .dark ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>

      <Header settings={settings} />

      {/* ──────────────── HERO SECTION ──────────────── */}
      <section id="hero" style={{ padding: isMobile ? '40px 5% 80px' : '60px 8% 120px', position: 'relative', zIndex: 1 }}>
        <FadeUp delay={0.1}>
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 900, color: T.text, marginBottom: '24px' }}>About the Institute</h2>
            
            <div style={{ color: T.muted, fontSize: '15px', lineHeight: 1.7 }}>
              
              {/* FLOATED CARDS (HOD & Director) */}
              <div style={{ 
                float: isMobile ? 'none' : 'right', 
                marginLeft: isMobile ? 0 : '40px', 
                marginBottom: isMobile ? '32px' : '24px', 
                width: isMobile ? '100%' : '420px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px' 
              }}>
                {/* HOD Card */}
                <motion.div
                  style={{
                    background: isDark ? '#0F172A' : '#FFFFFF',
                    border: '1.5px solid #001E43',
                    borderRadius: '16px', padding: '24px',
                    display: 'flex', gap: '20px', alignItems: 'flex-start'
                  }}
                >
                  {/* Left Column */}
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={settings.hod_photo_url || hod?.photo_url || `https://ui-avatars.com/api/?name=Dr+G+K+Pothal&background=6366F1&color=FFFFFF&size=512`}
                      alt="HOD" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        opacity: hodImageLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease-out',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                      }}
                      onLoad={() => setHodImageLoaded(true)}
                      onError={(e: any) => { e.target.src = 'https://ui-avatars.com/api/?name=HOD&background=6366F1&color=FFFFFF&size=512' }}
                    />
                  </div>

                  {/* Right Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingTop: '12px' }}>
                    <span style={{ color: '#0EA5E9', fontSize: '12px', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Head of Department</span>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: isDark ? '#F8FAFC' : '#0F172A', lineHeight: 1.3, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                      {settings.hod_name}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* TEXT CONTENT */}
              <p style={{ marginBottom: '16px' }}>Indira Gandhi Institute of Technology (IGIT), Sarang was established in the year of 1982 and was managed directly by the Govt. of Odisha in the name of Odisha College of Engineering (OCE). Prior to this, since 1981, the institute in the name of Modern Polytechnic (MPT) was offering Diploma Courses in Civil, Electrical, Mechanical, Mining Survey Engineering. In the year 1987, both OCE & MPT were merged and renamed as IGIT, Sarang and the management was transferred to an Autonomous Society. Presently, the Institute is offering nine Under Graduate Engineering courses in Civil, Chemical, Electrical, Mechanical, Metallurgical, Electronics & Telecommunication, Computer Science Engg., Production Engg., Architecture; & two part-time Post Graduate Engg courses in Industrial Power Control & Drives, Environmental Sc. &Engg.; nine full time Post Graduate Engg courses / Master courseComputer Sc.Engg., Electronics and Telecom. Engg, GeotechEngg.,Mechanical System Design, Mett. & Materials Engg., Power Electronics & Drives, Power System Engg., Production Engg., Structural Engg., Master in Computer Application; besides five Diploma Courses in Civil, Electrical, Electronics & Telecommunication, Mechanical & Metallurgical Engineering.</p>

              <p style={{ marginBottom: '16px' }}>The Institute provides limited Hostel accomodation to its students with an integrated campus covering 179 acres of land encompassing hostels, staff quarters and a sprawling playground (Dr. M. P. Mishra memorial stadium) with basketball, volleyball and badminton courts. In addition to this, with the Govt. approval, a proposal has been submitted to District authorities for further alienation of 200 acres of Govt. land in front of the Institute for its further expansion. The institute has central infrastructure facilities like Central Library (with 27,000 volumes of books and 50 current periodicals / journals subscribed every year), Central Computer Centre, Central Workshop, Knowledge Centre, 8 nos. ofstudent hostels having accommodation facility for students and other amenities such as SBI (Core Bank facilities), Guest house , Hospital, Post Office, Canteen, Students and Employees Cooperative Consumer stores, NSS, NCC, different clubs, Telephone Exchange, Mobile tower and Schooling up to High School level in its campus.</p>

              <p style={{ marginBottom: '16px' }}>There are eight departments, well equipped with highly qualified faculties and adequately equipped laboratories. The research activities of the institute are comparable with any other leading institute of the State and the Country. The faculties are well in touch with the advancement in modern technology around the world. Every year, numbers of research papers are published in journals and Conferences of National and International repute. 15 nos. of Ph.DS have so far been produced in different departments. Every year, National Conferences / Short term courses are organized in the institute in collaboration with IE / ISTE / AICTE. People across the country and outside also are in touch with our faculties in connection with technical research and consultancy. Quite a good nos. of our alumni are excelling in their field across the world.</p>

              <p style={{ marginBottom: '16px' }}>Within a span of three decades, the institute has grown up to the National level academically. This is the first Govt. Engg. College in the state to have accreditation from NBA (AICTE) because of its academic excellence.</p>

              <p style={{ marginBottom: '16px' }}>The serene atmosphere available at Sarang offers the students optimum opportunity to concentrate on studies. Priority is given through routine curricular programmes towards improvement of practical knowledge. In order to provide complete exposure to industrial life, the students are taken to nearby industrial organisations such as NALCO, N.T.P.C./T.T.P.S., M.C.L., N.T.P.C., Rengali Dam Project, Samal Barrage, Heavy Water Project, Bhusan Steel & Strips, Rana Sponge, Nav Bharat Ferro Alloys Jindal Steel & Powers Ltd., etc., on weekends and holidays. Industrial visits for the students are also arranged to places of industrial importance such as Rourkela, Kansbahal, Sunabeda, Burla, Hirakud, Paradeep and Industrial Estate, Bhubaneswar etc. Every effort is beingmade to improve various dimensions of students personalities by conducting regular cultural programmes, technical exercises, athletic, sport and games and other co-curricular activities. made to improve various dimensions of students personalities by conducting regular cultural programmes, technical exercises, athletic, sport and games and other co-curricular activities.</p>

              <p>Campus selection of students are being conducted regularly by reputed firms like INFOSYS, Tata Consultancy Services, Larsen & Turbo Ltd. (Information Technology), defence services and Tata Refractories Ltd., Vedanta Alumina, Bhusan Steel & Strips Ltd., Satyam Computer, Kanbay, Wipro, MatasSritech, Tari Harish, I-Flex Solution, Utkal Alumina, Visa Steel , Ananda Auto etc.</p>

              {/* Clear float hack to ensure container wraps the floated cards if text is shorter */}
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ──────────────── FACULTY ──────────────── */}
      {settings.show_faculties && faculties.length > 0 && (
        <section id="faculty" style={{ padding: isMobile ? '0 5% 80px' : '0 8% 120px', position: 'relative', zIndex: 1 }}>
          <FadeUp>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', marginBottom: isMobile ? '32px' : '48px' }}>
              <div style={{ background: T.accent, color: '#FFFFFF', padding: '4px 16px', borderRadius: '10px', fontWeight: 900, fontSize: isMobile ? '20px' : '26px' }}>Faculty</div>
              <p style={{ color: T.muted, fontSize: isMobile ? '13px' : '15px' }}>Inspiring minds.</p>
            </div>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(190px,1fr))', gap: isMobile ? '12px' : '20px' }}>
            {faculties.map(fac => <FacultyCard key={fac.id} prof={fac} isDark={isDark} T={T} />)}
          </div>
        </section>
      )}

      {/* ──────────────── NOTICES ──────────────── */}
      {notices.length > 0 && (
        <section style={{ padding: isMobile ? '0 5% 80px' : '0 8% 120px', position: 'relative', zIndex: 1 }}>
          <FadeUp>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: isMobile ? '24px' : '36px' }}>
              <div style={{ background: '#6479FF', color: '#FFFFFF', padding: '4px 16px', borderRadius: '10px', fontWeight: 900, fontSize: isMobile ? '20px' : '24px' }}>Notices</div>
            </div>
          </FadeUp>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notices.slice(0, 4).map((n, i) => (
              <ExpandableNotice key={n.id || i} notice={n} delay={i * 0.07} T={T} isDark={isDark} index={i} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
