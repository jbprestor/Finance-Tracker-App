import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence is not exported in firebase@9 type definitions
import { Auth, browserLocalPersistence, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

// Import the functions you need from the SDKs you need

// TODO: Replace with your specific Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5Ssvid14JAV0dAKV8rdS6KNjCq2oURNY",
    authDomain: "my-finance-tracker-428aa.firebaseapp.com",
    projectId: "my-finance-tracker-428aa",
    storageBucket: "my-finance-tracker-428aa.firebasestorage.app",
    messagingSenderId: "137267792151",
    appId: "1:137267792151:web:ac4e7eab4c4040aba10f52",
    measurementId: "G-K9CR83FXJN"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: Auth;

if (Platform.OS === "web") {
    auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
    });
} else {
    // Explicitly cast to any to bypass the missing type definition for getReactNativePersistence
    const persistence = (getReactNativePersistence as any)(AsyncStorage);
    auth = initializeAuth(app, {
        persistence,
    });
}

// Analytics is not supported in React Native JS SDK without specific handling. 
// Removed duplicate initializeApp.

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

