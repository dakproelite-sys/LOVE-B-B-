import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get, push, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. Initialisation de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7x2d7kXK8hT0h7GvTBHZDZ30R-vqiSEY",
  authDomain: "love-bebe.firebaseapp.com",
  projectId: "love-bebe",
  storageBucket: "love-bebe.firebasestorage.app",
  messagingSenderId: "403955591576",
  appId: "1:403955591576:web:2d596ca141905e32e4e3ed",
  databaseURL: "https://love-bebe-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// 2. Fonction d'upload universel vers Cloudinary
export async function uploadMediaToCloudinary(fileOrBlob) {
    try {
        // Lecture dynamique de la configuration depuis la Realtime Database
        const configSnap = await get(ref(rtdb, 'config/cloudinary'));
        if (!configSnap.exists()) {
            throw new Error("Configuration Cloudinary introuvable dans Realtime Database");
        }
        const cloudConfig = configSnap.val();

        const formData = new FormData();
        formData.append("file", fileOrBlob);
        formData.append("upload_preset", cloudConfig.upload_preset || "love_bebe_preset");

        // Envoi automatique vers l'API Cloudinary
        const response = await fetch(cloudConfig.upload_url, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url; // Retourne l'URL publique générée
        } else {
            throw new Error(data.error?.message || "Échec de l'upload Cloudinary");
        }
    } catch (error) {
        console.error("Erreur lors de l'upload du média :", error);
        throw error;
    }
}

// 3. Envoi et enregistrement d'un message avec média (Vidéo, Vocal, Photo)
export async function sendMediaMessage(chatRoomId, senderUid, mediaFileOrBlob, type = "audio") {
    // A. Upload du fichier/vocal vers Cloudinary
    const mediaUrl = await uploadMediaToCloudinary(mediaFileOrBlob);

    // B. Enregistrement SEULEMENT de l'URL dans la Realtime Database
    const chatRef = ref(rtdb, `chats/${chatRoomId}`);
    const newMessageRef = push(chatRef);

    await set(newMessageRef, {
        senderUid: senderUid,
        mediaUrl: mediaUrl,
        type: type, // 'video', 'audio' (vocal/appel), 'image'
        timestamp: Date.now()
    });

    return mediaUrl;
}

// 4. Vérification automatique du Rôle Administrateur (dakjubile@gmail.com)
export async function checkAdminAndRedirect(user) {
    const adminSnap = await get(ref(rtdb, 'config/admin'));
    let isAdmin = false;

    if (adminSnap.exists() && adminSnap.val().email.toLowerCase() === user.email.toLowerCase()) {
        isAdmin = true;
    }

    // Mise à jour de l'utilisateur dans le nœud users/
    const userRef = ref(rtdb, `users/${user.uid}`);
    await update(userRef, {
        email: user.email,
        isAdmin: isAdmin,
        role: isAdmin ? "admin" : "user",
        lastLogin: new Date().toISOString()
    });

    // Redirection automatique
    if (isAdmin) {
        window.location.href = "admin.html"; // Redirection vers le profil Administrateur
    } else {
        window.location.href = "index.html"; // Redirection vers l'accueil Célibataires
    }
}
