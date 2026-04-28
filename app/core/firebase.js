"use client";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-TFfrdBuXGceYicmif--QLMcoHTrsVFk",
  authDomain: "webdev1-5086c.firebaseapp.com",
  projectId: "webdev1-5086c",
  storageBucket: "webdev1-5086c.firebasestorage.app",
  messagingSenderId: "1056711869946",
  appId: "1:1056711869946:web:bbce8dba09cb696ba49043"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);