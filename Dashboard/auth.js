import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCAjGLm5Qk2di9_1nc9zKRYUCxsP8melvI",
    authDomain: "striker-police-dashboard.firebaseapp.com",
    projectId: "striker-police-dashboard",
    storageBucket: "striker-police-dashboard.firebasestorage.app",
    messagingSenderId: "534590523839",
    appId: "1:534590523839:web:861fb206f474b3b2bff90a"
  };

// Initializing Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Logout of the function
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("Logout failed: " + error.message);
  });
};

//Displays previously logged-in user's email
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("officer-email").innerText = user.email;
  } else {
    window.location.href = "login.html"; // Redirect if not logged in
  }
});
