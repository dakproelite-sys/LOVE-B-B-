// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, database, analytics };
