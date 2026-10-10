import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuration unique et propre de votre projet Firebase "Love Bébé"
const firebaseConfig = {
  apiKey: "AIzaSyC7x2d7kXK8hT0h7GvTBHZDZ30R-vqiSEY",
  authDomain: "love-bebe.firebaseapp.com",
  projectId: "love-bebe",
  storageBucket: "love-bebe.firebasestorage.app",
  messagingSenderId: "403955591576",
  appId: "1:403955591576:web:2d596ca141905e32e4e3ed",
  measurementId: "G-FGL1HKNVVC",
  databaseURL: "https://love-bebe-default-rtdb.firebaseio.com" // Ajouté pour connecter Realtime Database sans conflit
};

// Initialisation unique de l'application
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
