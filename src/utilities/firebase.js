
import { getStorage } from 'firebase/storage';
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWkheRo5TrJGnCbLRpsuQKLY6WDr1ZWv8",
  authDomain: "ecocommute-72f01.firebaseapp.com",
  projectId: "ecocommute-72f01",
  storageBucket: "ecocommute-72f01.appspot.com",
  messagingSenderId: "653289667896",
  appId: "1:653289667896:web:cdc2f58a39396d6e5c55cd",
  measurementId: "G-9NXSHNRN76"
};
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  //  Steven: exporting db here to use in App.jsx
  //  IDK the general convention so feel free to move it around
  export const db = getFirestore(app);
  
  export const storage = getStorage(app);
  
  export const getDownloadURL = async (storageRef) => {
    try {
      const url = await storageRef.getDownloadURL();
      return url;
    } catch (error) {
      console.error("Error getting the download URL: ", error);
      return null;
    }
  };
  
  export const signInWithGoogle = () => {
    signInWithPopup(getAuth(app), new GoogleAuthProvider());
  };
  
  const firebaseSignOut = () => signOut(getAuth(app));
  
  export { firebaseSignOut as signOut };
  
  export const useAuthState = () => {
    const [user, setUser] = useState();
    
    useEffect(() => (
      onAuthStateChanged(getAuth(app), setUser)
    ), []);
  
    return [user];
  };
  
  