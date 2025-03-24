// src/firebaseConfig.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0EWiJqudZjl9suLqvJDbohD0M9IoapFc",
  authDomain: "ghr-sdp.firebaseapp.com",
  projectId: "ghr-sdp",
  storageBucket: "ghr-sdp.firebasestorage.app",
  messagingSenderId: "1068212307465",
  appId: "1:1068212307465:web:638fc626b6d23f87c49ad8",
  measurementId: "G-7X5W0SM230"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export auth and Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();