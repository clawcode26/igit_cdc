'use client'

import React, { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

export default function CommunityOnboardingPage() {
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [optInWhatsApp, setOptInWhatsApp] = useState(false)
  const [optInTelegram, setOptInTelegram] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingRecord, setExistingRecord] = useState<any>(null)

  useEffect(() => {
    if (!user?.uid) return
    const fetchRecord = async () => {
      const q = query(collection(db, 'community_members'), where('studentId', '==', user.uid))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const data = snap.docs[0].data()
        setExistingRecord(data)
        setPhoneNumber(data.phoneNumber)
        setOptInWhatsApp(data.whatsappOptIn)
        setOptInTelegram(data.telegramOptIn)
      }
    }
    fetchRecord()
  }, [user])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!optInWhatsApp && !optInTelegram) {
      toast.error('You must opt into at least one channel (WhatsApp or Telegram).')
      return
    }
    setSaving(true)
    try {
      const data = {
        studentId: user?.uid,
        phoneNumber,
        whatsappOptIn: optInWhatsApp,
        telegramOptIn: optInTelegram,
        onboardedAt: new Date().toISOString()
      }
      
      // In a real setup, we would update existing record if present. For brevity, simulating an upsert.
      await addDoc(collection(db, 'community_members'), data)
      setExistingRecord(data)
      toast.success('Successfully registered for CDC broadcasts!')
    } catch (err) {
      toast.error('Failed to register')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Topbar title="Community & Broadcast Groups" />
      <div className="content-container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="section-heading" style={{ marginBottom: '16px' }}>CDC Broadcast Onboarding</h2>
          <p className="secondary-text" style={{ marginBottom: '24px', lineHeight: 1.6 }}>
            Join our official WhatsApp and Telegram channels to receive instant notifications about placement drives, internships, and urgent academic notices. 
          </p>

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number (10 digits)</label>
              <input type="tel" className="form-input" required placeholder="e.g. 9876543210" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={!!existingRecord} />
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <input type="checkbox" checked={optInWhatsApp} onChange={e => setOptInWhatsApp(e.target.checked)} disabled={!!existingRecord} />
                Opt-in to WhatsApp Official Broadcasts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <input type="checkbox" checked={optInTelegram} onChange={e => setOptInTelegram(e.target.checked)} disabled={!!existingRecord} />
                Opt-in to Telegram CDC Channel
              </label>
            </div>

            {existingRecord ? (
              <div className="badge badge-success" style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                You are currently enrolled in our broadcast list.
              </div>
            ) : (
              <button type="submit" className="btn btn-filled" disabled={saving}>
                {saving ? 'Registering...' : 'Register for Broadcasts'}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
