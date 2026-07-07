import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!adminDb) {
      throw new Error('Firebase Admin DB is not initialized. Check your environment variables.');
    }

    // 1. Fetch statistics from Firestore
    const [profilesSnap, semestersSnap, logsSnap, presenceSnap] = await Promise.all([
      adminDb.collection('profiles').get(),
      adminDb.collection('semesters').where('is_active', '==', true).get(),
      adminDb.collection('audit_logs').orderBy('created_at', 'desc').limit(8).get(),
      adminDb.collection('admin_presence').get()
    ]);

    const allProfiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const usersCount = allProfiles.length;
    const studentsCount = allProfiles.filter((p: any) => p.role === 'student').length;
    const facultyCount = allProfiles.filter((p: any) => p.role === 'faculty').length;

    // Generate graph data (cumulative totals over last 6 months)
    const graphData = {
      total: [0, 0, 0, 0, 0, 0],
      students: [0, 0, 0, 0, 0, 0],
      faculty: [0, 0, 0, 0, 0, 0]
    };
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const upToDateTotal = allProfiles.filter((p: any) => new Date(p.created_at || 0) < nextDate);
      graphData.total[5 - i] = upToDateTotal.length;
      graphData.students[5 - i] = upToDateTotal.filter((p: any) => p.role === 'student').length;
      graphData.faculty[5 - i] = upToDateTotal.filter((p: any) => p.role === 'faculty').length;
    }

    // 2. Fetch legacy online admins from admin_presence
    const onlineThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const onlineAdmins = presenceSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(a => a.last_seen >= onlineThreshold);

    const activeSemesters = semestersSnap.docs.map(doc => doc.data());
    const semesterDisplay = activeSemesters.length === 0 ? 'None' : 
                            activeSemesters.length === 1 ? (activeSemesters[0] as any).name : 
                            `${activeSemesters.length} Active`;

    const recentLogs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      success: true,
      stats: {
        usersCount,
        studentsCount,
        facultyCount,
        semesterDisplay,
        graphData
      },
      recentLogs,
      onlineAdmins,
    });

  } catch (error: any) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
