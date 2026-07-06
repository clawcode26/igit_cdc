'use client'

import React, { useState, useEffect } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import { NoticePDFTemplate } from './NoticePDFTemplate'

export default function NoticePDFViewer({ data, zoom = 100 }: { data: any, zoom?: number }) {
  return (
    <BlobProvider document={<NoticePDFTemplate {...data} />}>
      {({ url, loading, error }) => {
        return <FlickerFreeRenderer url={url} loading={loading} error={error} zoom={zoom} />
      }}
    </BlobProvider>
  )
}

function FlickerFreeRenderer({ url, loading, error, zoom }: { url: string | null, loading: boolean, error: any, zoom: number }) {
  const [urlA, setUrlA] = useState<string | null>(null)
  const [urlB, setUrlB] = useState<string | null>(null)
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A')

  // When a new URL arrives, load it into the hidden buffer layer
  useEffect(() => {
    if (url) {
      if (activeLayer === 'A' && url !== urlA) {
        setUrlB(url)
      } else if (activeLayer === 'B' && url !== urlB) {
        setUrlA(url)
      } else if (!urlA && !urlB) {
        // Initial load
        setUrlA(url)
      }
    }
  }, [url, activeLayer, urlA, urlB])

  // When the hidden buffer layer finishes loading the PDF, swap it to active
  const handleLoad = (layer: 'A' | 'B') => {
    setActiveLayer(layer)
  }

  if (!urlA && !urlB && loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>Generating Document...</div>
  }
  
  if (error) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--status-error)' }}>Failed to generate preview</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Buffer Layer A */}
      {urlA && (
        <iframe 
          src={`${urlA}#toolbar=0&navpanes=0&scrollbar=0&zoom=${zoom}`} 
          onLoad={() => handleLoad('A')}
          style={{ 
            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', 
            opacity: activeLayer === 'A' ? 1 : 0, 
            zIndex: activeLayer === 'A' ? 2 : 1, 
            pointerEvents: activeLayer === 'A' ? 'auto' : 'none',
            transition: 'opacity 0.1s ease-in-out'
          }} 
          title="Notice Preview A"
        />
      )}
      
      {/* Buffer Layer B */}
      {urlB && (
        <iframe 
          src={`${urlB}#toolbar=0&navpanes=0&scrollbar=0&zoom=${zoom}`} 
          onLoad={() => handleLoad('B')}
          style={{ 
            position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', 
            opacity: activeLayer === 'B' ? 1 : 0, 
            zIndex: activeLayer === 'B' ? 2 : 1, 
            pointerEvents: activeLayer === 'B' ? 'auto' : 'none',
            transition: 'opacity 0.1s ease-in-out'
          }} 
          title="Notice Preview B"
        />
      )}

      {/* Syncing Indicator */}
      {loading && (urlA || urlB) && (
        <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          Syncing...
        </div>
      )}
    </div>
  )
}
