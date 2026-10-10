// love-bebe-service.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get, child } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) { analytics = getAnalytics(app); }
  });
}

// Fonction Cloudinary dynamique
export async function uploadMediaToCloudinary(file) {
    const snapshot = await get(child(ref(database), 'config/cloudinary'));
    if (!snapshot.exists()) {
        throw new Error("La configuration Cloudinary est introuvable dans Realtime Database.");
    }
    const cloudConfig = snapshot.val();
    const uploadUrl = cloudConfig.upload_url || `https://api.cloudinary.com/v1_1/${cloudConfig.cloud_name}/auto/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudConfig.upload_preset);

    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Échec du téléversement vers Cloudinary.");
    }
    return data.secure_url;
}

// Sécurité globale : Redirection stricte si non connecté
if (typeof window !== "undefined") {
    onAuthStateChanged(auth, (user) => {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        const isAuthPage = page === "connexion.html" || page === "inscription.html";

        if (!user && !isAuthPage) {
            window.location.href = "connexion.html";
        } else if (user && isAuthPage) {
            window.location.href = "index.html";
        }
    });
}

export { app, auth, database, analytics, onAuthStateChanged, signOut, ref, get, child };
