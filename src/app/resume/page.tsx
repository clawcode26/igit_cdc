'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { useTheme } from '@/context/ThemeContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, FileDown } from 'lucide-react'
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer'

// PDF Styles
const pdfStyles = StyleSheet.create({
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

// PDF Component
const ResumePDF = ({ data }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Image src="/igit-logo.png" style={pdfStyles.logo} />
        <View style={pdfStyles.headerTextContainer}>
          <Text style={pdfStyles.name}>{data.fullName || 'STUDENT NAME'}</Text>
          <Text style={pdfStyles.contactInfo}>
            {data.email || 'email@example.com'}  |  +91 {data.phone || '0000000000'}  |  {data.linkedin || 'linkedin.com/in/username'}
          </Text>
          <Text style={pdfStyles.contactInfo}>Registration No: {data.regNo || 'N/A'}</Text>
        </View>
      </View>

      <Text style={pdfStyles.sectionTitle}>Education</Text>
      <View style={pdfStyles.entry}>
        <View style={pdfStyles.entryHeader}>
          <Text>Indira Gandhi Institute of Technology, Sarang</Text>
          <Text>{(Number(data.gradYear) - 4) || 2021} - {data.gradYear || 2025}</Text>
        </View>
        <Text style={pdfStyles.entrySub}>B.Tech in {data.department || 'Engineering'} | CGPA: {data.cgpa || 'N/A'}</Text>
      </View>

      {data.experience && data.experience.filter((e: any) => e.role && e.company).length > 0 && (
        <>
          <Text style={pdfStyles.sectionTitle}>Experience</Text>
          {data.experience.filter((e: any) => e.role && e.company).map((exp: any, i: number) => (
            <View key={i} style={pdfStyles.entry}>
              <View style={pdfStyles.entryHeader}>
                <Text>{exp.role} at {exp.company}</Text>
                <Text>{exp.duration}</Text>
              </View>
              <Text style={pdfStyles.bulletText}>{exp.description}</Text>
            </View>
          ))}
        </>
      )}

      {data.projects && data.projects.filter((p: any) => p.title).length > 0 && (
        <>
          <Text style={pdfStyles.sectionTitle}>Projects</Text>
          {data.projects.filter((p: any) => p.title).map((proj: any, i: number) => (
            <View key={i} style={pdfStyles.entry}>
              <View style={pdfStyles.entryHeader}>
                <Text>{proj.title}</Text>
              </View>
              {proj.tech && <Text style={pdfStyles.entrySub}>Tech Stack: {proj.tech}</Text>}
              <Text style={pdfStyles.bulletText}>{proj.description}</Text>
            </View>
          ))}
        </>
      )}

      {data.skills && (
        <>
          <Text style={pdfStyles.sectionTitle}>Technical Skills</Text>
          <Text style={pdfStyles.bulletText}>{data.skills}</Text>
        </>
      )}

      {data.achievements && (
        <>
          <Text style={pdfStyles.sectionTitle}>Achievements & Positions of Responsibility</Text>
          <Text style={pdfStyles.bulletText}>{data.achievements}</Text>
        </>
      )}

      <Text style={pdfStyles.footer}>
        Generated via IGIT CDC Portal. This is a standardized institutional resume format.
      </Text>
    </Page>
  </Document>
)

export default function PublicResumeBuilder() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [generating, setGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { setMounted(true) }, [])

  const [data, setData] = useState({
    fullName: '',
    email: '',
    phone: '',
    regNo: '',
    department: '',
    gradYear: '',
    linkedin: '',
    cgpa: '',
    skills: '',
    achievements: '',
    experience: [{ role: '', company: '', duration: '', description: '' }],
    projects: [{ title: '', tech: '', description: '' }]
  })

  // Premium UI Tokens
  const T = {
    bg: isDark ? '#050505' : '#FAFAFA',
    card: isDark ? '#111111' : '#FFFFFF',
    border: isDark ? '#262626' : '#E5E5E5',
    text: isDark ? '#F5F5F5' : '#171717',
    muted: isDark ? '#A3A3A3' : '#737373',
    accent: '#0A0A0A',
    accentText: '#FFFFFF',
    accentHover: '#262626',
    inputBg: isDark ? '#171717' : '#F5F5F5',
  }
  
  // Light mode needs inverted accent
  if (!isDark) {
    T.accent = '#0A0A0A'
    T.accentText = '#FFFFFF'
    T.accentHover = '#262626'
  } else {
    T.accent = '#FFFFFF'
    T.accentText = '#0A0A0A'
    T.accentHover = '#E5E5E5'
  }

  const addExperience = () => setData({ ...data, experience: [...data.experience, { role: '', company: '', duration: '', description: '' }] })
  const removeExperience = (index: number) => setData({ ...data, experience: data.experience.filter((_, i) => i !== index) })
  const updateExperience = (index: number, field: string, value: string) => {
    const newExp: any = [...data.experience]
    newExp[index][field] = value
    setData({ ...data, experience: newExp })
  }

  const addProject = () => setData({ ...data, projects: [...data.projects, { title: '', tech: '', description: '' }] })
  const removeProject = (index: number) => setData({ ...data, projects: data.projects.filter((_, i) => i !== index) })
  const updateProject = (index: number, field: string, value: string) => {
    const newProj: any = [...data.projects]
    newProj[index][field] = value
    setData({ ...data, projects: newProj })
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    try {
      const blob = await pdf(<ResumePDF data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Resume_${data.fullName || 'Student'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Resume downloaded successfully!')
    } catch (err) {
      toast.error('Failed to generate resume')
    } finally {
      setGenerating(false)
    }
  }

  if (!mounted) return null

  return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <img src="/igit-logo.png" alt="IGIT" style={{ width: '80px', height: '80px' }} />
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: T.text, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Standardized Resume Builder
            </h1>
            <p style={{ color: T.muted, fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Generate an officially branded, ATS-friendly PDF resume. We recommend using this standardized format for all on-campus placement drives.
            </p>
          </div>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 1. Core Information */}
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: T.text, marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${T.border}` }}>
                1. Personal Details
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <Input T={T} label="Full Name" value={data.fullName} onChange={v => setData({...data, fullName: v})} required placeholder="John Doe" />
                <Input T={T} label="Email Address" value={data.email} onChange={v => setData({...data, email: v})} required placeholder="john@example.com" type="email" />
                <Input T={T} label="Phone Number" value={data.phone} onChange={v => setData({...data, phone: v})} required placeholder="9876543210" />
                <Input T={T} label="LinkedIn Profile (Optional)" value={data.linkedin} onChange={v => setData({...data, linkedin: v})} placeholder="linkedin.com/in/johndoe" />
              </div>
            </section>

            {/* 2. Academic Information */}
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: T.text, marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${T.border}` }}>
                2. Academic Profile
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <Input T={T} label="Registration / Roll No" value={data.regNo} onChange={v => setData({...data, regNo: v})} required placeholder="e.g. 210110..." />
                <Input T={T} label="Branch / Department" value={data.department} onChange={v => setData({...data, department: v})} required placeholder="e.g. Computer Science & Engg." />
                <Input T={T} label="Graduation Year" value={data.gradYear} onChange={v => setData({...data, gradYear: v})} required placeholder="e.g. 2025" />
                <Input T={T} label="Current CGPA" value={data.cgpa} onChange={v => setData({...data, cgpa: v})} required placeholder="e.g. 8.75" />
              </div>
            </section>

            {/* 3. Experience */}
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${T.border}` }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: T.text }}>3. Experience & Internships</h2>
                <button type="button" onClick={addExperience} style={{ background: 'transparent', border: 'none', color: T.text, fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <Plus size={16} /> Add Position
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {data.experience.map((exp, index) => (
                  <div key={index} style={{ position: 'relative', background: T.inputBg, border: `1px solid ${T.border}`, padding: '24px', borderRadius: '8px' }}>
                    {data.experience.length > 1 && (
                      <button type="button" onClick={() => removeExperience(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <Input T={T} label="Role" value={exp.role} onChange={v => updateExperience(index, 'role', v)} placeholder="SDE Intern" />
                      <Input T={T} label="Company" value={exp.company} onChange={v => updateExperience(index, 'company', v)} placeholder="Acme Corp" />
                      <Input T={T} label="Duration" value={exp.duration} onChange={v => updateExperience(index, 'duration', v)} placeholder="May 2024 - Jul 2024" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: T.muted }}>Description & Impact</label>
                      <textarea 
                        value={exp.description} 
                        onChange={e => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe what you built, technologies used, and your quantifiable impact..."
                        style={{ width: '100%', padding: '12px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Projects */}
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${T.border}` }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: T.text }}>4. Academic & Personal Projects</h2>
                <button type="button" onClick={addProject} style={{ background: 'transparent', border: 'none', color: T.text, fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <Plus size={16} /> Add Project
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {data.projects.map((proj, index) => (
                  <div key={index} style={{ position: 'relative', background: T.inputBg, border: `1px solid ${T.border}`, padding: '24px', borderRadius: '8px' }}>
                    {data.projects.length > 1 && (
                      <button type="button" onClick={() => removeProject(index)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <Input T={T} label="Project Name" value={proj.title} onChange={v => updateProject(index, 'title', v)} placeholder="E-commerce Platform" />
                      <Input T={T} label="Tech Stack" value={proj.tech} onChange={v => updateProject(index, 'tech', v)} placeholder="React, Node.js, MongoDB" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: T.muted }}>Key Features</label>
                      <textarea 
                        value={proj.description} 
                        onChange={e => updateProject(index, 'description', e.target.value)}
                        placeholder="Briefly explain the core functionality and technical challenges solved..."
                        style={{ width: '100%', padding: '12px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Skills & Achievements */}
            <section style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: T.text, marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${T.border}` }}>
                5. Skills & Achievements
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: T.muted }}>Technical Skills</label>
                  <textarea 
                    value={data.skills} 
                    onChange={e => setData({...data, skills: e.target.value})}
                    required
                    placeholder="Languages: C++, Python, JavaScript&#10;Frameworks: React, Next.js, Express&#10;Tools: Git, Docker, AWS"
                    style={{ width: '100%', padding: '12px', background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: T.muted }}>Extracurriculars & Achievements</label>
                  <textarea 
                    value={data.achievements} 
                    onChange={e => setData({...data, achievements: e.target.value})}
                    placeholder="- Smart India Hackathon Finalist (2023)&#10;- Technical Lead at Coding Club"
                    style={{ width: '100%', padding: '12px', background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px', outline: 'none' }}
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={generating}
                type="submit"
                style={{
                  background: T.accent,
                  color: T.accentText,
                  border: 'none',
                  padding: '16px 40px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: generating ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: generating ? 0.7 : 1,
                  transition: 'background 0.2s'
                }}
              >
                <FileDown size={18} />
                {generating ? 'Compiling PDF...' : 'Download Resume PDF'}
              </motion.button>
            </div>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Input({ label, value, onChange, placeholder, required = false, type = 'text', T }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: T.muted }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '12px',
          background: T.inputBg,
          border: `1px solid ${T.border}`,
          borderRadius: '6px',
          color: T.text,
          fontSize: '14px',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onFocus={e => e.currentTarget.style.borderColor = T.accent}
        onBlur={e => e.currentTarget.style.borderColor = T.border}
      />
    </div>
  )
}
