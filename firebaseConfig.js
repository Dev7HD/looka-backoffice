// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvAMkrRJXtxQaJq0ZyapXFFvmJv-JKsT0",
  authDomain: "louka-ee7d3.firebaseapp.com",
  projectId: "louka-ee7d3",
  storageBucket: "louka-ee7d3.firebasestorage.app",
  messagingSenderId: "775606444523",
  appId: "1:775606444523:web:deb98aab4e88d985e039ae",
  measurementId: "G-QP47TJ9HFW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
