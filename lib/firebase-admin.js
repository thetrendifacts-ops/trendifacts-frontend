import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    let serviceAccount;

    // 1. Prefer Environment Variables in Production (Vercel)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID.trim(),
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        client_email: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        private_key: process.env.FIREBASE_PRIVATE_KEY
          .replace(/^"|"$/g, '') // Remove accidental surrounding quotes
          .replace(/\\n/g, '\n'), // Convert literal \n into real line breaks
      };
    } else {
      // 2. Local Development Fallback
      try {
        serviceAccount = require('../serviceAccountKey.json');
      } catch (e) {
        console.error('⚠️ Missing Firebase Environment Variables:', {
          hasProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
          hasClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
          hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
        });
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export { admin, db };