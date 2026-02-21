// ---------------------------
// 📌 LOAD BANNERS 
// ---------------------------
db.ref("banners").on("value", snap => {
  let banners = snap.val();
  let html = "";

  for (let id in banners) {
    html += `<img src="${banners[id].url}" class="banner-img"/>`;
  }

  document.getElementById("banner-slider").innerHTML = html;
});
// ---------------------------
// 📌 NEW ARRIVALS
// ---------------------------
db.ref("products")
  .limitToLast(5) // latest products
  .on("value", snap => {

    let html = "";
    snap.forEach(item => {
      let p = item.val();
      html += `
        <div class='arrival-card'>
          <img src="${p.image}" class="arrival-img">
          <p class="arrival-name">${p.name}</p>
          <p class="arrival-price">₹${p.price}</p>
        </div>
      `;
    });

    document.getElementById("new-arrivals").innerHTML = html;
});
// ---------------------------
// 📌 LIVE TRANSACTIONS TICKER
// ---------------------------
db.ref("live_transactions").on("value", snap => {
  let entries = snap.val();
  let text = "";

  for (let id in entries) {
    text += ` ${entries[id].user} — ₹${entries[id].amount} | `;
  }

  document.getElementById("live-transactions").innerText = text;
});
// ---------------------------
// 📌 DAILY CHECK-IN (SAFE)
// ---------------------------
function dailyCheckIn() {
  alert("Daily check-in recorded! (Demo only)");
}
import { db } from "./firebase.js";
import {
  ref,
  get,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { getUser } from "./wallet.js";
import { getNewArrivals } from "./product.js";



// --------------------------------------------------------
// LOAD USER SUMMARY (name, wallet, invested, earnings)
// --------------------------------------------------------
export async function loadUserSummary(uid) {
  const user = await getUser(uid);

  if (!user) return;

  document.getElementById("userName").innerText = user.name;
  document.getElementById("walletBalance").innerText = user.wallet;
  document.getElementById("totalInvested").innerText = user.totalInvested;
  document.getElementById("totalEarnings").innerText = user.totalEarnings;
}



// --------------------------------------------------------
// LOAD NEW ARRIVALS (Home Page)
// --------------------------------------------------------
export async function loadHomeNewArrivals() {
  const items = await getNewArrivals();
  let html = "";

  items.forEach(p => {
    html += `
      <div class="na-card">
        <img src="${p.image}" />
        <p>${p.name}</p>
        <span>₹${p.price}</span>
      </div>
    `;
  });

  document.getElementById("newArrivalsBox").innerHTML = html;
}



// --------------------------------------------------------
// DAILY CHECK-IN REWARD SYSTEM
// --------------------------------------------------------
export async function dailyCheckIn(uid, rewardAmount = 10) {
  const snap = await get(ref(db, "users/" + uid));
  if (!snap.exists()) return { status: false };

  const user = snap.val();
  const now = Date.now();

  // If last check-in exists
  if (user.lastCheckIn) {
    const diff = now - user.lastCheckIn;

    if (diff < 24 * 60 * 60 * 1000) {
      return { status: false, message: "Already checked in today" };
    }
  }

  const newWallet = Number(user.wallet) + rewardAmount;

  await update(ref(db, "users/" + uid), {
    wallet: newWallet,
    lastCheckIn: now
  });

  // Save check-in log
  await push(ref(db, "checkInHistory/" + uid), {
    amount: rewardAmount,
    time: now
  });

  return { status: true, newWallet };
}



// --------------------------------------------------------
// LOAD LIVE TRANSACTIONS (Admin Controlled)
// --------------------------------------------------------
export async function loadLiveTransactions() {
  const snap = await get(ref(db, "liveTransactions/"));
  if (!snap.exists()) return;

  const data = Object.values(snap.val());
  const box = document.getElementById("liveList");
  let html = "";

  data.forEach(t => {
    html += `
      <marquee behavior="scroll" direction="left">
        ${t.name} earned ₹${t.amount}
      </marquee>
    `;
  });

  box.innerHTML = html;
}
