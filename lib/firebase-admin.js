import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  try {
    let serviceAccount = null;

    // 1. Prefer Environment Variables in Production (Vercel)
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          .replace(/^"|"$/g, '')
          .replace(/\\n/g, '\n'),
      };
    } else {
      // 2. Local Development Fallback (using fs so Turbopack doesn't warn about missing module)
      const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (fs.existsSync(keyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      } else {
        console.error('⚠️ Missing Firebase Environment Variables:', {
          hasProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
          hasClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
          hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
        });
      }
    }

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

const db = getApps().length ? getFirestore() : null;

export { db };