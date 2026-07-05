'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, where, orderBy } from 'firebase/firestore'
import { LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, BarChart2, Bell, Plus, Search, ChevronDown, Pencil, Trash2, RefreshCw, X, Check, Clock, MessageSquare, CreditCard, Filter, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { Topbar } from '@/components/layout/Topbar'
import { logAction } from '@/lib/logAction'



export function AdminOfferingsClient() {
  const [offerings, setOfferings] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [faculties, setFaculties] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'Board' | 'List' | 'Timeline'>('Board')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [form, setForm] = useState({
    course_id: '',
    faculty_id: '',
    batch_id: '',
    semester_id: '',
    room: '',
    due_date: '',
    notes: ''
  })
  const [creating, setCreating] = useState(false)

  // Fetch Data logic
  useEffect(() => {
    async function fetchData() {
      try {
        const [offSnap, courseSnap, facultySnap, batchSnap, semSnap] = await Promise.all([
          getDocs(query(collection(db, 'course_offerings'), orderBy('created_at', 'desc'))),
          getDocs(query(collection(db, 'courses'), orderBy('name'))),
          getDocs(query(collection(db, 'profiles'), where('role', '==', 'faculty'))),
          getDocs(query(collection(db, 'batches'), orderBy('graduation_year', 'desc'))),
          getDocs(query(collection(db, 'semesters'), orderBy('created_at', 'desc')))
        ])
        
        setOfferings(offSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setCourses(courseSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setFaculties(facultySnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
        setBatches(batchSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        setSemesters(semSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        toast.error('Failed to load offering data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const boardColumns = useMemo(() => {
    const sems = semesters.map((s, idx) => ({
      id: s.id,
      title: s.name,
      badgeColor: 'bg-[var(--surface-secondary)] text-[var(--text-primary)]'
    }));
    return sems;
  }, [semesters]);

  const openModalWithSemester = (semId: string) => {
    setForm(prev => ({ ...prev, semester_id: semId }));
    setIsModalOpen(true);
  };

  // Map to tasks
  const assignments = useMemo(() => {
    return offerings.filter(o => !searchTerm || o.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(o => {
      const f = faculties.find(fac => fac.id === o.faculty_id)
      return {
        id: o.id,
        subject: {
          name: o.course_name,
          code: o.course_code,
          dept: f?.department || 'Engineering',
          credits: 4
        },
        semester: o.semester_name || 'Semester',
        semesterId: o.semester_id,
        faculty: f ? {
          id: f.id,
          name: f.full_name,
          initials: f.full_name.split(' ').map((n:any)=>n[0]).join('').substring(0,2).toUpperCase(),
          color: 'bg-indigo-500'
        } : null,
        status: o.status || 'Unassigned',
        progress: o.progress || 0,
        dueDate: o.due_date || null,
        comments: o.comments || 0,
        raw: o
      }
    })
  }, [offerings, faculties, searchTerm])

  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter(a => a.status === 'Completed').length
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
  const overdueCount = assignments.filter(a => a.dueDate && new Date(a.dueDate) < new Date() && a.status !== 'Completed').length

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, semesterId: string) => {
    e.preventDefault()
    if (!draggedCardId) return

    const targetSem = semesters.find(s => s.id === semesterId);

    setOfferings(prev => prev.map(o => o.id === draggedCardId ? { ...o, semester_id: semesterId, semester_name: targetSem?.name } : o))
    
    try {
      await updateDoc(doc(db, 'course_offerings', draggedCardId), {
        semester_id: semesterId,
        semester_name: targetSem?.name
      })
      toast.success('Semester updated')
    } catch (err) {
      toast.error('Failed to update semester')
    }
    setDraggedCardId(null)
  }

  // Create Assignment
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const course = courses.find(c => c.id === form.course_id)
      const faculty = faculties.find(f => f.id === form.faculty_id)
      const batch = batches.find(b => b.id === form.batch_id)
      const sem = semesters.find(s => s.id === form.semester_id)

      const data = {
        course_id: form.course_id,
        faculty_id: form.faculty_id,
        batch_id: form.batch_id,
        semester_id: form.semester_id,
        due_date: form.due_date,
        notes: form.notes,
        course_name: course?.name,
        course_code: course?.code,
        faculty_name: faculty?.full_name,
        batch_name: batch?.name || `${batch?.graduation_year} Sec ${batch?.section}`,
        semester_name: sem?.name,
        status: faculty ? 'Assigned' : 'Unassigned',
        progress: 0,
        comments: 0,
        created_at: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'course_offerings'), data)
      setOfferings(prev => [{ id: docRef.id, ...data }, ...prev])
      
      toast.success('Assignment created')
      setIsModalOpen(false)
      setForm({ course_id: '', faculty_id: '', batch_id: '', semester_id: '', room: '', due_date: '', notes: '' })
    } catch (err) {
      toast.error('Failed to create assignment')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this assignment?')) return
    try {
      await deleteDoc(doc(db, 'course_offerings', id))
      setOfferings(prev => prev.filter(o => o.id !== id))
      toast.success('Assignment removed')
    } catch(e) {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}><div className="loader" style={{ margin: 'auto' }}></div></div>

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC] text-[#172B4D] font-sans">
      <Topbar title="Faculty Assignments" accentColor="#0052CC" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* TOPBAR equivalent */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--surface-primary)]">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold tracking-tight text-[#172B4D]">Assignments Board</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-[#FAFBFC] border border-[var(--border-color)] text-sm rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#0052CC] transition-colors text-[#172B4D] w-64"
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#0052CC] hover:bg-[#0047b3] text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors shadow-sm">
              <Plus size={16} />
              New Assignment
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {/* TABS & FILTERS */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 p-1 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-color)]">
              {['Board', 'List'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-[var(--surface-primary)] text-[#172B4D] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[#172B4D]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* PROGRESS SUMMARY */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">Total Assignments</div>
                <div className="text-2xl font-semibold tabular-nums text-[#172B4D]">{totalAssignments}</div>
              </div>
              <div className="w-16 h-8 flex items-end gap-1">
                {[4, 7, 5, 8, 12, 9, 14].map((h, i) => <div key={i} className="w-full bg-[#0052CC]/20 rounded-t-sm" style={{ height: `${h * 4}px` }}></div>)}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">Completion Rate</div>
                <div className="text-2xl font-semibold tabular-nums text-[#172B4D]">{completionRate}%</div>
              </div>
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#DFE1E6" strokeWidth="4" fill="none" />
                <circle cx="20" cy="20" r="16" stroke="#22C55E" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset={100 - completionRate} className="transition-all duration-1000" />
              </svg>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1">Overdue Tasks</div>
                <div className="text-2xl font-semibold tabular-nums text-[#EF4444]">{overdueCount}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* VIEWS */}
          {activeTab === 'Board' && (
            <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-360px)] min-h-[500px]">
              {boardColumns.map(col => (
                <div 
                  key={col.id} 
                  className="w-[320px] flex-shrink-0 flex flex-col bg-[#F4F5F7] rounded-xl p-3 border border-[var(--border-color)]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-[#5E6C84] uppercase tracking-wider">{col.title}</h3>
                      <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-semibold ${col.badgeColor}`}>
                        {assignments.filter(a => a.semesterId === col.id).length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {assignments.filter(a => a.semesterId === col.id).map(task => (
                      <div 
                        key={task.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-[var(--surface-primary)] p-4 rounded-xl border border-[var(--border-color)] cursor-grab active:cursor-grabbing hover:border-[#0052CC]/50 transition-colors shadow-sm ${draggedCardId === task.id ? 'opacity-50 border-dashed border-[#0052CC]' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[#5E6C84]">{task.semester}</span>
                          <div className="flex gap-1">
                            <span className="text-[0.65rem] uppercase tracking-wider text-[var(--text-tertiary)] font-mono">{task.subject.code}</span>
                            <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-sm mb-1 leading-snug text-[#172B4D]">{task.subject.name}</h4>
                        <div className="text-xs text-[var(--text-secondary)] mb-4">{task.subject.dept}</div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[var(--text-secondary)]">Progress</span>
                            <span className="font-mono tabular-nums text-[#172B4D]">{task.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${task.progress === 100 ? 'bg-[#22C55E]' : task.progress > 0 ? 'bg-[#0052CC]' : 'bg-[var(--border-strong)]'}`} style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3 mt-1">
                          <div className="flex items-center gap-3 text-[var(--text-tertiary)] text-xs">
                            <div className="flex items-center gap-1" title="Credit Hours"><CreditCard size={12} /> {task.subject.credits}</div>
                            <div className="flex items-center gap-1" title="Comments"><MessageSquare size={12} /> {task.comments}</div>
                          </div>
                          
                          {task.faculty ? (
                            <div className="flex items-center gap-2" title={task.faculty.name}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white shadow-sm ${task.faculty.color}`}>
                                {task.faculty.initials}
                              </div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[var(--text-tertiary)]" title="Unassigned">
                              <Users size={12} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button onClick={() => openModalWithSemester(col.id)} className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-secondary)] hover:text-[#172B4D] hover:bg-[var(--surface-secondary)] border border-dashed border-[var(--border-strong)] rounded-xl transition-colors mt-1">
                      <Plus size={16} /> Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'List' && (
            <div className="bg-[var(--surface-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] bg-[#FAFBFC]">
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Semester</th>
                    <th className="px-4 py-3 font-semibold">Faculty</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Progress</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {assignments.map(a => (
                    <tr key={a.id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-secondary)] transition-colors group">
                      <td className="px-4 py-3 font-medium text-[#172B4D]">{a.subject.name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] font-mono text-xs">{a.subject.code}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-[var(--surface-secondary)] text-xs text-[var(--text-secondary)] font-semibold">{a.semester}</span></td>
                      <td className="px-4 py-3">
                        {a.faculty ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white ${a.faculty.color}`}>{a.faculty.initials}</div>
                            <span className="text-[#172B4D]">{a.faculty.name}</span>
                          </div>
                        ) : <span className="text-[var(--text-tertiary)] italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-[var(--surface-secondary)] text-[var(--text-primary)]`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${a.progress === 100 ? 'bg-[#22C55E]' : 'bg-[#0052CC]'}`} style={{ width: `${a.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-mono text-[var(--text-secondary)] tabular-nums">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-[var(--text-tertiary)] hover:text-[#0052CC]"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(a.id)} className="p-1 text-[var(--text-tertiary)] hover:text-[#EF4444]"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold text-[#172B4D]">Create Assignment</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[#172B4D]"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Subject</label>
                <select required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D]">
                  <option value="">Select subject...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Batch</label>
                  <select required value={form.batch_id} onChange={e => setForm({...form, batch_id: e.target.value})} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D]">
                    <option value="">Select batch...</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name || b.graduation_year}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Semester</label>
                  <select required value={form.semester_id} onChange={e => setForm({...form, semester_id: e.target.value})} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D]">
                    <option value="">Select semester...</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D]" />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Room</label>
                  <input type="text" placeholder="e.g. 101" value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D]" />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Assign To Faculty</label>
                <select value={form.faculty_id} onChange={e => setForm({...form, faculty_id: e.target.value})} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D]">
                  <option value="">Unassigned (Optional)</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full bg-[var(--surface-primary)] border border-[var(--border-strong)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#0052CC] text-[#172B4D] resize-none" placeholder="Any specific requirements..."></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[#FAFBFC] flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] rounded-md transition-colors">Cancel</button>
              <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-medium bg-[#0052CC] hover:bg-[#0047b3] text-white rounded-md transition-colors shadow-sm disabled:opacity-50">
                {creating ? 'Creating...' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
