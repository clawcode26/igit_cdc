'use client'

import React, { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'

export default function InternshipLetterPage() {
  const { user, profile } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deptName, setDeptName] = useState('')

  const [formData, setFormData] = useState({
    semester: '',
    dob: '',
    designation: '',
    address: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (user?.uid) {
      fetchRequests()
    }
    if (profile?.dept_id) {
      getDoc(doc(db, 'departments', profile.dept_id)).then(snap => {
        if (snap.exists()) setDeptName(snap.data().name)
      }).catch(console.error)
    }
  }, [user, profile])

  async function fetchRequests() {
    try {
      const q = query(
        collection(db, 'internship_requests'), 
        where('studentId', '==', user?.uid),
        orderBy('created_at', 'desc')
      )
      const snap = await getDocs(q)
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error("Failed to fetch requests", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'internship_requests'), {
        studentId: user?.uid || '',
        studentName: profile?.full_name || '',
        rollNo: profile?.roll_no || profile?.registration_no || '',
        regNo: profile?.registration_no || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        department: deptName || profile?.dept_id || '',
        formData,
        status: 'PENDING',
        created_at: new Date().toISOString()
      })
      toast.success('Internship request submitted successfully!')
      setFormData({ semester: '', dob: '', designation: '', address: '', startDate: '', endDate: '' })
      fetchRequests()
    } catch (err) {
      toast.error('Failed to submit request')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Topbar title="Internship Letter Generator" />
      <div className="content-container">
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <h2 className="section-heading" style={{ marginBottom: '24px' }}>Request Official Internship Letter</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Read Only DB Fields */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Name</div>
                  <div style={{ fontWeight: 500 }}>{profile?.full_name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Registration No.</div>
                  <div style={{ fontWeight: 500 }}>{profile?.registration_no || profile?.roll_no || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{profile?.email || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Phone</div>
                  <div style={{ fontWeight: 500 }}>{profile?.phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Branch</div>
                  <div style={{ fontWeight: 500 }}>{deptName || profile?.dept_id || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Current Semester</label>
                  <input className="form-input" required placeholder="e.g. 5th" value={formData.semester} onChange={e => setFormData(p => ({ ...p, semester: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" required value={formData.dob} onChange={e => setFormData(p => ({ ...p, dob: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Designation</label>
                <input className="form-input" required placeholder="e.g. HR Manager" value={formData.designation} onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Company Address</label>
                <textarea className="form-input" required rows={3} placeholder="Full address of the company..." value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" required value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" required value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>

              <button type="submit" className="btn btn-filled" style={{ background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' }} disabled={submitting}>
                {submitting ? 'Submitting Request...' : 'Submit Request'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="section-heading" style={{ fontSize: '16px', marginBottom: '16px' }}>My Previous Requests</h3>
            {loading ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading requests...</div>
            ) : requests.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>You have not submitted any internship requests yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.map(req => (
                  <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{req.formData.designation}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Requested on {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        background: req.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                        color: req.status === 'APPROVED' ? '#166534' : '#92400e'
                      }}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  )
}
