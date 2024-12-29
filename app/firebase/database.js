// services/database.js
import { db, auth } from './firebaseConfig';
import { collection, addDoc, getDocs,setDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Logger from '../../lib/logger.js'

export async function db_AddUser(user) {
  try {
    // Store user data in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      credits: 0
    });
    Logger.info('User created successfully:', user);
    return user; // Return the created user object
  } catch (error) {
    Logger.error('Database.js - Error creating user:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

export async function db_DeleteUser(uid) {
  try {
    // Delete user from Firebase Authentication
    const user = auth.currentUser;

    if (user.uid !== uid) {
      throw new Error("Must be logged in to delete");
    }
    // Need to delete from firebase Auth also
    
    // Delete user data from Firestore db
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    Logger.info('User deleted successfully:', uid);
  } catch (error) {
    Logger.error('Database.js - Error deleting user:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

export async function db_GetUser(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData; // Return the user data
    } else {
      Logger.info('firebase/database db_GetUser: No such user!');
      return null; // Return null if the user doesn't exist
    }
  } catch (error) {
    Logger.error('Database.js - Error getting user:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

export async function db_UpdateUser(userId, updates) {
  // // Example usage:
  // const updates = {
  //   displayName: 'New Display Name',
  //   // ... other fields to update
  // };
  // updateUser('userUID', updates);
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    throw error; // Re-throw the error to handle it in the calling code
  }
}
