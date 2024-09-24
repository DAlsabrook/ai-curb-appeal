// https://www.youtube.com/watch?v=lQftwBTCejE
// Video showing how to put firebase auth in next.js

// services/auth.js
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const registerUser = async (email, password) => {
  // Sign up
  // Returns user object
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  // Sign in
  // Returns user object
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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
