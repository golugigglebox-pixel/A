import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



// -----------------------------------------------------
// SAVE or UPDATE BANK DETAILS
// -----------------------------------------------------
export async function saveBankDetails(uid, bankName, accNumber, ifsc, holderName) {
  await set(ref(db, "bankDetails/" + uid), {
    bankName,
    accNumber,
    ifsc,
    holderName
  });

  return true;
}



// -----------------------------------------------------
// GET BANK DETAILS
// -----------------------------------------------------
export async function getBankDetails(uid) {
  const snap = await get(ref(db, "bankDetails/" + uid));
  return snap.exists() ? snap.val() : null;
}



// -----------------------------------------------------
// USER → CREATE WITHDRAWAL REQUEST
// -----------------------------------------------------
export async function createWithdraw(uid, amount) {
  const userSnap = await get(ref(db, "users/" + uid));
  if (!userSnap.exists()) return { status: false, message: "User not found" };

  const user = userSnap.val();

  if (Number(user.wallet) < Number(amount)) {
    return { status: false, message: "Insufficient Balance" };
  }

  const reqRef = push(ref(db, "withdrawRequests/"));

  await set(reqRef, {
    requestId: reqRef.key,
    uid: uid,
    amount: Number(amount),
    status: "pending",
    time: Date.now()
  });

  return { status: true };
}



// -----------------------------------------------------
// ADMIN → APPROVE WITHDRAWAL
// -----------------------------------------------------
export async function adminApproveWithdraw(requestId) {
  const reqSnap = await get(ref(db, "withdrawRequests/" + requestId));
  if (!reqSnap.exists()) return false;

  const req = reqSnap.val();

  const userSnap = await get(ref(db, "users/" + req.uid));
  if (!userSnap.exists()) return false;

  const user = userSnap.val();

  if (Number(user.wallet) < Number(req.amount)) return false;

  const newBalance = Number(user.wallet) - Number(req.amount);

  // Deduct balance from user
  await update(ref(db, "users/" + req.uid), {
    wallet: newBalance
  });

  // Update withdraw status
  await update(ref(db, "withdrawRequests/" + requestId), {
    status: "approved"
  });

  return true;
}



// -----------------------------------------------------
// ADMIN → REJECT WITHDRAWAL
// -----------------------------------------------------
export async function adminRejectWithdraw(requestId) {
  await update(ref(db, "withdrawRequests/" + requestId), {
    status: "rejected"
  });

  return true;
}



// -----------------------------------------------------
// GET USER WITHDRAWAL HISTORY
// -----------------------------------------------------
export async function getWithdrawHistory(uid) {
  const snap = await get(ref(db, "withdrawRequests/"));
  if (!snap.exists()) return [];

  const all = Object.values(snap.val());
  return all.filter(x => x.uid === uid);
    }
<script type="module">
import { saveBankDetails } from "./assets/js/withdraw.js";

document.getElementById("saveBankBtn").onclick = async () => {
  let bank = document.getElementById("bankName").value;
  let acc = document.getElementById("accNumber").value;
  let ifsc = document.getElementById("ifsc").value;
  let holder = document.getElementById("holderName").value;

  let uid = localStorage.getItem("uid");

  await saveBankDetails(uid, bank, acc, ifsc, holder);

  alert("Bank Details Saved!");
};
</script>
<script type="module">
import { createWithdraw } from "./assets/js/withdraw.js";

document.getElementById("withdrawBtn").onclick = async () => {
  let amount = document.getElementById("amount").value;
  let uid = localStorage.getItem("uid");

  const res = await createWithdraw(uid, amount);

  if (res.status) {
    alert("Withdrawal request submitted!");
  } else {
    alert(res.message);
  }
};
</script>
<script type="module">
import { adminApproveWithdraw } from "./assets/js/withdraw.js";

async function approve(id) {
  await adminApproveWithdraw(id);
  alert("Withdrawal Approved!");
}
</script>
<script type="module">
import { adminRejectWithdraw } from "./assets/js/withdraw.js";

async function reject(id) {
  await adminRejectWithdraw(id);
  alert("Withdrawal Rejected!");
}
</script>
<div id="historyList"></div>

<script type="module">
import { getWithdrawHistory } from "./assets/js/withdraw.js";

let uid = localStorage.getItem("uid");
let list = await getWithdrawHistory(uid);

let html = "";

list.forEach(h => {
  html += `
    <div class="his-card">
      <p>Amount: ₹${h.amount}</p>
      <p>Status: ${h.status}</p>
      <span>${new Date(h.time).toLocaleString()}</span>
    </div>
  `;
});

document.getElementById("historyList").innerHTML = html;
</script>
