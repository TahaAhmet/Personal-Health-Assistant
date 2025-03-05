//firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Firebase Authentication'ı ekledik


const firebaseConfig = {
  apiKey: "AIzaSyAYMnvzFS7K46376435pBlYTQuHNzSceBU",
  authDomain: "tracking-system-6b444.firebaseapp.com",
  databaseURL: "https://tracking-system-6b444-default-rtdb.firebaseio.com", 
  projectId: "tracking-system-6b444",
  storageBucket: "tracking-system-6b444.firebasestorage.app",
  messagingSenderId: "564247098440",
  appId: "1:564247098440:web:ad532dda64a12a810f947d",
  measurementId: "G-TNGQRJRL1G"
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app); // Authentication ekledik

export { database, auth };
