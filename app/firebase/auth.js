import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { db_AddUser, db_UpdateUser, db_GetUser } from './database';
import { getImageFromStorage } from './storage';
import Logger from '../../lib/logger.js';

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Send verification email
    const actionCodeSettings = {
      url: 'https://ai-curb-appeal.vercel.app',
      handleCodeInApp: true
    };
    try {
      await sendEmailVerification(userCredential.user, actionCodeSettings);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }

    await db_AddUser(userCredential.user); // Add user to db
    return userCredential.user;
  } catch (error) {
    Logger.error('Firebase Auth File: Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const updates = {
        isValid: user.emailVerified,
        lastLogin: new Date().toISOString()
    };

    // Update the user in the database
    await db_UpdateUser(user.uid, updates);
    
    // Fetch additional user data from the database
    const userData = await db_GetUser(user.uid);
    if (!userData) {
      Logger.error('Firebase Auth File: User data not found for UID:', user.uid);
      throw new Error('User data not found');
    }

    const dbModels = [];
    const userResult = {
      uid: user.uid,
      data: userData,
    };

    // Check if userData.models exists and is an object
    if (userData.models && typeof userData.models === 'object') {
      // Add models to list from database
      await Promise.all(
        Object.entries(userData.models).map(async (model) => {
          const [modelName, modelData] = model;
          const newModel = {
            name: modelName,
            generatedURLs: [],
            trained: null,
          };

          // Process all generated paths and get URLs
          if (modelData.generated && typeof modelData.generated === 'object') {
            await Promise.all(
              Object.entries(modelData.generated).map(async ([fullPath, imgData]) => {
                const filePath = fullPath.split('.com/')[1]; // not sure if when saved to storage the ref i save will have the first part ending in .com
                if (!filePath) return;
                try {
                  const url = await getImageFromStorage(filePath);
                  if (url && Array.isArray(imgData)) {
                    newModel.generatedURLs.push(url);
                    newModel.generatedURLs.push(imgData[1]); // bool: If saved or not
                  } else {
                    // delete whatever img path didn't work from the database
                    Logger.error('Firebase Auth File: Failed to get image URL or imgData is not an array');
                  }
                } catch (error) {
                  Logger.error(`Firebase Auth File: Error fetching image from storage for path ${filePath}:`, error);
                }
              })
            );
          }

          dbModels.push(newModel);
        })
      );
    } else {
      Logger.warn('Firebase Auth File: No models found for user:', user.uid);
    }

    userResult.data.models = dbModels;
    return userResult;
  } catch (error) {
    Logger.error('Firebase Auth File: Error logging in user:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    Logger.error('Firebase Auth File: Error logging out user:', error);
    throw error;
  }
};
