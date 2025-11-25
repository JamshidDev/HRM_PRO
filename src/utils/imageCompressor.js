// utils/imageCompressor.js

import imageCompression from 'browser-image-compression';

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function compressImage(file) {
    try {
        if (file.size <= 200 * 1024) {
            return  await blobToBase64(file);
        }

        const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            maxIteration: 20,
            initialQuality: 0.7,
            fileType: 'image/jpeg'
        };

        let result = await imageCompression(file, options);
        if (result.size > 200 * 1024) {
            const result = await imageCompression(compressed, {
                maxSizeMB: 0.2,
                maxWidthOrHeight: 1280,
                maxIteration: 15,
                initialQuality: 0.5,
                fileType: 'image/jpeg'
            });
        }
        return await blobToBase64(result)
    } catch (error) {
        console.error('Rasmni siqishda xatolik:', error);
        throw error;
    }
}