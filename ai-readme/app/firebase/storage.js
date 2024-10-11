import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

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

const uploadZip = async (zipFile, userUID, modelName) => {
  const storageRef = ref(storage, `${userUID}/User_Model_Uploads/${modelName}`);
  // Create a reference to the file in Cloud Storage
  const fileRef = ref(storageRef, `${modelName}-Images.zip`);

  // Upload the file
  try {
    const snapshot = await uploadBytes(fileRef, zipFile);
    // File uploaded successfully
    const downloadURL = await getDownloadURL(snapshot.ref); // Get the download URL
    return downloadURL; // Return the download URL
  } catch (error) {
    // Handle upload errors
    console.error('Upload error:', error);
    throw error; // throw the error to handle it in the calling function
  }
}

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


export { uploadImages, uploadZip }; // Export the function
