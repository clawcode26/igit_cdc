import React, { useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'

interface NoticeProps {
  refNo: string
  dateIssued: string
  forTo: string
  subject: string
  body: string
  undersigned: string
  designation?: string
  department?: string
  nbNote: string
  zoom: number
  positions?: any
  setPositions?: any
  hasLink?: boolean
  linkUrl?: string
}

const DraggableBlock = ({ id, positions, setPositions, setIsDragging, children, style = {} }: any) => {
  const x = positions[id]?.x || 0
  const y = positions[id]?.y || 0

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false)
        if (setPositions) {
          setPositions((prev: any) => ({
            ...prev,
            [id]: { x: (prev[id]?.x || 0) + info.offset.x, y: (prev[id]?.y || 0) + info.offset.y }
          }))
        }
      }}
      style={{ 
        position: 'relative', 
        ...style,
        x, y, 
        cursor: 'grab',
        zIndex: 10 // ensure it stays on top while dragging
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.01, zIndex: 50, opacity: 0.9 }}
    >
      {children}
    </motion.div>
  )
}

export function HTMLNoticePreview({ 
  refNo, dateIssued, forTo, subject, body, undersigned, designation, department, nbNote, zoom, positions, setPositions, hasLink, linkUrl 
}: NoticeProps) {
  
  // A4 standard PDF points is 595 x 842
  const baseWidth = 595
  const baseHeight = 842
  
  const [isDragging, setIsDragging] = useState(false)
  const pos = positions || {
    header: {x:0,y:0}, refRow: {x:0,y:0}, title: {x:0,y:0}, forTo: {x:0,y:0}, 
    subject: {x:0,y:0}, body: {x:0,y:0}, signature: {x:0,y:0}, nbNote: {x:0,y:0}
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: '40px' }}>
      <div 
        style={{ 
          width: `${baseWidth}px`, height: `${baseHeight}px`, 
          background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          position: 'relative', transform: `scale(${zoom / 100})`, transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-in-out',
          flexShrink: 0, fontFamily: '"Times New Roman", Times, serif', color: '#000',
          padding: '40px 30px', boxSizing: 'border-box'
        }}
      >
        {/* Alignment Guides (Canva style) */}
        {isDragging && (
          <>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(255, 0, 0, 0.4)', zIndex: 999, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(255, 0, 0, 0.4)', zIndex: 999, pointerEvents: 'none' }} />
          </>
        )}

        {/* Watermark */}
        <div style={{
          position: 'absolute', top: '30%', left: '20%', width: '60%', height: '40%',
          backgroundImage: 'url(/igit-logo.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center', opacity: 0.05, pointerEvents: 'none'
        }} />

        <DraggableBlock id="header" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '16px', marginBottom: '16px' }}>
            <img src="/igit-logo.png" alt="Logo" style={{ width: '70px', height: '70px', marginRight: '16px', pointerEvents: 'none' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                {department || 'Career Development Centre'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Indira Gandhi Institute of Technology, Sarang
              </div>
            </div>
          </div>
        </DraggableBlock>

        <DraggableBlock id="refRow" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '24px', fontWeight: 'bold', fontSize: '14px' }}>
            <div>No. {refNo || 'IGIT/CDC/____'}</div>
            <div>Date: {dateIssued ? new Date(dateIssued).toLocaleDateString('en-GB') : 'DD/MM/YYYY'}</div>
          </div>
        </DraggableBlock>

        <DraggableBlock id="title" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
          <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '32px' }}>
            NOTICE
          </div>
        </DraggableBlock>

        {forTo && (
          <DraggableBlock id="forTo" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '24px' }}>
              To: {forTo}
            </div>
          </DraggableBlock>
        )}

        <DraggableBlock id="subject" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
          <div style={{ display: 'flex', marginBottom: '24px', fontSize: '15px' }}>
            <div style={{ fontWeight: 'bold', width: '60px' }}>Sub:</div>
            <div style={{ fontWeight: 'bold', flex: 1 }}>{subject || '...'}</div>
          </div>
        </DraggableBlock>

        <DraggableBlock id="body" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
          <div style={{ fontSize: '15px', lineHeight: 1.6, textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
            {body || 'Start typing the notice body...'}
          </div>
        </DraggableBlock>

        {hasLink && (
          <DraggableBlock id="link" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging}>
            <div style={{ fontSize: '15px', marginBottom: '24px', fontWeight: 'bold' }}>
              Link: <a href={linkUrl || '#'} style={{ color: 'blue', textDecoration: 'underline' }}>{linkUrl || 'https://'}</a>
            </div>
          </DraggableBlock>
        )}

        {/* Note: Footer Signatory originally used position: absolute. For draggable, we wrap its relative container. */}
        <DraggableBlock id="signature" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging} style={{ position: 'absolute', bottom: '100px', right: '20px', width: '300px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
              {undersigned || 'Authorized Signatory'}
            </div>
            {designation && <div style={{ fontSize: '14px', marginBottom: '4px' }}>{designation}</div>}
            <div style={{ fontSize: '14px' }}>{department || 'Career Development Centre, IGIT Sarang'}</div>
          </div>
        </DraggableBlock>

        {nbNote && (
          <DraggableBlock id="nbNote" positions={pos} setPositions={setPositions} setIsDragging={setIsDragging} style={{ position: 'absolute', bottom: '40px', left: '0', right: '0' }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: '12px', fontSize: '13px', fontStyle: 'italic' }}>
              N.B.: {nbNote}
            </div>
          </DraggableBlock>
        )}
      </div>
    </div>
  )
}
