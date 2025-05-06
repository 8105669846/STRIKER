import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI",
  authDomain: "striker-police-dashboard.firebaseapp.com",
  projectId: "striker-police-dashboard",
  storageBucket: "striker-police-dashboard.firebasestorage.app",
  messagingSenderId: "534590523839",
  appId: "1:534590523839:web:861fb206f474b3b2bff90a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized");

// Get Firestore
const db = getFirestore(app);
console.log("Firestore initialized");

