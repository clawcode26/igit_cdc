'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, BarChart2, Bell,
  Plus, Search, ChevronDown, Pencil, Trash2, RefreshCw, X, Check, Clock,
  MessageSquare, CreditCard, Filter, MoreHorizontal
} from 'lucide-react';

// --- DUMMY DATA ---
const DUMMY_SUBJECTS = [
  { code: 'CS301', name: 'Database Systems', dept: 'Computer Science', credits: 4 },
  { code: 'CE405', name: 'Structural Analysis', dept: 'Civil Engg', credits: 3 },
  { code: 'ME201', name: 'Thermodynamics', dept: 'Mechanical Engg', credits: 4 },
  { code: 'EE101', name: 'Basic Electrical', dept: 'Electrical Engg', credits: 3 },
  { code: 'HS102', name: 'Professional Ethics', dept: 'Humanities', credits: 2 },
];

const DUMMY_FACULTY = [
  { id: 'f1', name: 'Dr. Sarah Connor', initials: 'SC', color: 'bg-indigo-500', dept: 'Computer Science' },
  { id: 'f2', name: 'Prof. John Smith', initials: 'JS', color: 'bg-emerald-500', dept: 'Civil Engg' },
  { id: 'f3', name: 'Dr. Emily Chen', initials: 'EC', color: 'bg-amber-500', dept: 'Mechanical Engg' },
  { id: 'f4', name: 'Dr. Alan Turing', initials: 'AT', color: 'bg-rose-500', dept: 'Computer Science' },
];

const INITIAL_ASSIGNMENTS = [
  { id: '1', subject: DUMMY_SUBJECTS[0], faculty: null, semester: 'Sem 5', status: 'Unassigned', progress: 0, dueDate: 'Aug 01, 2026', comments: 0 },
  { id: '2', subject: DUMMY_SUBJECTS[1], faculty: DUMMY_FACULTY[1], semester: 'Sem 7', status: 'Assigned', progress: 10, dueDate: 'Aug 15, 2026', comments: 2 },
  { id: '3', subject: DUMMY_SUBJECTS[2], faculty: DUMMY_FACULTY[2], semester: 'Sem 3', status: 'In Progress', progress: 45, dueDate: 'Sep 01, 2026', comments: 5 },
  { id: '4', subject: DUMMY_SUBJECTS[3], faculty: DUMMY_FACULTY[3], semester: 'Sem 1', status: 'Completed', progress: 100, dueDate: 'Jul 20, 2026', comments: 12 },
  { id: '5', subject: DUMMY_SUBJECTS[4], faculty: DUMMY_FACULTY[0], semester: 'Sem 5', status: 'In Progress', progress: 70, dueDate: 'Oct 10, 2026', comments: 1 },
  { id: '6', subject: { code: 'CS402', name: 'Machine Learning', dept: 'Computer Science', credits: 4 }, faculty: null, semester: 'Sem 7', status: 'Unassigned', progress: 0, dueDate: 'Aug 01, 2026', comments: 0 },
  { id: '7', subject: { code: 'CE302', name: 'Fluid Mechanics', dept: 'Civil Engg', credits: 4 }, faculty: DUMMY_FACULTY[1], semester: 'Sem 5', status: 'Assigned', progress: 0, dueDate: 'Aug 20, 2026', comments: 0 },
  { id: '8', subject: { code: 'EE305', name: 'Control Systems', dept: 'Electrical Engg', credits: 3 }, faculty: DUMMY_FACULTY[2], semester: 'Sem 5', status: 'Completed', progress: 100, dueDate: 'Jul 25, 2026', comments: 3 },
  { id: '9', subject: { code: 'HS201', name: 'Economics', dept: 'Humanities', credits: 3 }, faculty: DUMMY_FACULTY[0], semester: 'Sem 3', status: 'In Progress', progress: 20, dueDate: 'Oct 01, 2026', comments: 4 },
];

const COLUMNS = [
  { id: 'Unassigned', title: 'Unassigned', badgeColor: 'bg-slate-700 text-slate-300' },
  { id: 'Assigned', title: 'Assigned', badgeColor: 'bg-[#5B7FFF] text-white' },
  { id: 'In Progress', title: 'In Progress', badgeColor: 'bg-amber-500 text-white' },
  { id: 'Completed', title: 'Completed', badgeColor: 'bg-green-500 text-white' },
];

export default function DemoDashboard() {
  const [activeTab, setActiveTab] = useState<'Board' | 'List' | 'Timeline'>('Board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  // Stats
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'Completed').length;
  const completionRate = Math.round((completedAssignments / totalAssignments) * 100) || 0;
  const overdueCount = 2; // Dummy stat

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedCardId) return;
    setAssignments(prev => prev.map(a => a.id === draggedCardId ? { ...a, status, progress: status === 'Completed' ? 100 : a.progress } : a));
    setDraggedCardId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden text-[#F1F5F9] font-sans" style={{ background: '#0F1117' }}>
      
      {/* SIDEBAR */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col border-r border-[#2A2D36]" style={{ background: '#1C1F26' }}>
        <div className="h-16 flex items-center px-6 border-b border-[#2A2D36]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#5B7FFF] flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">AcadAdmin</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'assignments', icon: BookOpen, label: 'Assignments', active: true },
            { id: 'faculty', icon: Users, label: 'Faculty' },
            { id: 'subjects', icon: BookOpen, label: 'Subjects' },
            { id: 'semesters', icon: Calendar, label: 'Semesters' },
            { id: 'reports', icon: BarChart2, label: 'Reports' },
          ].map(item => (
            <button key={item.id} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${item.active ? 'bg-[#5B7FFF]/10 text-[#5B7FFF] border-l-2 border-[#5B7FFF]' : 'text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#2A2D36]'}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2A2D36] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-xs">AD</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Admin User</div>
            <div className="text-xs text-[#64748B] truncate">admin@igitsarang.ac.in</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOPBAR */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-[#2A2D36]" style={{ background: '#1C1F26' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold tracking-tight">Faculty Assignments</h1>
            <span className="text-[#64748B]">/</span>
            <span className="text-sm text-[#64748B]">Current Semester</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[#0F1117] border border-[#2A2D36] text-sm rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#5B7FFF] transition-colors text-[#F1F5F9] w-64"
              />
            </div>
            <button className="text-[#64748B] hover:text-[#F1F5F9] transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#EF4444]"></span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#5B7FFF] hover:bg-[#4a6cee] text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors shadow-sm shadow-[#5B7FFF]/20">
              <Plus size={16} />
              New Assignment
            </button>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#2A2D36] scrollbar-track-transparent">
          
          {/* TABS & FILTERS */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 p-1 bg-[#1C1F26] rounded-lg border border-[#2A2D36]">
              {['Board', 'List', 'Timeline'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-[#2A2D36] text-[#F1F5F9] shadow-sm' : 'text-[#64748B] hover:text-[#F1F5F9]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 text-sm text-[#64748B] border border-[#2A2D36] bg-[#1C1F26] px-3 py-1.5 rounded-md hover:text-[#F1F5F9] transition-colors">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          {/* PROGRESS SUMMARY */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-[#2A2D36] bg-[#1C1F26] flex items-center justify-between">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1">Total Assignments</div>
                <div className="text-2xl font-semibold tabular-nums">{totalAssignments}</div>
              </div>
              <div className="w-16 h-8 flex items-end gap-1">
                {[4, 7, 5, 8, 12, 9, 14].map((h, i) => <div key={i} className="w-full bg-[#5B7FFF]/20 rounded-t-sm" style={{ height: `${h * 4}px` }}></div>)}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#2A2D36] bg-[#1C1F26] flex items-center justify-between">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1">Completion Rate</div>
                <div className="text-2xl font-semibold tabular-nums">{completionRate}%</div>
              </div>
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#2A2D36" strokeWidth="4" fill="none" />
                <circle cx="20" cy="20" r="16" stroke="#22C55E" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset={100 - completionRate} className="transition-all duration-1000" />
              </svg>
            </div>
            <div className="p-4 rounded-xl border border-[#2A2D36] bg-[#1C1F26] flex items-center justify-between">
              <div>
                <div className="text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1">Overdue Tasks</div>
                <div className="text-2xl font-semibold tabular-nums text-[#EF4444]">{overdueCount}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* VIEWS */}
          {activeTab === 'Board' && (
            <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-300px)] min-h-[500px]">
              {COLUMNS.map(col => (
                <div 
                  key={col.id} 
                  className="w-[320px] flex-shrink-0 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{col.title}</h3>
                      <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-semibold ${col.badgeColor}`}>
                        {assignments.filter(a => a.status === col.id).length}
                      </span>
                    </div>
                    <button className="text-[#64748B] hover:text-[#F1F5F9]"><MoreHorizontal size={16} /></button>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2A2D36] scrollbar-track-transparent">
                    {assignments.filter(a => a.status === col.id).map(task => (
                      <div 
                        key={task.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-[#1C1F26] p-4 rounded-xl border border-[#2A2D36] cursor-grab active:cursor-grabbing hover:border-[#5B7FFF]/50 transition-colors shadow-sm shadow-black/20 ${draggedCardId === task.id ? 'opacity-50 border-dashed border-[#5B7FFF]' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[0.65rem] font-medium px-2 py-0.5 rounded bg-[#2A2D36] text-[#F1F5F9]">{task.semester}</span>
                          <span className="text-[0.65rem] uppercase tracking-wider text-[#64748B] font-mono">{task.subject.code}</span>
                        </div>
                        
                        <h4 className="font-semibold text-sm mb-1 leading-snug">{task.subject.name}</h4>
                        <div className="text-xs text-[#64748B] mb-4">{task.subject.dept}</div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#64748B]">Progress</span>
                            <span className="font-mono tabular-nums">{task.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[#0F1117] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${task.progress === 100 ? 'bg-[#22C55E]' : task.progress > 0 ? 'bg-[#5B7FFF]' : 'bg-[#2A2D36]'}`} style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#2A2D36] pt-3 mt-1">
                          <div className="flex items-center gap-3 text-[#64748B] text-xs">
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
                            <div className="w-6 h-6 rounded-full border border-dashed border-[#64748B] flex items-center justify-center text-[#64748B]" title="Unassigned">
                              <Users size={12} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button className="flex items-center justify-center gap-2 py-3 text-sm text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#2A2D36] border border-dashed border-[#2A2D36] rounded-xl transition-colors mt-1">
                      <Plus size={16} /> Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'List' && (
            <div className="bg-[#1C1F26] rounded-xl border border-[#2A2D36] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2D36] text-[0.7rem] uppercase tracking-wider text-[#64748B]">
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
                    <tr key={a.id} className="border-b border-[#2A2D36] hover:bg-[#2A2D36]/30 transition-colors group">
                      <td className="px-4 py-3 font-medium">{a.subject.name}</td>
                      <td className="px-4 py-3 text-[#64748B] font-mono text-xs">{a.subject.code}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-[#2A2D36] text-xs">{a.semester}</span></td>
                      <td className="px-4 py-3">
                        {a.faculty ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white ${a.faculty.color}`}>{a.faculty.initials}</div>
                            <span>{a.faculty.name}</span>
                          </div>
                        ) : <span className="text-[#64748B] italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${COLUMNS.find(c => c.id === a.status)?.badgeColor}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#0F1117] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${a.progress === 100 ? 'bg-[#22C55E]' : 'bg-[#5B7FFF]'}`} style={{ width: `${a.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-mono text-[#64748B] tabular-nums">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-[#64748B] hover:text-[#5B7FFF]"><Pencil size={14} /></button>
                          <button className="p-1 text-[#64748B] hover:text-[#EF4444]"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="flex items-center justify-center h-64 border border-dashed border-[#2A2D36] rounded-xl text-[#64748B]">
              Timeline view coming soon...
            </div>
          )}

        </div>
      </main>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1F26] border border-[#2A2D36] rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D36]">
              <h2 className="text-lg font-semibold">Create Assignment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#64748B] hover:text-[#F1F5F9]"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Subject</label>
                <select className="w-full bg-[#0F1117] border border-[#2A2D36] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5B7FFF] text-[#F1F5F9]">
                  <option>Select subject...</option>
                  {DUMMY_SUBJECTS.map(s => <option key={s.code}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Semester</label>
                  <select className="w-full bg-[#0F1117] border border-[#2A2D36] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5B7FFF] text-[#F1F5F9]">
                    <option>Sem 1</option>
                    <option>Sem 2</option>
                    <option>Sem 3</option>
                    <option>Sem 4</option>
                    <option>Sem 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Due Date</label>
                  <input type="date" className="w-full bg-[#0F1117] border border-[#2A2D36] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5B7FFF] text-[#F1F5F9] [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Assign To Faculty</label>
                <select className="w-full bg-[#0F1117] border border-[#2A2D36] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5B7FFF] text-[#F1F5F9]">
                  <option>Select faculty member...</option>
                  {DUMMY_FACULTY.map(f => <option key={f.id}>{f.name} ({f.dept})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Notes</label>
                <textarea rows={3} className="w-full bg-[#0F1117] border border-[#2A2D36] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#5B7FFF] text-[#F1F5F9] resize-none" placeholder="Any specific requirements..."></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#2A2D36] bg-[#0F1117]/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#F1F5F9] hover:bg-[#2A2D36] rounded-md transition-colors">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium bg-[#5B7FFF] hover:bg-[#4a6cee] text-white rounded-md transition-colors shadow-sm shadow-[#5B7FFF]/20">Assign Faculty</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
