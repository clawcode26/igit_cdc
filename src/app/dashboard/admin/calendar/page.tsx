'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { Topbar } from '@/components/layout/Topbar'
import toast from 'react-hot-toast'
import { Plus, X, Calendar as CalendarIcon, Clock, Trash2, Edit2, Tag, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type CalendarEvent = {
  id?: string
  title: string
  type: 'workshop' | 'aptitude' | 'placement_drive' | 'event'
  date: string
  time: string
  description: string
  status: 'upcoming' | 'finished'
}

const EVENT_COLORS = {
  workshop: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366F1', border: 'rgba(99, 102, 241, 0.2)' },
  placement_drive: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.2)' },
  aptitude: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' },
  event: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
}

const EVENT_LABELS = {
  workshop: 'Workshop',
  placement_drive: 'Placement Drive',
  aptitude: 'Aptitude Class',
  event: 'General Event'
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; dateStr: string } | null>(null)
  
  const [formData, setFormData] = useState<CalendarEvent>({
    title: '',
    type: 'event',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    description: '',
    status: 'upcoming'
  })

  // Subscribe to calendar_events
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'calendar_events'), (snap) => {
      const evs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent))
      setEvents(evs)
      setLoading(false)
      
      // Auto-update status for past events based on current date
      const today = new Date().toISOString().split('T')[0]
      evs.forEach(async (ev) => {
        if (ev.date < today && ev.status === 'upcoming') {
          await updateDoc(doc(db, 'calendar_events', ev.id!), { status: 'finished' })
        }
      })
    })
    return () => unsub()
  }, [])

  // Calendar Math (42-day grid)
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  
  // Shift getDay() so Monday is 0 and Sunday is 6
  let firstDay = new Date(year, month, 1).getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Calculate trailing days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate()
  
  // Dynamic grid size: 35 days (5 rows) if it fits, else 42 days (6 rows)
  const totalCells = (firstDay + daysInMonth) <= 35 ? 35 : 42
  
  const handlePrevMonth = () => setSelectedDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setSelectedDate(new Date(year, month + 1, 1))

  const handleOpenModal = (dateStr: string, ev?: CalendarEvent) => {
    if (ev) {
      setEditingEvent(ev)
      setFormData(ev)
    } else {
      setEditingEvent(null)
      setFormData({
        title: '', type: 'event', date: dateStr, time: '10:00', description: '', status: 'upcoming'
      })
    }
    setContextMenu(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEvent?.id) {
        await updateDoc(doc(db, 'calendar_events', editingEvent.id), formData as any)
        toast.success('Event updated')
      } else {
        await addDoc(collection(db, 'calendar_events'), formData)
        toast.success('Event scheduled')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error('Failed to save event')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'calendar_events', id))
        toast.success('Event deleted')
        setIsModalOpen(false)
      } catch (err) {
        toast.error('Failed to delete event')
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent, dateStr: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, dateStr })
  }

  // Close context menu on any click outside
  useEffect(() => {
    const closeMenu = () => setContextMenu(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Calendar & Scheduling" />
      
      <div className="content-container" style={{ flex: 1, padding: '32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 className="section-heading" style={{ margin: 0, textTransform: 'uppercase', fontWeight: 900, fontSize: '22px' }}>Study Planner</h2>
              <p className="secondary-text" style={{ marginTop: '4px', fontSize: '13px' }}>Monthly schedule of subject topics and target sessions</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button className="btn btn-outline" onClick={handlePrevMonth} style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
              <span style={{ fontWeight: 800, fontSize: '16px', minWidth: '120px', textAlign: 'center' }}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button className="btn btn-outline" onClick={handleNextMonth} style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
            </div>
          </div>

          {/* Calendar Card Container */}
          <div style={{ background: 'var(--surface-primary)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px', minWidth: '900px' }}>
              
              {/* Days Header */}
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: 700, fontSize: '11px', color: 'var(--text-secondary)', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  {day}
                </div>
              ))}

              {/* Empty slots before month start */}
              {Array.from({ length: firstDay }).map((_, i) => {
                const dateNum = prevMonthDays - firstDay + i + 1;
                return (
                  <div key={`empty-${i}`} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', minHeight: '130px', padding: '12px', opacity: 0.4 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{dateNum}</div>
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
                  <div key={dateNum} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', minHeight: '130px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                       onClick={() => handleOpenModal(dateStr)}
                       onContextMenu={(e) => handleContextMenu(e, dateStr)}
                       onMouseOver={e => e.currentTarget.style.borderColor = 'var(--text-tertiary)'}
                       onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isToday ? '#B91C1C' : 'transparent',
                        color: isToday ? '#FFFFFF' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}>
                        {dateNum}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {dayEvents.map(ev => {
                        const colors = EVENT_COLORS[ev.type]
                        return (
                          <div key={ev.id} 
                               onClick={(e) => { e.stopPropagation(); handleOpenModal(dateStr, ev); }}
                               style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {ev.time} - {ev.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              {/* Empty slots after month end to complete grid row */}
              {Array.from({ length: totalCells - (firstDay + daysInMonth) }).map((_, i) => (
                <div key={`empty-end-${i}`} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', minHeight: '130px', padding: '12px', opacity: 0.4 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)' }}>{i + 1}</div>
                </div>
              ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999, background: 'var(--surface-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', minWidth: '160px' }}
          >
            <button className="context-menu-item" onClick={() => handleOpenModal(contextMenu.dateStr)} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
              <Plus size={16} /> Add Event
            </button>
            <button className="context-menu-item" onClick={() => { setSelectedDate(new Date(contextMenu.dateStr)); setContextMenu(null) }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
              <CalendarIcon size={16} /> Go to Month
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="card" style={{ width: '100%', maxWidth: '500px', margin: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {editingEvent ? 'Edit Event' : 'Schedule Event'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input className="form-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. TCS Placement Drive" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <div style={{ position: 'relative' }}>
                      <CalendarIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input type="date" className="form-input" style={{ paddingLeft: '36px' }} required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input type="time" className="form-input" style={{ paddingLeft: '36px' }} required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                      {Object.entries(EVENT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="upcoming">Upcoming</option>
                      <option value="finished">Finished (Historical)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Add any details about the event..." />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  {editingEvent && (
                    <button type="button" className="btn btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(editingEvent.id!)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                  <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-filled">Save Event</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
