// https://www.youtube.com/watch?v=lQftwBTCejE
// Video showing how to put firebase auth in next.js

// services/auth.js
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db_AddUser, db_UpdateUser, db_GetUser } from './database'

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
    await db_UpdateUser(user.uid, { 'last login': new Date().toISOString() }); // Update user last login in db

    // Fetch additional user data from the database
    const userData = await db_GetUser(user.uid);
    // console.log('Firebase/auth user data:')
    // console.log(userData)
    return {
      uid: user.uid,
      models: userData.models,
      credits: userData.credits,
    };
  } catch (error) {
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
