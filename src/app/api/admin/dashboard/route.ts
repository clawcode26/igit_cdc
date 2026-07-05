import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { Semester } from '@/models/Academic';
import { AuditLog } from '@/models/Public';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    await connectDB();

    // 1. Fetch statistics from MongoDB
    const [
      allProfiles,
      activeSemesters,
      recentLogs
    ] = await Promise.all([
      Profile.find({}, { role: 1, createdAt: 1 }).lean(),
      Semester.find({ is_active: true }).lean(),
      AuditLog.find().sort({ createdAt: -1 }).limit(8).lean()
    ]);

    const usersCount = allProfiles.length;
    const studentsCount = allProfiles.filter((p: any) => p.role === 'student').length;
    const facultyCount = allProfiles.filter((p: any) => p.role === 'faculty').length;

    // Generate graph data (cumulative totals over last 6 months)
    const graphData = {
      total: [0,0,0,0,0,0],
      students: [0,0,0,0,0,0],
      faculty: [0,0,0,0,0,0]
    };
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const upToDateTotal = allProfiles.filter((p: any) => new Date(p.createdAt || 0) < nextDate);
      graphData.total[5 - i] = upToDateTotal.length;
      graphData.students[5 - i] = upToDateTotal.filter((p: any) => p.role === 'student').length;
      graphData.faculty[5 - i] = upToDateTotal.filter((p: any) => p.role === 'faculty').length;
    }

    // 2. Fetch legacy online admins (or from MongoDB if already presence-indexed)
    // For now, we fetch from a raw collection or fallback
    const onlineThreshold = new Date(Date.now() - 2 * 60 * 1000);
    const onlineAdmins = await mongoose.connection.db?.collection('admin_presence')
        .find({ last_seen: { $gte: onlineThreshold } })
        .toArray() || [];

    const semesterDisplay = activeSemesters.length === 0 ? 'None' : 
                            activeSemesters.length === 1 ? (activeSemesters[0] as any).name : 
                            `${activeSemesters.length} Active`;

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
      onlineAdmins: onlineAdmins.map(a => ({ ...a, id: a._id })),
    });

  } catch (error: any) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
