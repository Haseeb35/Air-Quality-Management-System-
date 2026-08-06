import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // 1. Import Database

// REPLACE THIS WITH YOUR ACTUAL KEYS FROM FIREBASE CONSOLE
export const firebaseConfig = {
    apiKey: "AIzaSyA-WJ1-v6ZY72aaBcT4sAxsLyyDdi2aP6o",
    authDomain: "air-quality-system-1a337.firebaseapp.com",
    databaseURL: "https://air-quality-system-1a337-default-rtdb.firebaseio.com",
    projectId: "air-quality-system-1a337",
    storageBucket: "air-quality-system-1a337.firebasestorage.app",
    messagingSenderId: "106550052084",
    appId: "1:106550052084:web:1e1961b5bc41b14b034aa1",
    measurementId: "G-3KVCWD26V2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realDb = getDatabase(app); // 2. Export Realtime Database