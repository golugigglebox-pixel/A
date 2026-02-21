// Firebase SDKs Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDi4coFSKvCVmde9jqCI467XVW3hN-oGo4",
  authDomain: "shoes-shopping-app-6a1d3.firebaseapp.com",
  databaseURL: "https://shoes-shopping-app-6a1d3-default-rtdb.firebaseio.com",
  projectId: "shoes-shopping-app-6a1d3",
  storageBucket: "shoes-shopping-app-6a1d3.appspot.com",
  messagingSenderId: "816065792865",
  appId: "1:816065792865:web:e137703381e98c59961320",
  measurementId: "G-TKT836KPLF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
