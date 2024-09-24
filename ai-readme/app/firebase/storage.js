import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

const uploadImages = async (files, userName, modelName) => {
  try {
    const uploadPromises = files.map(file => {
      const storageRef = ref(storage, `${userName}/${modelName}/${file.name}`);
      return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });

    const urls = await Promise.all(uploadPromises);
    return urls; // Returns an array of download URLs
  } catch (error) {
    throw error;
  }
};

// Function to get all images in a specific folder
async function getUploadedImages(folderPath) {
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
    console.error("Error getting images:", error);
    return []; // Return an empty array on error
  }
}


export { uploadImages }; // Export the function
