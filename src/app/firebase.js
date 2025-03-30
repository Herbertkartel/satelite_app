// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiF5UEus89rL4gqMHa6v1m_ausPU4sQ4I",
  authDomain: "satelite-app-9d888.firebaseapp.com",
  projectId: "satelite-app-9d888",
  storageBucket: "satelite-app-9d888.firebasestorage.app",
  messagingSenderId: "345458793406",
  appId: "1:345458793406:web:8b5be01ae3c6ea486177ef",
  measurementId: "G-9NTHEW8FNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Analytics
const db = getFirestore(app); // Firestore initialization
const analytics = getAnalytics(app); // Analytics initialization

// Export the Firestore database for use in your app
export { db, analytics };
