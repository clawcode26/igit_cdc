'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase/config'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Assignment, Submission } from '@/types'

export function AssignmentsFacultyClient() {
  const { user, profile } = useAuth()
  const [offerings, setOfferings] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Create form state
  const [newAssignment, setNewAssignment] = useState({
    offering_id: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: 10,
    file: null as File | null
  })
  const [creating, setCreating] = useState(false)

  const [activeTab, setActiveTab] = useState<'Classes' | 'Assignments'>('Classes')

  useEffect(() => {
    if (!profile || !user) return

    async function fetchData() {
      try {
        const offQ = query(collection(db, 'course_offerings'), where('faculty_id', '==', user?.uid))
        const offSnap = await getDocs(offQ)
        const offList = offSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setOfferings(offList)

        const assQ = query(collection(db, 'assignments'), where('faculty_id', '==', user?.uid), orderBy('created_at', 'desc'))
        const assSnap = await getDocs(assQ)
        setAssignments(assSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, profile])

  async function handleUpdateOffering(offeringId: string, updates: any) {
    try {
      await updateDoc(doc(db, 'course_offerings', offeringId), updates)
      setOfferings(prev => prev.map(o => o.id === offeringId ? { ...o, ...updates } : o))
      toast.success('Updated successfully')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setCreating(true)

    try {
      let fileUrl = null
      if (newAssignment.file) {
        const storageRef = ref(storage, `assignments/${Date.now()}_${newAssignment.file.name}`)
        await uploadBytes(storageRef, newAssignment.file)
        fileUrl = await getDownloadURL(storageRef)
      }

      const selectedOff = offerings.find(o => o.id === newAssignment.offering_id)

      const assignmentData = {
        faculty_id: user.uid,
        offering_id: newAssignment.offering_id,
        course_name: selectedOff?.course_name || '',
        batch_id: selectedOff?.batch_id || '',
        title: newAssignment.title,
        description: newAssignment.description,
        due_date: new Date(newAssignment.due_date).toISOString(),
        max_marks: Number(newAssignment.max_marks),
        file_url: fileUrl,
        created_at: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'assignments'), assignmentData)
      setAssignments(prev => [{ id: docRef.id, ...assignmentData }, ...prev])
      toast.success('Assignment created!')
      setShowCreate(false)
      setNewAssignment({ offering_id: '', title: '', description: '', due_date: '', max_marks: 10, file: null })
    } catch (err: any) {
      toast.error('Failed to create assignment')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <>
      <Topbar title="Manage Assignments & Classes" accentColor="#185FA5" />
      <div className="content-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', padding: '24px 32px' }}>
        <div className="section-row" style={{ marginBottom: '24px', flexShrink: 0 }}>
          <div>
            <h2 className="section-heading">Workspace</h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setActiveTab('Classes')}
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 4px', borderBottom: activeTab === 'Classes' ? '2px solid #185FA5' : '2px solid transparent', color: activeTab === 'Classes' ? '#185FA5' : 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                My Assigned Classes
              </button>
              <button 
                onClick={() => setActiveTab('Assignments')}
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, padding: '8px 4px', borderBottom: activeTab === 'Assignments' ? '2px solid #185FA5' : '2px solid transparent', color: activeTab === 'Assignments' ? '#185FA5' : 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                Student Assignments
              </button>
            </div>
          </div>
          {activeTab === 'Assignments' && (
            <button onClick={() => setShowCreate(true)} className="btn btn-filled" style={{ background: '#185FA5', borderColor: '#185FA5', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Issue
            </button>
          )}
        </div>

        {activeTab === 'Classes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {offerings.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No classes assigned to you yet.</div>
            ) : offerings.map(offering => (
              <div key={offering.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{offering.course_name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>({offering.course_code})</span></h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{offering.batch_name} • {offering.semester_name}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select 
                      className="form-input" 
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', minWidth: '140px' }}
                      value={offering.status || 'Assigned'}
                      onChange={e => handleUpdateOffering(offering.id, { status: e.target.value })}
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', background: 'var(--surface-secondary)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Admin Notes:</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{offering.notes || 'No notes provided by admin.'}</div>
                  </div>
                  <div style={{ width: '200px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Due Date:</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#E24B4A', marginBottom: '16px' }}>{offering.due_date ? new Date(offering.due_date).toLocaleDateString() : 'None'}</div>
                    
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      Syllabus Progress: <span>{offering.progress || 0}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={offering.progress || 0}
                      onChange={e => {
                        const newOfferings = [...offerings];
                        const idx = newOfferings.findIndex(o => o.id === offering.id);
                        if(idx !== -1) newOfferings[idx].progress = Number(e.target.value);
                        setOfferings(newOfferings);
                      }}
                      onMouseUp={e => handleUpdateOffering(offering.id, { progress: Number((e.target as HTMLInputElement).value) })}
                      onTouchEnd={e => handleUpdateOffering(offering.id, { progress: Number((e.target as HTMLInputElement).value) })}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Assignments' && (
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            flex: 1, 
            overflowX: 'auto', 
            overflowY: 'hidden',
            paddingBottom: '16px'
          }}>
            {/* Column 1: Active / Open */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '320px', maxWidth: '320px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>TO DO / ACTIVE</h3>
                </div>
                <span style={{ fontSize: '12px', background: '#E2E8F0', color: '#64748B', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {assignments.filter(a => new Date(a.due_date) >= new Date()).length}
                </span>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                {assignments.filter(a => new Date(a.due_date) >= new Date()).map(a => (
                  <div key={a.id} style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', cursor: 'grab' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#185FA5', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>{a.course_name}</span>
                      <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><MoreHorizontal size={14} /></button>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px', lineHeight: 1.4 }}>{a.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '11px', fontWeight: 500 }}>
                        <Clock size={12} /> {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="avatar avatar-sm" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{a.course_name.charAt(0)}</div>
                    </div>
                    <Link href={`/dashboard/faculty/assignments/evaluation?id=${a.id}`} style={{ display: 'block', marginTop: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#185FA5', textDecoration: 'none', padding: '6px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Needs Evaluation */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '320px', maxWidth: '320px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>IN REVIEW</h3>
                </div>
                <span style={{ fontSize: '12px', background: '#E2E8F0', color: '#64748B', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {assignments.filter(a => new Date(a.due_date) < new Date()).length}
                </span>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                {assignments.filter(a => new Date(a.due_date) < new Date()).map(a => (
                  <div key={a.id} style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', cursor: 'grab' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>{a.course_name}</span>
                      <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><MoreHorizontal size={14} /></button>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '12px', lineHeight: 1.4 }}>{a.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '11px', fontWeight: 600 }}>
                        <AlertCircle size={12} /> Past Due
                      </div>
                      <div className="avatar avatar-sm" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{a.course_name.charAt(0)}</div>
                    </div>
                    <Link href={`/dashboard/faculty/assignments/evaluation?id=${a.id}`} style={{ display: 'block', marginTop: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#D97706', textDecoration: 'none', padding: '6px', background: '#FFFBEB', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                      Evaluate Submissions
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '320px', maxWidth: '320px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', opacity: 0.7 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>DONE</h3>
                </div>
                <span style={{ fontSize: '12px', background: '#E2E8F0', color: '#64748B', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>0</span>
              </div>
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                Graded assignments will appear here
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
            <h2 className="section-heading" style={{ marginBottom: '20px' }}>New Assignment</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Course / Offering</label>
                <select className="form-input" required value={newAssignment.offering_id} onChange={e => setNewAssignment(p => ({ ...p, offering_id: e.target.value }))}>
                  <option value="">Select a course</option>
                  {offerings.map(o => <option key={o.id} value={o.id}>{o.course_name} ({o.batch_name})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" required value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="datetime-local" className="form-input" required value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Marks</label>
                  <input type="number" className="form-input" required value={newAssignment.max_marks} onChange={e => setNewAssignment(p => ({ ...p, max_marks: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Supporting File (Optional)</label>
                <input type="file" className="form-input" onChange={e => setNewAssignment(p => ({ ...p, file: e.target.files?.[0] || null }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-filled" style={{ flex: 1, background: '#185FA5', borderColor: '#185FA5' }} disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
