// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI",
    authDomain: "striker-police-dashboard.firebaseapp.com",
    projectId: "striker-police-dashboard",
    storageBucket: "striker-police-dashboard.firebasestorage.app",
    messagingSenderId: "534590523839",
    appId: "1:534590523839:web:861fb206f474b3b2bff90a"
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
