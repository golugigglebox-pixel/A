// Import Firebase App
import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



// -------------------------------
// SIGNUP
// -------------------------------
export async function userSignup(name, email, password) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;

    // Save user data in Realtime DB
    await set(ref(db, "users/" + uid), {
      uid: uid,
      name: name,
      email: email,
      wallet: 0,
      totalInvested: 0,
      totalEarnings: 0,
      referredBy: "",
      joinDate: Date.now()
    });

    return { status: true, uid: uid };
  } catch (error) {
    return { status: false, message: error.message };
  }
}



// -------------------------------
// LOGIN
// -------------------------------
export async function userLogin(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return { status: true, uid: res.user.uid };
  } catch (error) {
    return { status: false, message: error.message };
  }
}



// -------------------------------
// AUTO LOGIN CHECK
// -------------------------------
export function checkLogin(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snapshot = await get(child(ref(db), "users/" + user.uid));

      if (snapshot.exists()) {
        callback(true, snapshot.val());
      } else {
        callback(false, null);
      }
    } else {
      callback(false, null);
    }
  });
}



// -------------------------------
// LOGOUT
// -------------------------------
export function userLogout() {
  return signOut(auth);
}
