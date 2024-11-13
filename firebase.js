// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYAgiqdQ8x15D4JV-twnVkfmxsbjK_HyE",
  authDomain: "personal-health-assistan-310a6.firebaseapp.com",
  projectId: "personal-health-assistan-310a6",
  storageBucket: "personal-health-assistan-310a6.firebasestorage.app",
  messagingSenderId: "422583019688",
  appId: "1:422583019688:web:0649cba454edcf3fa03a9d",
  measurementId: "G-ER5TW0QWEG"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

export { auth };
