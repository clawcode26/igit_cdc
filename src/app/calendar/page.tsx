'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export default function AcademicCalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const q = query(collection(db, 'calendar_events'), orderBy('startDate', 'asc'))
      const snap = await getDocs(q)
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Virtual Academic Calendar & Events Archive</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '40px' }}>Track upcoming placement drives, workshops, and browse past event galleries.</p>

        {loading ? (
          <div>Loading events...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {events.map(ev => (
              <div key={ev.id} className="card" style={{ opacity: ev.isPastEvent ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-info">{ev.type.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{new Date(ev.startDate).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{ev.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{ev.description}</p>
                {ev.galleryImageUrls?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Event Gallery</p>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                      {ev.galleryImageUrls.map((url: string, i: number) => (
                        <img key={i} src={url} alt="Event" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {events.length === 0 && <p>No events scheduled currently.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
