// src/main/utils/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBh-xvH73SE7ruDqZWxWqZgE3HlIY6KMKs",
    authDomain: "wasa-licensing.firebaseapp.com",
    projectId: "wasa-licensing",
    storageBucket: "wasa-licensing.firebasestorage.app",
    messagingSenderId: "159987894077",
    appId: "1:159987894077:web:f2609d22e5e8ccba5d6754",
    measurementId: "G-4B29Y0SC9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase initialized with config:", db);

export { db };