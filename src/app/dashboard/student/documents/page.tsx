'use client'

import React, { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase/config'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export default function StudentDocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('10TH_MARK_SHEET')

  useEffect(() => {
    if (!user?.uid) return
    const fetchDocs = async () => {
      const q = query(collection(db, 'document_uploads'), where('studentId', '==', user.uid))
      const snap = await getDocs(q)
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchDocs()
  }, [user])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      // Mock upload for now, ideally upload to S3/Firebase Storage and get URL
      const mockUrl = `https://storage.igit.edu/docs/${user?.uid}/${file.name}`
      
      const newDoc = {
        studentId: user?.uid,
        documentType: docType,
        fileUrl: mockUrl,
        status: 'PENDING',
        created_at: new Date().toISOString()
      }
      const ref = await addDoc(collection(db, 'document_uploads'), newDoc)
      setDocuments([...documents, { id: ref.id, ...newDoc }])
      toast.success('Document uploaded for verification')
      setFile(null)
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Topbar title="Document Verification Queue" />
      <div className="content-container">
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Upload Form */}
          <div className="card">
            <h2 className="section-heading" style={{ marginBottom: '16px' }}>Upload New Document</h2>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select className="form-input" value={docType} onChange={e => setDocType(e.target.value)}>
                  <option value="10TH_MARK_SHEET">10th Mark Sheet</option>
                  <option value="12TH_MARK_SHEET">12th Mark Sheet</option>
                  <option value="BTECH_TRANSCRIPT">B.Tech Transcript</option>
                  <option value="AADHAAR_CARD">Aadhaar Card</option>
                  <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select File (PDF only)</label>
                <input type="file" accept=".pdf" className="form-input" required onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <button type="submit" className="btn btn-filled" disabled={uploading || !file}>
                {uploading ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </form>
          </div>

          {/* Document List */}
          <div className="card">
            <h2 className="section-heading" style={{ marginBottom: '16px' }}>My Documents</h2>
            {loading ? <p>Loading...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {documents.length === 0 && <p className="secondary-text">No documents uploaded yet.</p>}
                {documents.map(doc => (
                  <div key={doc.id} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '14px' }}>{doc.documentType.replace(/_/g, ' ')}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Submitted: {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {doc.status === 'PENDING' && <span className="badge badge-neutral">Pending Review</span>}
                      {doc.status === 'VERIFIED' && <span className="badge badge-success">Verified ✅</span>}
                      {doc.status === 'REJECTED' && <span className="badge badge-error">Rejected ❌</span>}
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
