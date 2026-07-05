'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { logAction } from '@/lib/logAction'
import toast from 'react-hot-toast'
import { HardDrive, Plus, Loader2, Download, Trash2, FileText, Search, Cloud, X, Info } from 'lucide-react'

interface SharedFile {
  id: string
  name: string
  title?: string
  description?: string
  size: number
  fileKey: string // The secure B2 key
  uploadedBy: string
  uploaderName: string
  createdAt: any
}

const STORAGE_LIMIT_GB = 10
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024

export default function CloudStorageClient() {
  const { profile } = useAuth()
  const [files, setFiles] = useState<SharedFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: ''
  })

  useEffect(() => {
    if (profile?.id) {
      fetchFiles()
    }
  }, [profile])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files)
    } else {
      const lower = searchQuery.toLowerCase()
      setFilteredFiles(files.filter(f => 
        f.name.toLowerCase().includes(lower) || 
        f.title?.toLowerCase().includes(lower) ||
        f.description?.toLowerCase().includes(lower) ||
        f.uploaderName.toLowerCase().includes(lower)
      ))
    }
  }, [searchQuery, files])

  async function fetchFiles() {
    try {
      setLoading(true)
      const q = query(collection(db, 'shared_drive'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedFile))
      setFiles(data)
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load shared files.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadForm({
        title: file.name.split('.').slice(0, -1).join('.'), // Default title to filename without extension
        description: ''
      })
      setShowUploadModal(true)
    }
  }

  async function handleFinalUpload() {
    if (!selectedFile || !profile?.id) return

    setUploading(true)
    const toastId = toast.loading('Uploading to Central Storage (B2)...')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('folder', 'Department_Shared_Tank')

      const response = await fetch('/api/storage/b2/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Save metadata to Firestore
      const newDoc = {
        name: selectedFile.name,
        title: uploadForm.title || selectedFile.name,
        description: uploadForm.description,
        size: selectedFile.size,
        fileKey: data.fileKey, // Store the private B2 key
        uploadedBy: profile.id,
        uploaderName: profile.full_name || 'Anonymous',
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'shared_drive'), newDoc)
      
      await logAction({
        action: 'CREATE' as any,
        module: 'Central Storage',
        description: `Uploaded file: ${uploadForm.title} (${selectedFile.name}) to central storage`,
        targetTable: 'shared_drive',
        targetId: docRef.id
      })
      
      toast.success('File added to Central Storage!', { id: toastId })
      
      // Optimitistically update UI
      setFiles(prev => [{ id: docRef.id, ...newDoc, createdAt: { toDate: () => new Date() } }, ...prev])
      setShowUploadModal(false)
      setSelectedFile(null)
    } catch (error: any) {
      toast.error(error.message || 'Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string, fileName: string) {
    if (!confirm('Are you sure you want to remove this file?')) return
    try {
      await deleteDoc(doc(db, 'shared_drive', id))
      toast.success('File removed')
      setFiles(files.filter(f => f.id !== id))
      
      await logAction({
        action: 'DELETE' as any,
        module: 'Central Storage',
        description: `Deleted file: ${fileName} from central storage`,
        targetTable: 'shared_drive',
        targetId: id
      })
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const totalUsedBytes = files.reduce((acc, f) => acc + f.size, 0)
  const percentUsed = Math.min((totalUsedBytes / STORAGE_LIMIT_BYTES) * 100, 100)

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const canDelete = (file: SharedFile) => {
    return profile?.role === 'admin' || profile?.role === 'hod' || profile?.role === 'faculty' || file.uploadedBy === profile?.id
  }

  return (
    <>
      <div className="content-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <HardDrive size={28} style={{ color: 'var(--role-accent)' }} /> 
          Docs
        </h1>
        {/* Toolbar with Search Bar only */}
        <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--surface-secondary)', width: '100%', maxWidth: '600px', borderRadius: '16px' }}>
          <div className="search-input" style={{ flex: 1, background: 'var(--surface-primary)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '16px' }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
