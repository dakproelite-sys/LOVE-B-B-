// love-bebe-service.js
// Fichier centralisé pour la logique et les services de Love Bébé

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, child } from "firebase/database";

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

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Analytics sécurisé
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

/**
 * Fonction partagée de téléversement de fichiers vers Cloudinary
 * en lisant dynamiquement la configuration depuis Realtime Database (config/cloudinary)[span_1](start_span)[span_1](end_span)
 */
export async function uploadMediaToCloudinary(file) {
    const snapshot = await get(child(ref(database), 'config/cloudinary'));
    
    if (!snapshot.exists()) {
        throw new Error("La configuration Cloudinary est introuvable dans Realtime Database.");
    }

    const cloudConfig = snapshot.val();
    const uploadUrl = cloudConfig.upload_url || `https://api.cloudinary.com/v1_1/${cloudConfig.cloud_name}/auto/upload`;
    const uploadPreset = cloudConfig.upload_preset;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Échec du téléversement vers Cloudinary.");
    }

    return data.secure_url;
}

// Export des instances Firebase pour les utiliser dans vos pages HTML
export { app, auth, database, analytics };
