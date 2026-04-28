"use client";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function createAccount(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Initialize user in Firestore 'users' collection
    await setDoc(doc(db, "users", user.uid), {
      name: email.split("@")[0],
      email: email,
      tasks: [],
      createdAt: new Date().toISOString()
    });

    return userCredential;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  return await signOut(auth);
}