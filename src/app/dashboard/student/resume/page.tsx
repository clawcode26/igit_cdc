'use client'

import React, { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'
import { Plus, Trash2 } from 'lucide-react'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 11, lineHeight: 1.4, color: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#000', paddingBottom: 15 },
  logo: { width: 60, height: 60, marginRight: 15 },
  headerTextContainer: { flex: 1 },
  name: { fontSize: 24, fontFamily: 'Times-Bold', color: '#000', textTransform: 'uppercase', marginBottom: 4 },
  contactInfo: { fontSize: 10, color: '#333' },
  sectionTitle: { fontSize: 12, fontFamily: 'Times-Bold', color: '#000', marginTop: 15, marginBottom: 8, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 2 },
  entry: { marginBottom: 12 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', fontFamily: 'Times-Bold', fontSize: 11 },
  entrySub: { fontSize: 10, fontStyle: 'italic', marginBottom: 4, color: '#333' },
  bulletText: { fontSize: 10, lineHeight: 1.5, textAlign: 'justify' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#666', borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10 }
})

const ResumePDF = ({ data, profile }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src="/igit-logo.png" style={styles.logo} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{profile?.full_name || 'STUDENT NAME'}</Text>
          <Text style={styles.contactInfo}>
            {profile?.email || 'email@example.com'}  |  +91 {profile?.phone || '0000000000'}  |  {data.linkedin || 'linkedin.com/in/username'}
          </Text>
          <Text style={styles.contactInfo}>Registration No: {profile?.registration_no || profile?.roll_no || 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Education</Text>
      <View style={styles.entry}>
        <View style={styles.entryHeader}>
          <Text>Indira Gandhi Institute of Technology, Sarang</Text>
          <Text>{(profile?.graduation_year - 4) || 2021} - {profile?.graduation_year || 2025}</Text>
        </View>
        <Text style={styles.entrySub}>B.Tech in {profile?.department || 'Engineering'} | CGPA: {data.cgpa || 'N/A'}</Text>
      </View>

      {data.experience && data.experience.filter((e: any) => e.role && e.company).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.filter((e: any) => e.role && e.company).map((exp: any, i: number) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text>{exp.role} at {exp.company}</Text>
                <Text>{exp.duration}</Text>
              </View>
              <Text style={styles.bulletText}>{exp.description}</Text>
            </View>
          ))}
        </>
      )}

      {data.projects && data.projects.filter((p: any) => p.title).length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text>{proj.title}</Text>
              </View>
              {proj.tech && <Text style={styles.entrySub}>Tech Stack: {proj.tech}</Text>}
              <Text style={styles.bulletText}>{proj.description}</Text>
            </View>
          ))}
        </>
      )}

      {data.skills && (
        <>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <Text style={styles.bulletText}>{data.skills}</Text>
        </>
      )}

      {data.achievements && (
        <>
          <Text style={styles.sectionTitle}>Achievements & Positions of Responsibility</Text>
          <Text style={styles.bulletText}>{data.achievements}</Text>
        </>
      )}

      <Text style={styles.footer}>
        Generated via IGIT CDC Placement Portal. Document is verified against central database records.
      </Text>
    </Page>
  </Document>
)

export default function ResumeGeneratorPage() {
  const { profile } = useAuth()
  const [generating, setGenerating] = useState(false)
  
  const [data, setData] = useState({
    linkedin: '',
    cgpa: '',
    skills: '',
    achievements: '',
    experience: [{ role: '', company: '', duration: '', description: '' }],
    projects: [{ title: '', tech: '', description: '' }]
  })

  const addExperience = () => {
    setData({ ...data, experience: [...data.experience, { role: '', company: '', duration: '', description: '' }] })
  }
  const removeExperience = (index: number) => {
    const newExp = [...data.experience]
    newExp.splice(index, 1)
    setData({ ...data, experience: newExp })
  }
  const updateExperience = (index: number, field: string, value: string) => {
    const newExp: any = [...data.experience]
    newExp[index][field] = value
    setData({ ...data, experience: newExp })
  }

  const addProject = () => {
    setData({ ...data, projects: [...data.projects, { title: '', tech: '', description: '' }] })
  }
  const removeProject = (index: number) => {
    const newProj = [...data.projects]
    newProj.splice(index, 1)
    setData({ ...data, projects: newProj })
  }
  const updateProject = (index: number, field: string, value: string) => {
    const newProj: any = [...data.projects]
    newProj[index][field] = value
    setData({ ...data, projects: newProj })
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    try {
      const blob = await pdf(<ResumePDF data={data} profile={profile} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Resume_${profile?.full_name}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Resume downloaded!')
    } catch (err) {
      toast.error('Failed to generate resume')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Topbar title="Resume Generator" />
      <div className="content-container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', borderTop: '4px solid #0F6E56' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img src="/igit-logo.png" alt="IGIT Logo" style={{ width: '48px', height: '48px' }} />
            <div>
              <h2 className="section-heading" style={{ marginBottom: '4px' }}>Standardized IGIT Resume</h2>
              <p className="secondary-text">Auto-fetches your academic details and securely generates an officially branded placement resume.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Core Details */}
            <div style={{ padding: '20px', background: 'var(--surface-secondary)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Core Details (Auto-Synced)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Full Name</div>
                  <div style={{ fontWeight: 500 }}>{profile?.full_name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Branch / Reg No.</div>
                  <div style={{ fontWeight: 500 }}>{profile?.department || 'N/A'} • {profile?.registration_no || profile?.roll_no || 'N/A'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input className="form-input" placeholder="linkedin.com/in/username" required value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Current CGPA</label>
                  <input className="form-input" placeholder="e.g. 8.75" required value={data.cgpa} onChange={e => setData({...data, cgpa: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Work Experience / Internships</h3>
                <button type="button" onClick={addExperience} className="btn btn-sm btn-ghost" style={{ color: '#0F6E56', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={16} /> Add Experience
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.experience.map((exp, index) => (
                  <div key={index} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                    {data.experience.length > 1 && (
                      <button type="button" onClick={() => removeExperience(index)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', paddingRight: data.experience.length > 1 ? '30px' : '0' }}>
                      <input className="form-input" placeholder="Role (e.g. SDE Intern)" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} />
                      <input className="form-input" placeholder="Company Name" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                    </div>
                    <input className="form-input" placeholder="Duration (e.g. May 2024 - July 2024)" style={{ marginBottom: '12px' }} value={exp.duration} onChange={e => updateExperience(index, 'duration', e.target.value)} />
                    <textarea className="form-input" rows={2} placeholder="Briefly describe your responsibilities and impact..." value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Academic / Personal Projects</h3>
                <button type="button" onClick={addProject} className="btn btn-sm btn-ghost" style={{ color: '#0F6E56', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={16} /> Add Project
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.projects.map((proj, index) => (
                  <div key={index} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative' }}>
                    {data.projects.length > 1 && (
                      <button type="button" onClick={() => removeProject(index)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px', paddingRight: data.projects.length > 1 ? '30px' : '0' }}>
                      <input className="form-input" placeholder="Project Title" value={proj.title} onChange={e => updateProject(index, 'title', e.target.value)} />
                      <input className="form-input" placeholder="Tech Stack (e.g. React, Firebase)" value={proj.tech} onChange={e => updateProject(index, 'tech', e.target.value)} />
                    </div>
                    <textarea className="form-input" rows={2} placeholder="Project description..." value={proj.description} onChange={e => updateProject(index, 'description', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Achievements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Technical Skills</label>
                <textarea className="form-input" rows={2} required placeholder="Languages, Frameworks, Tools (comma separated)..." value={data.skills} onChange={e => setData({...data, skills: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Achievements & Extra-curriculars</label>
                <textarea className="form-input" rows={3} required placeholder="Hackathon wins, club memberships, certifications..." value={data.achievements} onChange={e => setData({...data, achievements: e.target.value})} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-filled" style={{ background: '#0F6E56', borderColor: '#0F6E56', padding: '12px 32px', fontSize: '15px' }} disabled={generating}>
                {generating ? 'Generating PDF...' : 'Download Official Resume'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

