import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EVENT_COLORS: Record<string, any> = {
  workshop: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366F1', border: 'rgba(99, 102, 241, 0.2)' },
  placement_drive: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.2)' },
  aptitude: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' },
  event: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
}

export function LandingCalendar({ events, isDark, T }: { events: any[], isDark: boolean, T: any }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  let firstDay = new Date(year, month, 1).getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  // Dynamic grid size: 35 days (5 rows) if it fits, else 42 days (6 rows)
  const totalCells = (firstDay + daysInMonth) <= 35 ? 35 : 42

  const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNext = () => setCurrentDate(new Date(year, month + 1, 1))
  const handleToday = () => setCurrentDate(new Date())

  return (
    <div style={{ background: isDark ? '#0F172A' : '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: '16px', boxShadow: T.shadow, overflow: 'hidden' }}>
      
      {/* Calendar Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: T.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrev} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', color: T.text, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}><ChevronLeft size={16} /></button>
          <button onClick={handleToday} style={{ padding: '0 12px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', color: T.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Today</button>
          <button onClick={handleNext} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', color: T.text, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Grid Wrapper for Mobile Responsiveness */}
      <div style={{ overflowX: 'auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px', minWidth: '900px' }}>
          
          {/* Days of week */}
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: 700, fontSize: '11px', color: T.muted, paddingBottom: '16px', borderBottom: `1px solid ${T.border}` }}>
            {day}
          </div>
        ))}

        {/* Empty leading slots */}
        {Array.from({ length: firstDay }).map((_, i) => {
          const dateNum = prevMonthDays - firstDay + i + 1;
          return (
            <div key={`empty-${i}`} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '12px', minHeight: '130px', padding: '12px', opacity: 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', fontWeight: 600, color: T.muted }}>{dateNum}</div>
            </div>
          )
        })}

        {/* Actual Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dateNum = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`
          const dayEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time))
          const isToday = dateStr === new Date().toISOString().split('T')[0]

          return (
            <div key={dateNum} style={{ background: isDark ? 'transparent' : '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: '12px', minHeight: '130px', padding: '12px', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}
                 onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                 onMouseOver={e => e.currentTarget.style.borderColor = T.muted}
                 onMouseOut={e => e.currentTarget.style.borderColor = T.border}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isToday ? '#B91C1C' : 'transparent',
                  color: isToday ? '#FFFFFF' : T.text,
                  fontWeight: 700,
                  fontSize: '13px'
                }}>
                  {dateNum}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dayEvents.map(ev => {
                  const colors = EVENT_COLORS[ev.type] || EVENT_COLORS.event
                  return (
                    <div key={ev.id} 
                         onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                         style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', transition: 'transform 0.1s' }}
                         onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                      {ev.time} - {ev.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Empty trailing slots */}
          {Array.from({ length: totalCells - (firstDay + daysInMonth) }).map((_, i) => (
            <div key={`empty-end-${i}`} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '12px', minHeight: '130px', padding: '12px', opacity: 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', fontWeight: 600, color: T.muted }}>{i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedEvent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '100%', maxWidth: '400px', background: isDark ? '#0F172A' : '#FFFFFF', border: `1px solid ${T.border}`, borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              
              <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', background: (EVENT_COLORS[selectedEvent.type] || EVENT_COLORS.event).bg, color: (EVENT_COLORS[selectedEvent.type] || EVENT_COLORS.event).text }}>
                {selectedEvent.type.replace('_', ' ')}
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: T.text, margin: '0 0 16px 0', lineHeight: 1.3 }}>{selectedEvent.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: T.muted, fontSize: '13px', fontWeight: 500 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: T.muted, fontSize: '13px', fontWeight: 500 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {selectedEvent.time}
                </div>
              </div>

              {selectedEvent.description && (
                <div style={{ fontSize: '14px', color: T.muted, lineHeight: 1.6, padding: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: '8px', marginBottom: '24px' }}>
                  {selectedEvent.description}
                </div>
              )}

              <button onClick={() => setSelectedEvent(null)} style={{ width: '100%', padding: '12px', background: T.text, color: T.bg, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
