"use client";
import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function createProfile(profileData) {
  try {
    if (!profileData.uid) throw new Error("No UID provided for profile");

    const docRef = doc(db, "users", profileData.uid);
    
    await setDoc(docRef, profileData, { merge: true });
    
    return { id: profileData.uid, ...profileData };
  } catch (err) {
    console.error("Error creating profile:", err);
    throw err;
  }
}


export async function updateProfile(profileId, newData) {
  try {
    const docRef = doc(db, "users", profileId);
    await updateDoc(docRef, newData);
    return true;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
}

export async function getProfile(profileId) {
  try {
    const docRef = doc(db, "users", profileId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("Error fetching profile:", err);
    return null;
  }
}