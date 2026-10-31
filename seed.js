const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Load your service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase using the new modular syntax
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function seedFirestore() {
  console.log('Loading Trendifacts backup...');
  
  try {
    const rawData = fs.readFileSync('trendifacts-backup.json');
    const posts = JSON.parse(rawData);
    
    console.log(`Uploading ${posts.length} posts to Firestore...`);
    
    // Use a batch write to commit all posts efficiently
    const batch = db.batch();
    
    posts.forEach(post => {
      const docRef = db.collection('posts').doc(post.slug);
      batch.set(docRef, {
        title: post.title,
        content: post.content,
        featuredImage: post.featuredImage,
        date: post.date,
        modified: post.modified,
        migratedAt: FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('✅ Success: All WordPress posts are now live in Firestore!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

seedFirestore();