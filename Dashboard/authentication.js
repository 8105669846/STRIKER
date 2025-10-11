// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
  authDomain: "striker-e07d7.firebaseapp.com",
  databaseURL: "https://striker-e07d7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "striker-e07d7",
  storageBucket: "striker-e07d7.firebasestorage.app",
  messagingSenderId: "220201380562",
  appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Logged in as:", userCredential.user.email);
      alert("Login successful!");
      window.location.href = "index.html"; // Redirect after login
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
      console.error(error);
    });
}

// Expose function to window for button access
window.login = login;
