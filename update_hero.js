const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const startIdx = code.indexOf('      {/* ──────────────── GALLERY ──────────────── */}');
const endIdx = code.indexOf('        {/* ──────────────── CENTRAL STORAGE SEARCH ──────────────── */}');

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find start or end indices");
    process.exit(1);
}

const newHeroSection = `      {/* ──────────────── HERO SPLIT: GALLERY + HOD ──────────────── */}
      <section id="hero" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', padding: isMobile ? '24px 5% 80px' : '0 8% 120px', position: 'relative', zIndex: 1, alignItems: 'stretch' }}>
        
        {/* LEFT: GALLERY */}
        <div style={{ flex: '1 1 65%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <FadeUp>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button 
                  onClick={() => setIsPaused(!isPaused)}
                  whileHover={{ scale: 1.1, background: isPaused ? '#B9FF66' : T.surface }} 
                  whileTap={{ scale: 0.9 }}
                  style={{ 
                    width: '42px', height: '42px', borderRadius: '12px', 
                    background: isPaused ? '#B9FF66' : T.surface, 
                    color: isPaused ? '#191A23' : T.text, 
                    border: \\\`1px solid \\\${T.border}\\\`, 
                    cursor: 'pointer', fontSize: '18px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    transition: 'all 0.3s', boxShadow: T.shadow 
                  }}
                  title={isPaused ? 'Resume Slideshow' : 'Pause Slideshow'}
                >
                  {isPaused ? '▶' : '⏸'}
                </motion.button>
                {[{ label: '←', fn: () => { setCurrentGalleryIdx(p => (p - 1 + activeGallery.length) % activeGallery.length); setIsPaused(true); } },
                  { label: '→', fn: () => { setCurrentGalleryIdx(p => (p + 1) % activeGallery.length); setIsPaused(true); } }].map(btn => (
                  <motion.button key={btn.label} onClick={btn.fn}
                    whileHover={{ scale: 1.1, background: T.accent, color: '#FFFFFF' }} whileTap={{ scale: 0.9 }}
                    style={{ width: '42px', height: '42px', borderRadius: '12px', background: T.surface, color: T.text, border: \\\`1px solid \\\${T.border}\\\`, cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: T.shadow }}
                  >{btn.label}</motion.button>
                ))}
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.1} style={{ flexGrow: 1 }}>
            <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', height: isMobile ? '400px' : '100%', minHeight: '500px', border: \\\`1px solid \\\${T.border}\\\`, boxShadow: isDark ? 'none' : '0 12px 60px rgba(0,0,0,0.12)', background: '#000' }}>
              {activeGallery.map((photo, i) => (
                <motion.div 
                  key={photo.id || i}
                  initial={false}
                  animate={{ 
                    opacity: i === currentGalleryIdx ? 1 : 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                  }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: i === currentGalleryIdx ? 'auto' : 'none' }}
                >
                  {/* Blurred Background */}
                  <img 
                    src={(photo as any)?.image_url || ''} 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.5) saturate(1.2)', opacity: 0.6 }} 
                    alt=""
                  />
                  
                  {/* Sharp Foreground Image */}
                  <img src={(photo as any)?.image_url || ''} alt="Gallery"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
                  
                  {/* Solid Overlay */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'rgba(0,0,0,0.6)', zIndex: 2 }} />
                  
                  <div style={{ position: 'absolute', bottom: isMobile ? '24px' : '40px', left: isMobile ? '24px' : '48px', right: isMobile ? '24px' : 'auto', zIndex: 3 }}>
                    <motion.div 
                      animate={{ opacity: i === currentGalleryIdx ? 1 : 0, y: i === currentGalleryIdx ? 0 : 20 }}
                      transition={{ delay: 0.2 }}
                      style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                      {(photo as any)?.title || 'Departmental Highlight'}
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: i === currentGalleryIdx ? 1 : 0, y: i === currentGalleryIdx ? 0 : 20 }}
                      transition={{ delay: 0.3 }}
                      style={{ fontSize: isMobile ? '12px' : '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: isMobile ? '16px' : '18px' }}>📍</span> {(photo as any)?.description || 'Civil Engineering, IGIT SARANG'}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
              
              <div style={{ position: 'absolute', bottom: isMobile ? '20px' : '44px', right: isMobile ? '50%' : '48px', transform: isMobile ? 'translateX(50%)' : 'none', display: 'flex', gap: '8px', zIndex: 10 }}>
                {activeGallery.map((_, i) => (
                  <motion.div key={i} onClick={() => setCurrentGalleryIdx(i)}
                    animate={{ width: i === currentGalleryIdx ? (isMobile ? '24px' : '32px') : '8px', background: i === currentGalleryIdx ? '#B9FF66' : 'rgba(255,255,255,0.3)', opacity: i === currentGalleryIdx ? 1 : 0.6 }}
                    style={{ height: '8px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.3s' }}
                  />
                ))}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* RIGHT: HOD MESSAGE */}
        <div style={{ flex: '1 1 35%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <FadeUp>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: T.accent, color: '#FFFFFF', padding: '4px 16px', borderRadius: '10px', fontWeight: 900, fontSize: isMobile ? '16px' : '20px' }}>HOD</div>
            </div>
          </FadeUp>
          <FadeUp delay={0.15} style={{ flexGrow: 1 }}>
            <motion.div whileHover={{ boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)' }}
              style={{
                height: '100%', // Match the height of the gallery visually
                background: isDark ? '#0F172A' : '#FFFFFF',
                border: isDark ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '32px', padding: isMobile ? '32px 24px' : '40px 32px',
                display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center', justifyContent: 'center',
                backdropFilter: isDark ? 'blur(20px)' : 'none',
                position: 'relative', overflow: 'hidden',
                boxShadow: isDark ? 'none' : '0 4px 30px rgba(0,0,0,0.06)',
                transition: 'all 0.4s',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <motion.div whileHover={{ scale: 1.06 }} style={{ width: '120px', height: '120px', borderRadius: '24px', overflow: 'hidden', margin: '0 auto', border: '3px solid rgba(99, 102, 241, 0.45)', boxShadow: '0 0 40px rgba(99, 102, 241, 0.15)' }}>
                  <img
                    src={settings.hod_photo_url || hod?.photo_url || \\\`https://ui-avatars.com/api/?name=Dr+G+K+Pothal&background=6366F1&color=FFFFFF&size=512\\\`}
                    alt="HOD" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => { e.target.src = 'https://ui-avatars.com/api/?name=HOD&background=6366F1&color=FFFFFF&size=512' }}
                  />
                </motion.div>
                <div style={{ marginTop: '16px', fontWeight: 800, fontSize: '18px', color: T.text }}>{settings.hod_name}</div>
                <div style={{ fontSize: '13px', color: '#6366F1', fontWeight: 700, marginTop: '4px' }}>Head of Department</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '48px', color: '#6366F1', fontWeight: 900, lineHeight: 0.5, marginBottom: '16px' }}>&quot;</div>
                <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: 1.7, color: T.muted, fontStyle: 'italic', transition: 'color 0.4s' }}>{settings.hod_quote}</p>
                <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 14px', borderRadius: '99px', fontSize: '11px', color: '#6366F1', fontWeight: 700 }}>Civil Engineering</span>
                  <span style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '6px 14px', borderRadius: '99px', fontSize: '11px', color: '#6366F1', fontWeight: 700 }}>IGIT SARANG</span>
                </div>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </section>
\n`;

code = code.substring(0, startIdx) + newHeroSection + code.substring(endIdx);
fs.writeFileSync('src/app/page.tsx', code);
console.log('Successfully updated layout.');
