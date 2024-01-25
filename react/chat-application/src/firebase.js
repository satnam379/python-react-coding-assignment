// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAV3TPm2he0rWAWNnMpYW9doDtnMvHBFDk",
  authDomain: "chat-application-bc65e.firebaseapp.com",
  projectId: "chat-application-bc65e",
  storageBucket: "chat-application-bc65e.appspot.com",
  messagingSenderId: "358046651585",
  appId: "1:358046651585:web:ff3363a121de1562dc3040",
  measurementId: "G-K8DL4P329E"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);