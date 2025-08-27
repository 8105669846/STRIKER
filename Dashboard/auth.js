import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCDvfrPIcYO2B0YyGLqSgoALR68S8vFTrM",
  authDomain: "striker-e07d7.firebaseapp.com",
  projectId: "striker-e07d7",
  storageBucket: "striker-e07d7.firebasestorage.app",
  messagingSenderId: "220201380562",
  appId: "1:220201380562:web:eaf560b5fd6e54ab779b0b"
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
