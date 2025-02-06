import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getDatabase } from 'firebase/database'; 
import { getAnalytics } from 'firebase/analytics'; 


const firebaseConfig = {
  apiKey: "AIzaSyAYAgiqdQ8x15D4JV-twnVkfmxsbjK_HyE", 
  authDomain: "personal-health-assistan-310a6.firebaseapp.com",
  projectId: "personal-health-assistan-310a6",
  storageBucket: "personal-health-assistan-310a6.firebasestorage.app",
  messagingSenderId: "422583019688",
  appId: "1:422583019688:web:0649cba454edcf3fa03a9d",
  measurementId: "G-ER5TW0QWEG", 
  databaseURL: "https://personal-health-assistan-310a6-default-rtdb.firebaseio.com/", 
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig); 
} else {
  firebase.app(); 
}


const auth = firebase.auth();
const firestore = firebase.firestore(); 
const database = getDatabase(); 
const analytics = getAnalytics(); 


const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;


export { auth, firestore, database, analytics, serverTimestamp };
export default firebase;
