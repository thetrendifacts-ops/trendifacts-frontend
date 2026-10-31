import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let dbInstance;

try {
  if (!getApps().length) {
    let serviceAccount;
    try {
      // Looks for serviceAccountKey.json in the project root
      serviceAccount = require('../serviceAccountKey.json');
    } catch (e) {
      console.error('⚠️ Could not load serviceAccountKey.json locally. Falling back to environment variables.');
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  dbInstance = getFirestore();
} catch (error) {
  console.error('❌ Firebase Admin Initialization Error:', error);
}

export const db = dbInstance;