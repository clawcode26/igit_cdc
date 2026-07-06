'use client'

import React, { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { pdf } from '@react-pdf/renderer'
import { InternshipPDF } from '@/components/pdf/InternshipPDF'

export default function AdminInternshipsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const q = query(collection(db, 'internship_requests'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Failed to fetch requests', err)
      toast.error('Failed to load internship requests')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      await updateDoc(doc(db, 'internship_requests', id), {
        status: 'APPROVED'
      })
      toast.success('Request approved')
      fetchRequests()
    } catch (err) {
      console.error('Failed to approve', err)
      toast.error('Failed to approve request')
    }
  }

  async function handleGenerateLetter(req: any) {
    setGeneratingId(req.id)
    try {
      // Reconstruct profile prop as expected by InternshipPDF
      const mockProfile = {
        full_name: req.studentName,
        registration_no: req.regNo,
        roll_no: req.rollNo,
        email: req.email,
        phone: req.phone,
        department: req.department
      }

      const blob = await pdf(<InternshipPDF data={req.formData} profile={mockProfile} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Internship_Letter_${req.rollNo || req.studentName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Letter generated successfully!')
    } catch (err) {
      console.error('Failed to generate letter', err)
      toast.error('Failed to generate letter')
    } finally {
      setGeneratingId(null)
    }
  }

  const filteredRequests = requests.filter(req => {
    const s = searchTerm.toLowerCase()
    return (
      (req.studentName || '').toLowerCase().includes(s) ||
      (req.rollNo || '').toLowerCase().includes(s) ||
      (req.regNo || '').toLowerCase().includes(s) ||
      (req.phone || '').toLowerCase().includes(s)
    )
  })

  return (
    <>
      <Topbar title="Internship Requests" />
      <div className="content-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="page-heading">Internship Requests</h1>
            <p className="page-subheading">Manage and approve official student internship letters.</p>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <div className="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <input 
                type="text" 
                placeholder="Search by name, roll no, reg no, or mobile..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Request Details</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>Loading requests...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>No internship requests found.</td></tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.studentName || 'Unknown'}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Roll: {req.rollNo}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{req.department}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.formData.designation}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {new Date(req.formData.startDate).toLocaleDateString()} - {new Date(req.formData.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                          background: req.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                          color: req.status === 'APPROVED' ? '#166534' : '#92400e'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {req.status === 'PENDING' && (
                            <button 
                              onClick={() => handleApprove(req.id)}
                              className="btn btn-sm"
                              style={{ background: '#10B981', color: 'white', borderColor: '#10B981' }}
                            >
                              Approve
                            </button>
                          )}
                          {req.status === 'APPROVED' && (
                            <button 
                              onClick={() => handleGenerateLetter(req)}
                              className="btn btn-filled btn-sm"
                              style={{ background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' }}
                              disabled={generatingId === req.id}
                            >
                              {generatingId === req.id ? 'Generating...' : 'Generate Letter'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
