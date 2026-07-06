'use client'

import React, { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminShortlistPage() {
  const { user } = useAuth()
  const [driveTitle, setDriveTitle] = useState('')
  const [branches, setBranches] = useState('')
  const [minCgpa, setMinCgpa] = useState('')
  const [maxBacklogs, setMaxBacklogs] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Basic implementation of shortlisting algorithm.
      // In production with thousands of records, we'd use server-side aggregation.
      let q = collection(db, 'users') // Note: assuming 'users' holds student details or we pull from 'Profile' where role='student'
      
      const snap = await getDocs(query(q, where('role', '==', 'student')))
      let matched = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Filter locally for complex criteria
      if (minCgpa) matched = matched.filter((s: any) => parseFloat(s.cgpa) >= parseFloat(minCgpa))
      if (maxBacklogs) matched = matched.filter((s: any) => parseInt(s.backlogCount) <= parseInt(maxBacklogs))
      if (branches) {
        const branchArray = branches.split(',').map(b => b.trim().toLowerCase())
        matched = matched.filter((s: any) => s.branch && branchArray.includes(s.branch.toLowerCase()))
      }
      
      setResults(matched)
      toast.success(`Found ${matched.length} eligible students`)
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRun = async () => {
    if (!driveTitle || results.length === 0) return
    try {
      await addDoc(collection(db, 'shortlist_runs'), {
        driveTitle,
        criteria: { branches, minCgpa, maxBacklogs },
        resultStudentIds: results.map(r => r.id),
        createdBy: user?.uid,
        created_at: new Date().toISOString()
      })
      toast.success('Shortlist run saved to database')
    } catch (err) {
      toast.error('Failed to save run')
    }
  }

  return (
    <>
      <Topbar title="Automated Student Shortlisting" accentColor="#E24B4A" />
      <div className="content-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          {/* Criteria Form */}
          <div className="card">
            <h2 className="section-heading" style={{ marginBottom: '16px' }}>Filter Criteria</h2>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Placement Drive Title (for saving)</label>
                <input className="form-input" required placeholder="e.g. TCS Ninja 2024" value={driveTitle} onChange={e => setDriveTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Eligible Branches (comma separated)</label>
                <input className="form-input" placeholder="CSE, IT, ETC" value={branches} onChange={e => setBranches(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Min CGPA</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 7.5" value={minCgpa} onChange={e => setMinCgpa(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Active Backlogs</label>
                  <input className="form-input" type="number" placeholder="e.g. 0" value={maxBacklogs} onChange={e => setMaxBacklogs(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-filled" style={{ background: '#E24B4A', borderColor: '#E24B4A' }} disabled={loading}>
                {loading ? 'Searching...' : 'Run Shortlist Engine'}
              </button>
            </form>
          </div>

          {/* Results Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="section-heading">Eligible Students ({results.length})</h2>
              {results.length > 0 && (
                <button onClick={handleSaveRun} className="btn btn-ghost" style={{ color: '#E24B4A' }}>Save Snapshot</button>
              )}
            </div>
            
            {results.length === 0 ? (
              <div className="empty-state">Run the filter engine to see eligible students here.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Reg. No</th>
                      <th style={{ padding: '8px' }}>Name</th>
                      <th style={{ padding: '8px' }}>Branch</th>
                      <th style={{ padding: '8px' }}>CGPA</th>
                      <th style={{ padding: '8px' }}>Backlogs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((student, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px' }}>{student.roll_no || student.registrationNo}</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{student.full_name || student.name}</td>
                        <td style={{ padding: '8px' }}>{student.branch || student.department}</td>
                        <td style={{ padding: '8px' }}>{student.cgpa || 'N/A'}</td>
                        <td style={{ padding: '8px' }}>{student.backlogCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
