// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/env";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
//   appId: process.env.NEXT_PUBLIC_APP_ID,
//   storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
//   apiKey: process.env.NEXT_PUBLIC_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
//   measurementId: process.env.NEXT_PUBLIC_MEASURMENT_ID,
//   messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
// };

console.log(firebaseConfig, "thisis");

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
