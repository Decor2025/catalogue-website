// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCKi2Irrp1sRKuHFOZDZv27BHsM3Gc3SmE",
  authDomain: "decor-drapes-instyle.firebaseapp.com",
  databaseURL: "https://decor-drapes-instyle-default-rtdb.firebaseio.com",
  projectId: "decor-drapes-instyle",
  storageBucket: "decor-drapes-instyle.firebasestorage.app",
  messagingSenderId: "936396093551",
  appId: "1:936396093551:web:e72e2c2a0aee81fd9e759a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth & Database
const auth = firebase.auth();
const db = firebase.database();

// Cloudinary config
const CLOUDINARY_CONFIG = {
  cloudName: 'ds6um53cx',
  uploadPreset: 'images',
};

// Make them global
window.auth = auth;
window.db = db;
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;

console.log('Firebase initialized successfully');
