import * as admin from 'firebase-admin';

// Lazy initializer for Firebase Admin Firestore
function getDb(): admin.firestore.Firestore {
  if (!admin.apps.length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Trim any outer whitespace
    privateKey = privateKey.trim();
    
    // Remove surrounding quotes if they exist
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Replace escaped newlines (\n) with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // If it's still double-escaped, clean it again
    privateKey = privateKey.replace(/\\\\n/g, '\n');

    if (!process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error(
        `Firebase Admin SDK environment variables are missing! ` +
        `FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'present' : 'missing'}, ` +
        `FIREBASE_PRIVATE_KEY: ${privateKey ? 'present' : 'missing'}`
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'igit-cdc',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('Firebase Admin Initialized Successfully via Lazy Init');
  }
  return admin.firestore();
}

// Lazy initializer for Firebase Admin Auth
function getAuth(): admin.auth.Auth {
  // Ensure app is initialized
  getDb();
  return admin.auth();
}

// Export Proxies to intercept calls at runtime, avoiding build-time environment variable requirements
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop, receiver) {
    const db = getDb();
    const value = Reflect.get(db, prop);
    return typeof value === 'function' ? value.bind(db) : value;
  }
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(target, prop, receiver) {
    const auth = getAuth();
    const value = Reflect.get(auth, prop);
    return typeof value === 'function' ? value.bind(auth) : value;
  }
});
