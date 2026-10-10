// ==========================================
// 1. CONFIGURATION CLOUDINARY
// ==========================================
const CLOUD_NAME = "jnwkfel1";
// Identifiants Cloudinary issus de votre compte
// API Key : 688731538869986
// API Secret : p43yS4YoggqBIRcClxDiZgfueBE

/**
 * Fonction universelle d'upload vers Cloudinary
 * Envoie automatiquement les images, vidéos, audios et appels vocaux/vidéos.
 * @param {File|Blob} fileOrBlob - Le fichier à envoyer (image, vidéo, audio, blob d'appel)
 * @param {string} resourceType - 'image', 'video', 'raw' ou 'auto'
 * @returns {Promise<string>} - L'URL publique sécurisée hébergée sur Cloudinary
 */
export async function uploadToCloudinary(fileOrBlob, resourceType = "auto") {
    const formData = new FormData();
    formData.append("file", fileOrBlob);
    // Utilisation d'un preset d'upload anonyme (Unsigned Upload Preset)
    formData.append("upload_preset", "love_bebe_preset"); 

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error(data.error ? data.error.message : "Échec de l'upload vers Cloudinary.");
        }
    } catch (error) {
        console.error("Erreur Upload Cloudinary :", error);
        throw error;
    }
}


// ==========================================
// 2. CONFIGURATION & ÉCRITURE DANS FIREBASE REALTIME DATABASE & FIRESTORE
// ==========================================
import { auth, db } from "./firebase-config.js";
import { getDatabase, ref, set, update, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { doc, setDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Liste des adresses emails déclarées Administrateur
const ADMIN_EMAILS = [
    "davidaglignamou2@gmail.com"
];

const realtimeDb = getDatabase();

/**
 * Enregistre ou met à jour un utilisateur dans Realtime Database et Firestore.
 * Attribue automatiquement le rôle Administrateur pour davidaglignamou2@gmail.com.
 * @param {Object} user - L'objet utilisateur issu de Firebase Auth
 * @param {Object} additionalProfileData - Données complémentaires (médias Cloudinary, pays, téléphone, etc.)
 */
export async function saveUserToDatabase(user, additionalProfileData = {}) {
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
    const uid = user.uid;

    const userData = {
        uid: uid,
        email: user.email,
        isAdmin: isAdmin,
        role: isAdmin ? "admin" : "user",
        updatedAt: new Date().toISOString(),
        ...additionalProfileData
    };

    try {
        // 1. Écriture directe dans Firebase Realtime Database
        const dbRef = ref(realtimeDb, 'users/' + uid);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            await update(dbRef, userData);
        } else {
            await set(dbRef, userData);
        }

        // 2. Écriture directe dans Firestore
        const firestoreRef = doc(db, "users", uid);
        const docSnap = await getDoc(firestoreRef);

        if (docSnap.exists()) {
            await updateDoc(firestoreRef, userData);
        } else {
            await setDoc(firestoreRef, userData);
        }

        console.log(`Données enregistrées avec succès pour : ${user.email} (Rôle Admin : ${isAdmin})`);
        return { isAdmin, userData };

    } catch (error) {
        console.error("Erreur d'écriture dans Realtime Database / Firestore :", error);
        throw error;
    }
}


// ==========================================
// 3. ENREGISTREMENT DES MÉDIAS DE CHAT OU D'APPELS DANS REALTIME DATABASE
// ==========================================
/**
 * Enregistre un média (image, vidéo, enregistrement audio d'un appel) directement dans Realtime DB
 * @param {string} senderUid - ID de l'expéditeur
 * @param {string} receiverUid - ID du destinataire
 * @param {File|Blob} mediaBlob - Le fichier ou enregistrement audio/vidéo
 * @param {string} mediaType - 'image', 'video', ou 'audio'
 */
export async function sendMediaMessage(senderUid, receiverUid, mediaBlob, mediaType) {
    try {
        // 1. Upload automatique du média vers Cloudinary
        const mediaUrl = await uploadToCloudinary(mediaBlob, mediaType === "image" ? "image" : "video");

        // 2. Création de l'objet message
        const messageData = {
            senderUid: senderUid,
            receiverUid: receiverUid,
            mediaUrl: mediaUrl,
            mediaType: mediaType, // 'image', 'video', ou 'audio'
            timestamp: Date.now()
        };

        // 3. Écriture directe dans Realtime Database sous l'historique des conversations
        const chatRoomId = [senderUid, receiverUid].sort().join("_");
        const newMessageRef = ref(realtimeDb, `chats/${chatRoomId}/${Date.now()}`);
        await set(newMessageRef, messageData);

        return mediaUrl;
    } catch (error) {
        console.error("Erreur lors de l'envoi du média :", error);
        throw error;
    }
}
