import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

export { uploadImages }; // Export the function
