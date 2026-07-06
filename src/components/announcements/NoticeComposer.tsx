'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { pdf } from '@react-pdf/renderer'

import { HTMLNoticePreview } from '../pdf/HTMLNoticePreview'
import { NoticePDFTemplate } from '../pdf/NoticePDFTemplate'

export function NoticeComposer({ accentColor, onCancel }: { accentColor: string, onCancel: () => void }) {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'EMAIL' | 'MESSAGE'>('DETAILS')
  const [creating, setCreating] = useState(false)
  const [publishProgress, setPublishProgress] = useState(0)
  const [publishStep, setPublishStep] = useState('')
  const [etaSeconds, setEtaSeconds] = useState(0)

  // Targeting State
  const [targetType, setTargetType] = useState<'ALL' | 'BATCH' | 'CUSTOM'>('ALL')
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [batchSendMethod, setBatchSendMethod] = useState<'GROUP' | 'INDIVIDUAL'>('GROUP')
  
  // Notice Body State
  const [refNo, setRefNo] = useState('')
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0])
  const [forTo, setForTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [hasLink, setHasLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [nbNote, setNbNote] = useState('')
  const [shortBody, setShortBody] = useState('')
  const [undersigned, setUndersigned] = useState(profile?.full_name || 'Prof. In-Charge')
  const [designation, setDesignation] = useState('Career Development Centre, IGIT')
  const [department, setDepartment] = useState('Career Development Centre')
  const [attachment, setAttachment] = useState<File | null>(null)

  // Custom Audience State
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomUsers, setSelectedCustomUsers] = useState<string[]>([])

  // Drag & Drop Coordinates State (Undo/Redo History)
  const initialPositions = {
    header: { x: 0, y: 0 },
    refRow: { x: 0, y: 0 },
    title: { x: 0, y: 0 },
    forTo: { x: 0, y: 0 },
    subject: { x: 0, y: 0 },
    body: { x: 0, y: 0 },
    link: { x: 0, y: 0 },
    signature: { x: 0, y: 0 },
    nbNote: { x: 0, y: 0 },
  }
  
  const [history, setHistory] = useState([initialPositions])
  const [historyIndex, setHistoryIndex] = useState(0)
  const positions = history[historyIndex]

  const setPositions = (updateFn: any) => {
    const newPos = typeof updateFn === 'function' ? updateFn(positions) : updateFn
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newPos)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => setHistoryIndex(Math.max(0, historyIndex - 1))
  const redo = () => setHistoryIndex(Math.min(history.length - 1, historyIndex + 1))

  // Channels
  const [sendEmail, setSendEmail] = useState(false)
  const [sendSms, setSendSms] = useState(false)
  const [sendWhatsapp, setSendWhatsapp] = useState(false)

  const [batches, setBatches] = useState<any[]>([])
  
  // Custom Zoom Control
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    // Fetch latest notice for auto-incrementing Ref No
    const q = query(collection(db, 'notices'), orderBy('created_at', 'desc'), limit(1))
    getDocs(q).then(snap => {
      if (!snap.empty) {
        const lastNotice = snap.docs[0].data()
        if (lastNotice.refNo) {
          const match = lastNotice.refNo.match(/^(.*?)(\d+)$/)
          if (match) {
            const prefix = match[1]
            const num = parseInt(match[2], 10)
            setRefNo(`${prefix}${num + 1}`)
          } else {
            setRefNo(`${lastNotice.refNo}-1`)
          }
        }
      } else {
        setRefNo(`IGIT/CDC/${new Date().getFullYear()}/01`)
      }
    }).catch(err => console.error("Failed to fetch last notice", err))

    getDocs(collection(db, 'batches')).then(snap => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  useEffect(() => {
    if (targetType === 'CUSTOM' && allStudents.length === 0) {
      getDocs(query(collection(db, 'profiles'), where('role', '==', 'student'))).then(snap => {
        setAllStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }).catch(err => console.error("Failed to fetch students", err))
    }
  }, [targetType])

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      // 1. ALWAYS Generate PDF & Upload First
      setPublishStep('Generating PDF document...')
      setPublishProgress(20)
      setEtaSeconds(4)
      
      const docUI = <NoticePDFTemplate 
        refNo={refNo} dateIssued={dateIssued} forTo={forTo} 
        subject={subject} body={body} undersigned={undersigned} 
        designation={designation} department={department} nbNote={nbNote} 
        positions={positions} hasLink={hasLink} linkUrl={linkUrl}
      />;
      const pdfBlob = await pdf(docUI).toBlob();
      
      setPublishStep('Uploading securely to storage...')
      setPublishProgress(50)
      setEtaSeconds(3)
      
      const formData = new FormData();
      formData.append('file', pdfBlob);
      formData.append('filename', `Notice_${refNo.replace(/\//g, '_')}.pdf`);
      
      const uploadRes = await fetch('/api/github/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      const mediaUrl = uploadData.url;

      // 2. Create Notice in Database with mediaUrl
      setPublishStep('Saving notice to database...')
      setPublishProgress(70)
      setEtaSeconds(2)

      const noticeData = {
        refNo,
        title: subject,
        subject,
        body,
        forTo,
        dateIssued,
        undersigned,
        designation,
        department,
        linkUrl: hasLink ? linkUrl : null,
        nbNote,
        mediaUrl, // PDF is always attached now
        status: 'PUBLISHED',
        createdBy: user?.uid,
        created_at: new Date().toISOString()
      }
      const noticeRef = await addDoc(collection(db, 'notices'), noticeData)

      // 3. Create Target
      const targetData = {
        noticeId: noticeRef.id,
        targetType,
        batchYears: selectedBatches,
        customUsers: selectedCustomUsers,
      }
      await addDoc(collection(db, 'notice_targets'), targetData)

      // 4. Handle Broadcasting
      if (sendWhatsapp) {
        try {
          setPublishStep('Resolving target audiences...')
          setPublishProgress(80)
          setEtaSeconds(2)

          // Resolve phone numbers and group IDs
          let phones: string[] = [];
          let groups: string[] = [];
          const usersRef = collection(db, 'profiles');

          if (targetType === 'ALL') {
            const allUsers = await getDocs(query(usersRef, where('role', '==', 'student')));
            phones = allUsers.docs.map(d => d.data().phone).filter(Boolean);
          } else if (targetType === 'BATCH' && selectedBatches.length > 0) {
            if (batchSendMethod === 'GROUP') {
              // Send to the official WhatsApp Groups for these batches
              const targetBatchDocs = batches.filter(b => selectedBatches.some(y => String(y) === String(b.graduation_year)));
              const batchGroupIds = targetBatchDocs.map(b => b.whatsappGroupId).filter(Boolean);
              groups.push(...batchGroupIds);
            } else {
              // Send individual DMs to every student in these batches
              const queryYears = selectedBatches.map(y => String(y));
              const queryYearsNumbers = selectedBatches.map(y => Number(y));
              const allQueryYears = [...queryYears, ...queryYearsNumbers];
              let batchUsersDocs: any[] = [];
              for (let i = 0; i < allQueryYears.length; i += 10) {
                const chunk = allQueryYears.slice(i, i + 10);
                const snap = await getDocs(query(usersRef, where('role', '==', 'student'), where('graduation_year', 'in', chunk)));
                batchUsersDocs.push(...snap.docs);
              }
              const batchPhones = batchUsersDocs.map(d => d.data().phone).filter(Boolean);
              phones.push(...batchPhones);
            }
          } else if (targetType === 'CUSTOM' && selectedCustomUsers.length > 0) {
            phones = allStudents
              .filter(s => selectedCustomUsers.includes(s.id))
              .map(s => s.phone)
              .filter(Boolean);
          }

          if (phones.length === 0 && groups.length === 0) {
            throw new Error('No users or groups found for the selected target audience.');
          }

          setPublishStep('Queueing WhatsApp broadcast...')
          setPublishProgress(90)
          setEtaSeconds(1)

          // Deduplicate phones and groups to prevent double-sending
          const uniquePhones = Array.from(new Set(phones));
          const uniqueGroups = Array.from(new Set(groups));

          const res = await fetch('/api/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phones: uniquePhones,
              groups: uniqueGroups,
              subject,
              body: shortBody || body,
              hasLink,
              linkUrl: hasLink ? linkUrl : null,
              mediaUrl,
              noticeId: noticeRef.id,
            })
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(`Broadcast failed: ${data.error}`);
          } else {
            setPublishProgress(100)
            setPublishStep('Complete!')
            setEtaSeconds(0)
            toast.success(`Broadcast queued for ${uniquePhones.length} phones & ${uniqueGroups.length} groups!`);
          }
        } catch (waErr: any) {
          console.error('Broadcast error:', waErr);
          toast.error(`Broadcast Error: ${waErr.message}`);
        }
      }

      if (!sendWhatsapp) {
        setPublishProgress(100)
        setPublishStep('Complete!')
        setEtaSeconds(0)
        toast.success('Notice published successfully!')
      }
      onCancel()
    } catch (err: any) {
      toast.error('Failed to publish notice')
    } finally {
      // Delay closing modal slightly if successful so they see 100%
      setTimeout(() => setCreating(false), 500)
    }
  }

  const toggleBatch = (year: string) => {
    setSelectedBatches(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year])
  }

  const uniqueYears = Array.from(new Set(batches.map(b => b.graduation_year).filter(Boolean))).sort()

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 90px)', minHeight: '700px' }}>
      
      {/* LEFT & MIDDLE: Form Controls */}
      <div className="card" style={{ flex: '0 0 650px', display: 'flex', gap: '24px', padding: '24px', overflowY: 'auto' }}>
        
        {/* LEFT: Target Audience Panel */}
        <div style={{ flex: '0 0 200px', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Target Audience</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <input type="radio" checked={targetType === 'ALL'} onChange={() => setTargetType('ALL')} />
              All Colleges
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <input type="radio" checked={targetType === 'BATCH'} onChange={() => setTargetType('BATCH')} />
              Specific Batches
            </label>
            
            {targetType === 'BATCH' && (
              <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery Method</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px', cursor: 'pointer' }}>
                    <input type="radio" checked={batchSendMethod === 'GROUP'} onChange={() => setBatchSendMethod('GROUP')} />
                    WhatsApp Group
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" checked={batchSendMethod === 'INDIVIDUAL'} onChange={() => setBatchSendMethod('INDIVIDUAL')} />
                    Individual Direct Messages
                  </label>
                </div>
                {uniqueYears.map(year => (
                  <label key={year} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input type="checkbox" checked={selectedBatches.includes(year as string)} onChange={() => toggleBatch(year as string)} />
                    {year} Batch
                  </label>
                ))}
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <input type="radio" checked={targetType === 'CUSTOM'} onChange={() => setTargetType('CUSTOM')} />
              Custom Group
            </label>

            {targetType === 'CUSTOM' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Search name, roll no, reg no..." 
                  className="form-input" 
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px' }}>
                  {allStudents.filter(s => {
                    if (!searchTerm) return true;
                    const q = searchTerm.toLowerCase();
                    return (s.full_name?.toLowerCase().includes(q) || s.roll_no?.toLowerCase().includes(q) || s.registration_no?.toLowerCase().includes(q));
                  }).map(student => (
                    <label key={student.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCustomUsers.includes(student.id)} 
                        onChange={() => {
                          setSelectedCustomUsers(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id])
                        }} 
                      />
                      <div style={{ lineHeight: 1.2 }}>
                        <div>{student.full_name || 'Unknown'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {student.roll_no || student.registration_no || 'No ID'} | {student.department || 'N/A'}
                        </div>
                      </div>
                    </label>
                  ))}
                  {allStudents.length === 0 && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>Loading students...</div>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedCustomUsers.length} selected
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Composer Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button className={`btn btn-sm ${activeTab === 'DETAILS' ? 'btn-filled' : 'btn-ghost'}`} style={activeTab === 'DETAILS' ? { background: accentColor, borderColor: accentColor } : {}} onClick={() => setActiveTab('DETAILS')}>Content</button>
            <button className={`btn btn-sm ${activeTab === 'EMAIL' ? 'btn-filled' : 'btn-ghost'}`} style={activeTab === 'EMAIL' ? { background: accentColor, borderColor: accentColor } : {}} onClick={() => setActiveTab('EMAIL')}>Email</button>
            <button className={`btn btn-sm ${activeTab === 'MESSAGE' ? 'btn-filled' : 'btn-ghost'}`} style={activeTab === 'MESSAGE' ? { background: accentColor, borderColor: accentColor } : {}} onClick={() => setActiveTab('MESSAGE')}>SMS/WA</button>
          </div>

          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            
            {activeTab === 'DETAILS' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Ref No. (Auto / Custom)</label>
                    <input className="form-input" required value={refNo} onChange={e => setRefNo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Issued</label>
                    <input type="date" className="form-input" required value={dateIssued} onChange={e => setDateIssued(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">For/To</label>
                  <input className="form-input" required placeholder="e.g. All 2024 Batch Students" value={forTo} onChange={e => setForTo(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" required value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Body</label>
                  <textarea className="form-input" rows={6} required value={body} onChange={e => setBody(e.target.value)} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Undersigned (Name)</label>
                    <input className="form-input" required value={undersigned} onChange={e => setUndersigned(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input className="form-input" required value={designation} onChange={e => setDesignation(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" required value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">N.B. (Note)</label>
                  <input className="form-input" value={nbNote} onChange={e => setNbNote(e.target.value)} />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}>
                    <input type="checkbox" checked={hasLink} onChange={e => setHasLink(e.target.checked)} />
                    Include Link
                  </label>
                  {hasLink && <input className="form-input" type="url" placeholder="https://" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />}
                </div>
              </>
            )}

            {activeTab === 'EMAIL' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
                  Enable Email Broadcast
                </label>
                {sendEmail && (
                  <div style={{ opacity: 0.8, pointerEvents: 'none' }}>
                    <div className="form-group">
                      <label className="form-label">Email Subject</label>
                      <input className="form-input" value={subject} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Body (Uses Notice Body)</label>
                      <textarea className="form-input" rows={6} value={body} readOnly />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'MESSAGE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} />
                  Enable SMS (DLT Gateway)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)} />
                  Enable WhatsApp/Telegram
                </label>
                {(sendSms || sendWhatsapp) && (
                  <div className="form-group">
                    <label className="form-label">Short Message Body</label>
                    <textarea className="form-input" rows={3} placeholder="Type a concise version..." required value={shortBody} onChange={e => setShortBody(e.target.value)} />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
              <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-filled" disabled={creating} style={{ background: accentColor, borderColor: accentColor }}>
                {creating ? 'Publishing...' : 'Publish & Broadcast'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT: Live PDF Preview */}
      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Live Document Preview</span>
          
          {/* Custom Zoom & Undo Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={undo} disabled={historyIndex === 0} className="btn btn-sm btn-ghost" title="Undo" style={{ padding: '2px 8px', fontSize: '13px' }}>↶ Undo</button>
              <button onClick={redo} disabled={historyIndex === history.length - 1} className="btn btn-sm btn-ghost" title="Redo" style={{ padding: '2px 8px', fontSize: '13px' }}>↷ Redo</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="btn btn-sm btn-ghost" style={{ padding: '2px 8px', fontSize: '14px' }}>-</button>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', width: '40px', textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(250, z + 25))} className="btn btn-sm btn-ghost" style={{ padding: '2px 8px', fontSize: '14px' }}>+</button>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, background: '#e5e7eb', overflow: 'hidden' }}>
          <HTMLNoticePreview 
            refNo={refNo}
            dateIssued={dateIssued}
            forTo={forTo}
            subject={subject}
            body={body}
            undersigned={undersigned}
            designation={designation}
            department={department}
            nbNote={nbNote}
            zoom={zoom}
            positions={positions}
            setPositions={setPositions}
            hasLink={hasLink}
            linkUrl={linkUrl}
          />
        </div>
      </div>

      {creating && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="card" style={{ width: '400px', textAlign: 'center', padding: '32px' }}>
            <div style={{ marginBottom: '16px', fontWeight: 600, fontSize: '18px' }}>
              Publishing Notice...
            </div>
            
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {publishStep}
            </div>

            <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ 
                height: '100%', 
                width: `${publishProgress}%`, 
                background: accentColor,
                transition: 'width 0.3s ease-out'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <span>{publishProgress}% Complete</span>
              {etaSeconds > 0 && <span>ETA: {etaSeconds}s</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
