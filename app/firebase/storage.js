import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, listAll, getStorage } from 'firebase/storage';
import axios from 'axios';
import Logger from '../../lib/logger.js'

const uploadImages = async (files, userUID, modelName) => {
  try {
    const uploadPromises = files.map(file => {
      const storageRef = ref(storage, `${userUID}/${modelName}/${file.name}`);
      return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });

    const urls = await Promise.all(uploadPromises);
    return urls; // Returns an array of download URLs
  } catch (error) {
    throw error;
  }
};

const uploadInputImage = async (image, userUID, modelName) => {
  try {
    // Create a reference to the first image in Cloud Storage
    const imageRef = ref(storage, `${userUID}/${modelName}/inputImage/${modelName}-DisplayImage.jpg`);
    // Upload the first image
    const imageSnapshot = await uploadBytes(imageRef, image);
    // First image uploaded successfully
    const imageDownloadURL = await getDownloadURL(imageSnapshot.ref); // Get the download URL for the first image
    return imageDownloadURL;
  } catch (error) {
    // Handle upload errors
    Logger.error('Storage.js - Image Upload error:', error);
    throw error; // throw the error to handle it in the calling function
  }
}

const uploadInputZip = async (zipFile, userUID, modelName) => {
  try {
    // Create a reference to the zip file in Cloud Storage
    const zipFileRef = ref(storage, `${userUID}/${modelName}/inputZip/${modelName}inputImages.zip`);
    // Upload the zip file
    const zipSnapshot = await uploadBytes(zipFileRef, zipFile);
    // Zip file uploaded successfully
    const zipDownloadURL = await getDownloadURL(zipSnapshot.ref); // Get the download URL for the zip file
    return zipDownloadURL; // Return the download URLs
  } catch (error) {
    // Handle upload errors
    Logger.error('Storage.js - Upload error:', error);
    throw error; // throw the error to handle it in the calling function
  }
};

// Function to get all images in a specific folder
async function getGeneratedImages(folderPath) {
  try {
    // Create a reference to the folder
    const folderRef = ref(storage, folderPath);

    // List all files in the folder
    const listResult = await listAll(folderRef);

    // Get download URLs for each image
    const imageUrls = await Promise.all(
      listResult.items.map(async (itemRef) => {
        const downloadURL = await getDownloadURL(itemRef);
        return downloadURL;
      })
    );

    return imageUrls;
  } catch (error) {
    Logger.error("Storage.js - Error getting images:", error);
    return []; // Return an empty array on error
  }
}


async function getImageFromStorage(imagePath) {
  // const imagePath = 'ghKALyqoHHOMOknTGMsrk86sqOW2/Black_house/trained/replicate-prediction-ttzkweh5nxrm20chtkcvqx13bm-0.png'

  try {
    // 1. Initialize Firebase Storage
    const storage = getStorage();

    // 2. Create a reference to the image in Storage
    const imageRef = ref(storage, imagePath);

    // 3. Get the download URL
    const downloadURL = await getDownloadURL(imageRef);

    // 4. Return the download URL
    return downloadURL;
  } catch (error) {
    // Handle any errors
    Logger.error('Storage.js - Error getting image:', error);
    return null;
  }
}


// Function to save an image from a URL to Firebase storage
async function saveImageToStorage(folderPath, imageUrl) {
  try {
    // Download the image from the URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Create a reference to the file in Firebase storage
    const imageRef = ref(storage, `${folderPath}/${Date.now()}.webp`);

    // Upload the image buffer to Firebase storage
    await uploadBytes(imageRef, imageBuffer, { contentType: 'image/webp' });

    // Get the download URL of the uploaded image
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    Logger.error("Storage.js - Error saving image to storage:", error);
    throw error;
  }
}

export { uploadImages, uploadInputZip, getGeneratedImages, saveImageToStorage, getImageFromStorage, uploadInputImage }; // Export the function
