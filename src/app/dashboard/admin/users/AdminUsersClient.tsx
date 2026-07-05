'use client'

import { useState, useMemo } from 'react'
import { db } from '@/lib/firebase/config'
import { doc, updateDoc, setDoc } from 'firebase/firestore'
import { logAction } from '@/lib/logAction'
import toast from 'react-hot-toast'
import { Square, CheckSquare, Building, Mail, Briefcase, Hash, User, Calendar, MoreHorizontal, GraduationCap, Copy } from 'lucide-react'
import type { Profile, Department, Batch, UserRole } from '@/types'

const ROLES: UserRole[] = ['admin', 'hod', 'faculty', 'student', 'alumni']
const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'badge-admin',
  hod: 'badge-hod',
  faculty: 'badge-faculty',
  student: 'badge-student',
  alumni: 'badge-alumni',
}

interface Props {
  users: (Profile & { department?: { name: string; code: string }; batch?: { graduation_year: number; section: string } })[]
  departments: Pick<Department, 'id' | 'name' | 'code'>[]
  batches: Batch[]
}

export function AdminUsersClient({ users: initialUsers, departments, batches }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [view, setView] = useState<'all' | 'pending'>('all')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Create user form state
  const [newUser, setNewUser] = useState({
    full_name: '', email: '', role: 'student' as UserRole,
    dept_id: 'CE', batch_id: '', roll_no: '', registration_no: '', designation: '',
  })
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchView = view === 'all' || u.verification_status === 'pending'
      const matchSearch = !search ||
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.roll_no || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.registration_no || '').toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      return matchView && matchSearch && matchRole
    })
  }, [users, search, roleFilter, view])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      // Generate a document ID (we'll use a random one since we don't have Auth UID yet)
      // Or better: In a static app with no functions, we create the PROFILE first.
      // When the user SIGNS UP with this email, the handleSignUp logic will find/link it.
      
      const tempId = Math.random().toString(36).substring(2, 15)
      const userRef = doc(db, 'profiles', tempId)

      const profileData: Profile = {
        id: tempId,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        dept_id: newUser.dept_id || 'CE',
        batch_id: newUser.batch_id || null,
        roll_no: newUser.roll_no || null,
        registration_no: newUser.registration_no || null,
        designation: newUser.designation || null,
        is_active: true,
        verification_status: 'verified',
        current_company: null,
        current_job_title: null,
        must_change_password: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: null,
        avatar_url: null,
        photo_url: null,
        last_login: null,
        graduation_year: null
      }

      await setDoc(userRef, profileData)
      
      setUsers(prev => [profileData, ...prev])

      await logAction({
        action: 'created',
        module: 'users',
        description: `Created ${newUser.role} profile for ${newUser.full_name} (${newUser.email}). Note: User must still sign up to create credentials.`,
        targetTable: 'profiles',
        targetId: tempId,
        newValue: { email: newUser.email, role: newUser.role },
      })

      toast.success(`Profile created! Now ask ${newUser.full_name} to Sign Up using ${newUser.email}`)
      setShowCreate(false)
      setNewUser({ full_name: '', email: '', role: 'student', dept_id: '', batch_id: '', roll_no: '', registration_no: '', designation: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleActive(user: Profile) {
    try {
      const userRef = doc(db, 'profiles', user.id);
      await updateDoc(userRef, {
        is_active: !user.is_active
      });

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))

      await logAction({
        action: 'updated',
        module: 'users',
        description: `${!user.is_active ? 'Activated' : 'Deactivated'} account of ${user.full_name}`,
        targetTable: 'profiles',
        targetId: user.id,
        oldValue: { is_active: user.is_active },
        newValue: { is_active: !user.is_active },
      })

      toast.success(`Account ${!user.is_active ? 'activated' : 'deactivated'}`)
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  async function handleVerify(user: Profile, status: 'verified' | 'rejected') {
    if (status === 'rejected' && !rejectionReason) {
      setRejectingId(user.id)
      return
    }

    try {
      const userRef = doc(db, 'profiles', user.id);
      const updateData = {
        verification_status: status,
        is_active: status === 'verified',
        rejection_reason: status === 'rejected' ? rejectionReason : null
      };

      await updateDoc(userRef, updateData);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updateData } : u))

      await logAction({
        action: 'updated',
        module: 'users',
        description: `Profile verification ${status} for ${user.full_name}`,
        targetTable: 'profiles',
        targetId: user.id,
        newValue: updateData,
      })

      toast.success(`User ${status}`)
      setRejectingId(null)
      setRejectionReason('')
    } catch (error: any) {
      toast.error('Failed to verify user')
    }
  }

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard', { duration: 2000 })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(u => u.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '24px' }}>
        <button 
          onClick={() => setView('all')} 
          style={{ padding: '12px 0 10px', fontSize: '14px', fontWeight: 600, borderBottom: view === 'all' ? '2px solid #E24B4A' : 'none', color: view === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          All Accounts
        </button>
        <button 
          onClick={() => setView('pending')} 
          style={{ padding: '12px 0 10px', fontSize: '14px', fontWeight: 600, borderBottom: view === 'pending' ? '2px solid #E24B4A' : 'none', color: view === 'pending' ? 'var(--text-primary)' : 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Pending Verification
          {users.filter(u => u.verification_status === 'pending').length > 0 && (
            <span style={{ background: '#E24B4A', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>
              {users.filter(u => u.verification_status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <div className="section-row" style={{ marginBottom: '20px' }}>
        <div>
          <div className="page-title">Users</div>
          <p className="secondary-text">{users.length} total accounts</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowBulk(true)} className="btn btn-outlined" style={{ '--role-accent': '#E24B4A' } as React.CSSProperties}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Bulk import CSV
          </button>
          <button onClick={() => setShowCreate(true)} className="btn btn-filled" style={{ background: '#E24B4A', borderColor: '#E24B4A' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Add user
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="search-input" style={{ flex: '1', minWidth: '200px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="var(--text-tertiary)" strokeWidth="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            placeholder="Search by name, email, or roll no."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all', ...ROLES] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`btn btn-sm ${roleFilter === role ? 'btn-filled' : 'btn-ghost'}`}
              style={roleFilter === role ? { background: '#E24B4A', borderColor: '#E24B4A', color: 'white' } : {}}
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface-primary)', borderRadius: '8px', border: '1px solid #E2E8F0', overflowX: 'auto' }}>
        <table className="data-table spreadsheet-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center', cursor: 'pointer', borderRight: '1px solid #E2E8F0' }} onClick={toggleSelectAll}>
                {selectedIds.size === filtered.length && filtered.length > 0 ? (
                  <CheckSquare size={16} color="#0EA5E9" />
                ) : (
                  <Square size={16} color="#CBD5E1" />
                )}
              </th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Hash size={14} /> ID</div></th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Full Name</div></th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={14} /> Role</div></th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Email</div></th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} /> Status</div></th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Last Login</div></th>
              <th style={{ borderRight: '1px solid #E2E8F0' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><GraduationCap size={14} /> Details</div></th>
              <th style={{ width: '40px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const isSelected = selectedIds.has(user.id)
              const roleColors: Record<string, string> = {
                admin: '#EF4444', // Red
                hod: '#A855F7', // Purple
                faculty: '#22C55E', // Green
                student: '#3B82F6', // Blue
                alumni: '#F97316', // Orange
              }
              const displayId = user.roll_no || user.registration_no || user.id.slice(0, 8).toUpperCase()
              
              return (
                <tr key={user.id} style={{ background: isSelected ? 'var(--surface-secondary)' : 'transparent' }}>
                  <td style={{ textAlign: 'center', cursor: 'pointer', borderRight: '1px solid #E2E8F0' }} onClick={() => toggleSelect(user.id)}>
                    {isSelected ? (
                      <CheckSquare size={16} color="#0EA5E9" />
                    ) : (
                      <Square size={16} color="#E2E8F0" />
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 500, borderRight: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {displayId}
                      <button onClick={() => handleCopy(displayId)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }}><Copy size={12} /></button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {user.full_name || '—'}
                      <button onClick={() => handleCopy(user.full_name || '')} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }}><Copy size={12} /></button>
                    </div>
                  </td>
                  <td style={{ borderRight: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: roleColors[user.role] || 'var(--text-tertiary)' }} />
                      <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-primary)' }}>{user.role}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', borderRight: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {user.email}
                      <button onClick={() => handleCopy(user.email || '')} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }}><Copy size={12} /></button>
                    </div>
                  </td>
                  <td style={{ borderRight: '1px solid #E2E8F0' }}>
                    <select 
                      value={user.is_active ? 'active' : 'inactive'}
                      onChange={(e) => {
                        const newActive = e.target.value === 'active'
                        if (user.is_active !== newActive) {
                          handleToggleActive(user)
                        }
                      }}
                      style={{ 
                        padding: '4px 28px 4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: 600,
                        backgroundColor: user.is_active ? '#0F6E56' : '#E24B4A',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23FFFFFF" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 6px center'
                      }}
                    >
                      <option value="active" style={{ background: 'var(--surface-primary)', color: 'var(--text-primary)', fontWeight: 500 }}>✓ Active</option>
                      <option value="inactive" style={{ background: 'var(--surface-primary)', color: 'var(--text-primary)', fontWeight: 500 }}>✕ Inactive</option>
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', borderRight: '1px solid #E2E8F0' }}>{timeAgo(user.last_login)}</td>
                  <td style={{ color: 'var(--text-secondary)', borderRight: '1px solid #E2E8F0' }}>
                    {user.role === 'student' ? (
                      user.batch?.graduation_year ? `Batch ${user.batch.graduation_year}` : 'Student'
                    ) : user.role === 'alumni' ? (
                      user.current_company || 'Alumni'
                    ) : (
                      user.designation || 'Faculty'
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No users match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <div
            className="card card-lg"
            style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="section-heading">Create account</h2>
              <button className="btn btn-ghost" style={{ padding: '4px' }} onClick={() => setShowCreate(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" required value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" className="form-input" required value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              {newUser.role === 'student' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <select className="form-input" value={newUser.batch_id} onChange={e => setNewUser(p => ({ ...p, batch_id: e.target.value }))}>
                      <option value="">— Select batch —</option>
                      {batches.filter(b => b.dept_id === 'CE').map(b => (
                        <option key={b.id} value={b.id}>{b.graduation_year} — Section {b.section}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll number (used as default password)</label>
                    <input className="form-input" value={newUser.roll_no} onChange={e => setNewUser(p => ({ ...p, roll_no: e.target.value }))} placeholder="e.g. 21CS001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration number</label>
                    <input className="form-input" value={newUser.registration_no} onChange={e => setNewUser(p => ({ ...p, registration_no: e.target.value }))} placeholder="e.g. 2101105001" />
                  </div>
                </>
              )}
              {['faculty', 'hod'].includes(newUser.role) && (
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input className="form-input" value={newUser.designation} onChange={e => setNewUser(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Assistant Professor" />
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-filled" style={{ flex: 1, background: '#E24B4A', borderColor: '#E24B4A' }} disabled={creating}>
                  {creating ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectingId && (
        <div className="modal-overlay" onClick={() => setRejectingId(null)}>
          <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
             <h2 className="section-heading">Reject Verification</h2>
             <p className="secondary-text" style={{ marginBottom: '16px' }}>Provide a reason for rejection (this will be shown to the user).</p>
             <textarea 
               className="form-input" 
               rows={3} 
               value={rejectionReason} 
               onChange={e => setRejectionReason(e.target.value)}
               placeholder="e.g. Invalid roll number or batch selection."
             />
             <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setRejectingId(null)}>Cancel</button>
                <button 
                  className="btn btn-filled" 
                  style={{ flex: 1, background: '#E74C3C', borderColor: '#E74C3C' }}
                  onClick={() => {
                    const user = users.find(u => u.id === rejectingId)
                    if (user) handleVerify(user, 'rejected')
                  }}
                >
                  Confirm Reject
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
