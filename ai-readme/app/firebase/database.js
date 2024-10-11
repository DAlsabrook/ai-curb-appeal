// services/database.js
import { db, auth } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function db_AddUser(user) {
  try {
    // Store user data in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      credits: 0
    });
    console.log('User created successfully:', user);
    return user; // Return the created user object
  } catch (error) {
    console.error('Error creating user:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

export async function db_DeleteUser(userId) {
  try {
    // Delete user from Firebase Authentication
    const user = auth.currentUser;
    if (user) {
      await deleteUser(user);
    }

    // Delete user data from Firestore
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    console.log('User deleted successfully:', userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

export async function db_GetUser(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('firebase/database db_GetUser:', userData);
      return userData; // Return the user data
    } else {
      console.log('firebase/database db_GetUser: No such user!');
      return null; // Return null if the user doesn't exist
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}

export async function db_UpdateUser(userId, updates) {
  // // Example usage:
  // const updates = {
  //   displayName: 'New Display Name',
  //   // ... other fields to update
  // };
  // updateUser('user123', updates);
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    throw error; // Re-throw the error to handle it in the calling code
  }
}
