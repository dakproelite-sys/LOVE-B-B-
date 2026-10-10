// love-bebe-service.js - Service Central & Contrôleur de Sécurité

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get, child, update, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuration Firebase
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

// Analytics
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) { analytics = getAnalytics(app); }
  });
}

// Upload Cloudinary Dynamique
export async function uploadMediaToCloudinary(file) {
    const snapshot = await get(child(ref(database), 'config/cloudinary'));
    if (!snapshot.exists()) {
        throw new Error("Configuration Cloudinary introuvable dans la base de données.");
    }
    const cloudConfig = snapshot.val();
    const uploadUrl = cloudConfig.upload_url || `https://api.cloudinary.com/v1_1/${cloudConfig.cloud_name}/auto/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudConfig.upload_preset);

    const response = await fetch(uploadUrl, { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Échec du téléversement Cloudinary.");
    }
    return data.secure_url;
}

// --- CONTRÔLEUR DE SÉCURITÉ ET PROTECTION DES PAGES ---
if (typeof window !== "undefined") {
    // Liste des pages publiques (accessibles sans connexion)
    const pageName = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
    const isPublicPage = pageName === "connexion.html" || pageName === "inscription.html" || pageName === "politique-de-confidentialite.html";

    onAuthStateChanged(auth, (user) => {
        if (!user && !isPublicPage) {
            // L'utilisateur n'est PAS connecté et tente d'accéder à une page privée -> Redirection forcée
            window.location.replace("connexion.html");
        } else if (user && (pageName === "connexion.html" || pageName === "inscription.html")) {
            // L'utilisateur EST connecté mais essaie d'aller sur connexion -> Redirection vers l'accueil
            window.location.replace("index.html");
        }
    });
}

export { app, auth, database, analytics, onAuthStateChanged, signOut, ref, get, child, update, set };
