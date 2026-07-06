'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/config'
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  limit
} from 'firebase/firestore'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'
import { NoticeComposer } from './NoticeComposer'
import { Hash, Calendar, FileText, User, Users, Trash2, Pin } from 'lucide-react'

interface Props {
  role: UserRole
  accentColor: string
}

export function AnnouncementsManager({ role, accentColor }: Props) {
  const { user, profile } = useAuth()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NEW' | 'EXISTING'>('EXISTING')
  const [creating, setCreating] = useState(false)

  const [newAnn, setNewAnn] = useState({
    title: '',
    body: '',
    target_role: 'all' as UserRole | 'all',
    target_batch_id: '',
    is_pinned: false
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'notices'), orderBy('created_at', 'desc'), limit(50))
      const snap = await getDocs(q)
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })))

      const batchSnap = await getDocs(collection(db, 'batches'))
      setBatches(batchSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Error fetching notices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'EXISTING') {
      fetchData()
    }
  }, [activeTab])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const data = {
        author_id: user?.uid,
        author_name: profile?.full_name || 'Admin',
        title: newAnn.title,
        body: newAnn.body,
        target_role: newAnn.target_role === 'all' ? null : newAnn.target_role,
        target_batch_id: newAnn.target_batch_id || null,
        is_pinned: newAnn.is_pinned,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const docRef = await addDoc(collection(db, 'notices'), data)
      setAnnouncements(prev => [{ id: docRef.id, ...data }, ...prev])
      toast.success('Announcement posted!')
      setActiveTab('EXISTING')
      setNewAnn({ title: '', body: '', target_role: 'all', target_batch_id: '', is_pinned: false })
    } catch (err) {
      toast.error('Failed to post announcement')
    } finally {
      setCreating(false)
    }
  }

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return '—'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this notice?')) return
    try {
      await deleteDoc(doc(db, 'notices', id))
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast.success('Deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  async function togglePin(a: any) {
    try {
      await updateDoc(doc(db, 'notices', a.id), { is_pinned: !a.is_pinned })
      setAnnouncements(prev => prev.map(item => item.id === a.id ? { ...item, is_pinned: !a.is_pinned } : item))
    } catch (err) {
      toast.error('Update failed')
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <>
      <Topbar title="Notices & Broadcast" accentColor={accentColor} />
      
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', padding: '0 32px', gap: '24px' }}>
        <button 
          onClick={() => setActiveTab('EXISTING')} 
          style={{ padding: '16px 0 14px', fontSize: '14px', fontWeight: 600, borderBottom: activeTab === 'EXISTING' ? `2px solid ${accentColor}` : 'none', color: activeTab === 'EXISTING' ? 'var(--text-primary)' : 'var(--text-tertiary)', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
        >
          Existing Notices
        </button>
        <button 
          onClick={() => setActiveTab('NEW')} 
          style={{ padding: '16px 0 14px', fontSize: '14px', fontWeight: 600, borderBottom: activeTab === 'NEW' ? `2px solid ${accentColor}` : 'none', color: activeTab === 'NEW' ? 'var(--text-primary)' : 'var(--text-tertiary)', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
        >
          New Post
        </button>
      </div>

      <div style={{ padding: '0 32px' }}>
        {activeTab === 'NEW' ? (
          <NoticeComposer accentColor={accentColor} onCancel={() => setActiveTab('EXISTING')} />
        ) : (
          <div>
            <div className="section-row" style={{ marginBottom: '20px' }}>
              <div>
                <h2 className="section-heading">Manage Announcements</h2>
                <p className="secondary-text">View and manage broadcasted notices.</p>
              </div>
              <button onClick={() => setActiveTab('NEW')} className="btn btn-filled" style={{ background: accentColor, borderColor: accentColor }}>
                Post New
              </button>
            </div>

            <div style={{ background: 'var(--surface-primary)', borderRadius: '8px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
              <table className="data-table spreadsheet-table">
                <thead>
                  <tr>
                    <th style={{ borderRight: '1px solid #E2E8F0', width: '120px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Hash size={14} /> Ref No</div></th>
                    <th style={{ borderRight: '1px solid #E2E8F0', width: '120px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Date</div></th>
                    <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Subject</div></th>
                    <th style={{ borderRight: '1px solid #E2E8F0', width: '140px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Target</div></th>
                    <th style={{ borderRight: '1px solid #E2E8F0', width: '160px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Author</div></th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map(a => {
                    const dateIssued = a.dateIssued ? new Date(a.dateIssued).toLocaleDateString() : timeAgo(a.created_at);
                    return (
                      <tr key={a.id} style={{ background: a.is_pinned ? 'var(--surface-secondary)' : 'transparent' }}>
                        <td style={{ fontWeight: 500, color: 'var(--text-secondary)', borderRight: '1px solid #E2E8F0' }}>
                          {a.refNo || a.id.slice(0,8).toUpperCase()}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', borderRight: '1px solid #E2E8F0' }}>
                          {dateIssued}
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {a.is_pinned && <span style={{ color: accentColor }}><Pin size={14} fill={accentColor} /></span>}
                            {a.title || a.subject || 'Untitled Notice'}
                          </div>
                        </td>
                        <td style={{ borderRight: '1px solid #E2E8F0' }}>
                          <span className="badge badge-neutral">
                            {a.target_role ? `Role: ${a.target_role}` : a.target_batch_id ? `Batch: ${batches.find(b => b.id === a.target_batch_id)?.graduation_year}` : 'Everyone'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', borderRight: '1px solid #E2E8F0' }}>
                          {a.author_name || a.undersigned || 'Admin'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {a.mediaUrl ? (
                              <a href={`/api/github/download?url=${encodeURIComponent(a.mediaUrl)}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost" style={{ padding: '4px', color: '#0EA5E9' }} title="View PDF">
                                <FileText size={16} />
                              </a>
                            ) : (
                              <button disabled className="btn btn-sm btn-ghost" style={{ padding: '4px', color: 'var(--text-tertiary)', opacity: 0.5 }} title="No PDF Attached">
                                <FileText size={16} />
                              </button>
                            )}
                            <button onClick={() => togglePin(a)} className="btn btn-sm btn-ghost" style={{ padding: '4px', color: a.is_pinned ? accentColor : 'var(--text-tertiary)' }} title={a.is_pinned ? 'Unpin' : 'Pin'}>
                              <Pin size={16} />
                            </button>
                            <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-ghost" style={{ padding: '4px', color: '#E74C3C' }} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {announcements.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                        No notices broadcasted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
