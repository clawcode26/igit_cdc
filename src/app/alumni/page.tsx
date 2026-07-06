'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlumni() {
      // For public directory, only fetch verified profiles
      const q = query(collection(db, 'alumni'), where('verified', '==', true))
      const snap = await getDocs(q)
      setAlumni(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchAlumni()
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Header />
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Alumni Directory</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '40px' }}>Discover the career paths of our distinguished Career Development Centre alumni.</p>

        {loading ? (
          <div>Loading directory...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {alumni.map(al => (
              <div key={al.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={al.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(al.name)}`} alt={al.name} style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{al.name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Batch of {al.batchYear}</p>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>{al.currentCompany || 'Not Disclosed'}</p>
                  <a href={al.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0B3D6E', textDecoration: 'underline' }}>View LinkedIn Profile</a>
                </div>
              </div>
            ))}
            {alumni.length === 0 && <p>No verified alumni profiles found.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
