import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { phones, groups, subject, body, hasLink, linkUrl, mediaUrl } = payload

    if ((!phones || !Array.isArray(phones) || phones.length === 0) && (!groups || !Array.isArray(groups) || groups.length === 0)) {
      return NextResponse.json({ error: 'Phones or Groups array is required' }, { status: 400 })
    }

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
    }

    // Write the broadcast task directly to igit-cdc Firestore
    // The desktop app listens to this collection and fires WhatsApp messages
    const taskRef = await adminDb.collection('broadcast_queue').add({
      status: 'pending',
      phones: phones || [],
      groups: groups || [],
      subject,
      body,
      hasLink: hasLink || false,
      linkUrl: linkUrl || null,
      mediaUrl: mediaUrl || null,
      createdAt: FieldValue.serverTimestamp(),
      attempted: 0,
      delivered: 0,
    })

    console.log(`[Broadcast] Task queued: ${taskRef.id} for ${phones?.length || 0} phones, ${groups?.length || 0} groups`)

    return NextResponse.json({
      success: true,
      taskId: taskRef.id,
      message: `Broadcast task queued successfully.`
    })

  } catch (error: any) {
    console.error('[Broadcast] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
