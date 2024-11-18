// https://www.youtube.com/watch?v=lQftwBTCejE
// Video showing how to put firebase auth in next.js

// services/auth.js
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db_AddUser, db_UpdateUser, db_GetUser } from './database'
import { getImageFromStorage } from './storage'

export const registerUser = async (email, password) => {
  // Sign up
  // Returns user object
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    db_AddUser(userCredential.user) // Add user to db
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await db_UpdateUser(user.uid, { 'lastLogin': new Date().toISOString() }); // Update user last login in db

    // Fetch additional user data from the database
    const userData = await db_GetUser(user.uid);
    const dbModels = [];
    const userResult = {
      uid: user.uid,
      data: userData
    };
    // Add models to list from database
    await Promise.all(Object.entries(userData.models).map(async (model) => {
      const [modelName, modelData] = model;
      const formattedName = modelName.split('/')[0].replace('_', ' ');
      const newModel = {
        name: formattedName,
        generatedURLs: [],
        trained: null
      };

      // Process all generated paths and get URLS
      await Promise.all(Object.entries(modelData.generated).map(async ([fullPath, imgData]) => {
        const filePath = fullPath.split('.com/')[1]; // not sure if when saved to storage the ref i save will have the first part ending in .com
        if (!filePath) return;
        try {
          const url = await getImageFromStorage(filePath);
          if (url) {
            newModel.generatedURLs.push(url);
            newModel.generatedURLs.push(imgData[1]); // bool: If saved or not
          } else {
            // delete whatever img path didn't work from the database
            console.error('Failed to get image URL');
          }
        } catch (error) {
          console.error(`Error fetching image from storage for path ${filePath}:`, error);
        }
      }));
      dbModels.push(newModel);
    }));

    userResult.data.models = dbModels;
    return userResult;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  // Sign out
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
