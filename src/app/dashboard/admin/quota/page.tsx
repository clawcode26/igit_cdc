'use client'

import React, { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { db } from '@/lib/firebase/config'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

export default function AdminQuotaLedgerPage() {
  const [ledgers, setLedgers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLedgers() {
      const q = query(collection(db, 'quota_ledger'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      setLedgers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchLedgers()
  }, [])

  // Dummy statistics for the dashboard
  const smsTotal = 50000;
  const smsConsumed = 12500;
  const emailTotal = 250000;
  const emailConsumed = 198000;

  return (
    <>
      <Topbar title="Gateway Quota & Billing Dashboard" accentColor="#E24B4A" />
      <div className="content-container">
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div className="card" style={{ borderLeft: '4px solid #E24B4A' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>DLT SMS Credits (Fast2SMS)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900 }}>{smsTotal - smsConsumed}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>remaining</span>
            </div>
            <div style={{ marginTop: '16px', background: 'var(--bg-secondary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(smsConsumed / smsTotal) * 100}%`, background: '#E24B4A', height: '100%' }}></div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>{smsConsumed.toLocaleString()} / {smsTotal.toLocaleString()} used</div>
          </div>
          
          <div className="card" style={{ borderLeft: '4px solid #2563EB' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Credits (AWS SES)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900 }}>{(emailTotal - emailConsumed).toLocaleString()}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>remaining</span>
            </div>
            <div style={{ marginTop: '16px', background: 'var(--bg-secondary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(emailConsumed / emailTotal) * 100}%`, background: '#2563EB', height: '100%' }}></div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>{emailConsumed.toLocaleString()} / {emailTotal.toLocaleString()} used</div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="card">
          <h2 className="section-heading" style={{ marginBottom: '16px' }}>Purchase Order Ledger</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px' }}>Date</th>
                <th style={{ padding: '12px 8px' }}>Channel</th>
                <th style={{ padding: '12px 8px' }}>PO Reference</th>
                <th style={{ padding: '12px 8px' }}>Package Size</th>
                <th style={{ padding: '12px 8px' }}>Valid Till</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 8px' }}>2025-04-01</td>
                <td style={{ padding: '12px 8px' }}><span className="badge badge-info">SMS</span></td>
                <td style={{ padding: '12px 8px' }}>PO/IGIT/CDC/25/001</td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>+50,000</td>
                <td style={{ padding: '12px 8px' }}>2026-03-31</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 8px' }}>2025-04-01</td>
                <td style={{ padding: '12px 8px' }}><span className="badge badge-neutral">EMAIL</span></td>
                <td style={{ padding: '12px 8px' }}>PO/IGIT/CDC/25/002</td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>+250,000</td>
                <td style={{ padding: '12px 8px' }}>2026-03-31</td>
              </tr>
              {ledgers.map(lg => (
                <tr key={lg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px' }}>{new Date(lg.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 8px' }}><span className="badge badge-neutral">{lg.channel}</span></td>
                  <td style={{ padding: '12px 8px' }}>{lg.purchaseOrderRef}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>+{lg.packageSize}</td>
                  <td style={{ padding: '12px 8px' }}>{lg.poValidTo ? new Date(lg.poValidTo).toLocaleDateString() : 'Lifetime'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
