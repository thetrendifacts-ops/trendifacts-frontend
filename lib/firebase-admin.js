import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  try {
    let serviceAccount = null;
    const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');

    // 1. Localhost fallback
    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    } 
    // 2. Check Base64 Env Var
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const cleanBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.trim().replace(/\s+/g, '');
      const decoded = Buffer.from(cleanBase64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    }
    // 3. Check Raw JSON Env Var
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim().replace(/^["']|["']$/g, '');
      serviceAccount = JSON.parse(raw);
    }
    // 4. Check Individual Keys
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
      };
    }

    if (serviceAccount) {
      const pKey = serviceAccount.privateKey || serviceAccount.private_key || '';
      const pId = serviceAccount.projectId || serviceAccount.project_id || '';
      const cEmail = serviceAccount.clientEmail || serviceAccount.client_email || '';

      initializeApp({
        credential: cert({
          projectId: pId,
          clientEmail: cEmail,
          privateKey: pKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin successfully initialized!');
    } else {
      console.error('❌ CRITICAL: No Firebase credentials detected in Vercel environment variables or local file!');
    }
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

const db = getApps().length ? getFirestore() : null;

export { db };