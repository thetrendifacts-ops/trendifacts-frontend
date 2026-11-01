import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  try {
    let serviceAccount = null;

    // 1. Check Local serviceAccountKey.json First (Makes localhost 100% reliable)
    const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    } 
    // 2. Check Single JSON Environment Variable (Vercel)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT.trim().replace(/^["']|["']$/g, '');
      serviceAccount = JSON.parse(rawEnv);
    } 
    // 3. Fallback to 3 Individual Environment Variables
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID.trim(),
        client_email: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        private_key: process.env.FIREBASE_PRIVATE_KEY,
      };
    }

    if (serviceAccount) {
      // Fix private_key newlines whether it came from JSON or individual env vars
      const rawKey = serviceAccount.private_key || serviceAccount.privateKey || '';
      const fixedKey = rawKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id || serviceAccount.projectId,
          clientEmail: serviceAccount.client_email || serviceAccount.clientEmail,
          privateKey: fixedKey,
        }),
      });
    } else {
      console.error('⚠️ No Firebase credentials found in serviceAccountKey.json or env vars.');
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

const db = getApps().length ? getFirestore() : null;

export { db };