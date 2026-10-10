// love-bebe-service.js
export async function uploadMediaToCloudinary(file) {
    const cloudName = "jnwkfel1"; // Remplacez par votre vrai Cloud Name Cloudinary si besoin
    const unsignedUploadPreset = "love_bebe_preset"; // Votre Preset Unsigned dans Cloudinary

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", unsignedUploadPreset);

    const resourceType = file.type.startsWith("video") ? "video" : "image";
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erreur lors du téléversement Cloudinary.");
    }

    const data = await response.json();
    return data.secure_url;
}
