import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load env variables first
dotenv.config();

// Initialize Admin SDK using either GOOGLE_APPLICATION_CREDENTIALS or inline JSON
if (!admin.apps.length) {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Will read GOOGLE_APPLICATION_CREDENTIALS automatically if set
    admin.initializeApp();
  }
}

export const db = admin.firestore();
export default admin;


