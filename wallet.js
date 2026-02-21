import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


// ---------------------------------
// GET USER DATA
// ---------------------------------
export async function getUser(uid) {
  const snap = await get(ref(db, "users/" + uid));
  return snap.exists() ? snap.val() : null;
}



// ---------------------------------
// ADD BALANCE (RECHARGE REQUEST)
// ---------------------------------
export async function addBalanceRequest(uid, amount, paymentScreenshotURL) {
  const reqRef = push(ref(db, "rechargeRequests/"));

  await set(reqRef, {
    requestId: reqRef.key,
    uid: uid,
    amount: Number(amount),
    screenshot: paymentScreenshotURL,
    status: "pending",
    time: Date.now()
  });

  return true;
}



// ---------------------------------
// ADMIN APPROVE RECHARGE
// ---------------------------------
export async function adminApproveRecharge(requestId) {
  const snap = await get(ref(db, "rechargeRequests/" + requestId));
  if (!snap.exists()) return false;

  const req = snap.val();

  // Update user wallet
  const userSnap = await get(ref(db, "users/" + req.uid));
  if (!userSnap.exists()) return false;

  const user = userSnap.val();
  const newBalance = Number(user.wallet) + Number(req.amount);

  await update(ref(db, "users/" + req.uid), {
    wallet: newBalance
  });

  // Update request status
  await update(ref(db, "rechargeRequests/" + requestId), {
    status: "approved"
  });

  return true;
}



// ---------------------------------
// BUY PRODUCT (DEDUCT BALANCE)
// ---------------------------------
export async function buyProduct(uid, productId, price) {
  const user = await getUser(uid);
  if (!user) return { status: false, message: "User not found" };

  if (Number(user.wallet) < Number(price)) {
    return { status: false, message: "Insufficient balance" };
  }

  const newBalance = Number(user.wallet) - Number(price);

  // Deduct balance
  await update(ref(db, "users/" + uid), {
    wallet: newBalance,
    totalInvested: Number(user.totalInvested) + Number(price)
  });

  // Add investment record
  const investRef = push(ref(db, "investments/"));
  await set(investRef, {
    investId: investRef.key,
    uid: uid,
    productId: productId,
    amount: price,
    startTime: Date.now(),
    status: "active"
  });

  return { status: true };
}



// ---------------------------------
// SAVE WALLET HISTORY
// ---------------------------------
export async function saveWalletHistory(uid, type, amount, message) {
  const hisRef = push(ref(db, "walletHistory/" + uid));

  await set(hisRef, {
    id: hisRef.key,
    type: type, // credit / debit
    amount: Number(amount),
    message: message,
    time: Date.now()
  });

  return true;
    }
