import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Ensure environment variables are loaded before Firebase initializes
dotenv.config();

// Your Firebase config object from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyA3vpYKWWbblLSJFSUzvcuB_xhIbI5E74M",
  authDomain: "test-63f34.firebaseapp.com",
  projectId: "test-63f34",
  storageBucket: "test-63f34.firebasestorage.app",
  messagingSenderId: "9035201687",
  appId: "1:9035201687:web:7701c8172ab9dd53823dd2",
  measurementId: "G-QT13QQ4SB2"
};

// Validate required Firebase environment variables
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN', 
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID'
];

if (process.env.USE_FIREBASE === 'true') {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  // if (missingVars.length > 0) {
  //   console.error('Missing required Firebase environment variables:', missingVars);
  //   process.exit(1);
  // }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export default app;