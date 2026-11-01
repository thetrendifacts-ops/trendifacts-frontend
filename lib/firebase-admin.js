import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  try {
    let serviceAccount = null;

    // Option A: Single JSON Environment Variable (Recommended for Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // Clean accidental surrounding quotes if pasted with them
      const cleanedJson = rawEnv.replace(/^["']|["']$/g, '');
      serviceAccount = JSON.parse(cleanedJson);
    } 
    // Option B: Local Development File Fallback
    else {
      const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (fs.existsSync(keyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      } else {
        console.error('⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
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