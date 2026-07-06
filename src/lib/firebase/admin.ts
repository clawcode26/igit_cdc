import * as admin from 'firebase-admin';

try {
  if (!admin.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
      .replace(/\\n/g, '\n')
      .replace(/^['"]|['"]$/g, ''); // Fix for quoted env vars in .env.local

    if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin Initialized Successfully');
    } else {
      console.warn('⚠️ Firebase Admin env vars missing. Skipping initialization (expected during build).');
    }
  }
} catch (error: any) {
  console.error('Firebase Admin Initialization Error:', error);
}

// Safely export instances only if initialized to prevent crash during Next.js static build evaluation
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
