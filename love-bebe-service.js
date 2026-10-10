import { initializeApp, getApp, getApps } from
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getDatabase } from
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuration de LOVE BÉBÉ
const firebaseConfig = {
  apiKey: "AIzaSyC7x2d7kXK8hT0h7GvTBHZDZ30R-vqiSEY",
  authDomain: "love-bebe.firebaseapp.com",
  databaseURL: "https://love-bebe-default-rtdb.firebaseio.com",
  projectId: "love-bebe",
  storageBucket: "love-bebe.firebasestorage.app",
  messagingSenderId: "403955591576",
  appId: "1:403955591576:web:2d596ca141905e32e4e3ed",
  measurementId: "G-FGL1HKNVVC"
};

// Initialiser Firebase une seule fois
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Services utilisés par l'application
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;