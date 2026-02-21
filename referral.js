import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



// ----------------------------------------------------
// GENERATE USER REFERRAL LINK
// ----------------------------------------------------
export function generateReferralLink(uid) {
  return `${window.location.origin}/signup.html?ref=${uid}`;
}



// ----------------------------------------------------
// SAVE REFERRAL DURING SIGNUP
// CALL THIS RIGHT AFTER USER CREATES ACCOUNT
// ----------------------------------------------------
export async function saveReferral(uid, refId) {
  if (!refId) return;

  await update(ref(db, "users/" + uid), {
    referredBy: refId
  });

  // Save referral tracking
  await push(ref(db, "referrals/" + refId), {
    uid: uid,
    time: Date.now(),
    activated: false
  });
}



// ----------------------------------------------------
// COUNT REFERRED USERS
// ----------------------------------------------------
export async function getReferralCount(uid) {
  const snap = await get(ref(db, "referrals/" + uid));
  return snap.exists() ? Object.keys(snap.val()).length : 0;
}



// ----------------------------------------------------
// ACTIVATE REFERRAL WHEN USER MAKES FIRST PURCHASE
// ALSO GIVE 20% COMMISSION TO REFERRER
// ----------------------------------------------------
export async function activateReferral(userId, investAmount) {
  // Get user data
  const userSnap = await get(ref(db, "users/" + userId));
  if (!userSnap.exists()) return;

  const user = userSnap.val();
  const refId = user.referredBy;

  if (!refId) return;

  // Get referral list
  const refSnap = await get(ref(db, "referrals/" + refId));
  if (!refSnap.exists()) return;

  // find this referral entry
  const all = refSnap.val();
  let refEntryKey = null;

  for (let key in all) {
    if (all[key].uid === userId) {
      refEntryKey = key;
      break;
    }
  }

  if (!refEntryKey) return;

  // Only activate once
  if (all[refEntryKey].activated === true) return;

  // Give commission
  const commission = investAmount * 0.20;

  const refUserSnap = await get(ref(db, "users/" + refId));
  if (!refUserSnap.exists()) return;

  const refUser = refUserSnap.val();

  await update(ref(db, "users/" + refId), {
    wallet: Number(refUser.wallet) + commission,
    totalEarnings: Number(refUser.totalEarnings) + commission
  });

  // mark activated
  await update(ref(db, "referrals/" + refId + "/" + refEntryKey), {
    activated: true
  });
}



// ----------------------------------------------------
// GET TOP PROMOTERS (LEADERBOARD)
// ----------------------------------------------------
export async function getTopPromoters() {
  const snap = await get(ref(db, "referrals/"));
  if (!snap.exists()) return [];

  const data = snap.val();
  const result = [];

  for (let uid in data) {
    const count = Object.values(data[uid]).filter(x => x.activated === true).length;

    result.push({
      uid: uid,
      activeReferrals: count
    });
  }

  // Sort by highest activated referrals
  result.sort((a, b) => b.activeReferrals - a.activeReferrals);

  return result.slice(0, 10); // top 10 promoters
}
<script type="module">
import { saveReferral } from "./assets/js/referral.js";
import { userSignup } from "./assets/js/auth.js";

let url = new URL(window.location.href);
let refId = url.searchParams.get("ref");

document.getElementById("signupBtn").onclick = async () => {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  const res = await userSignup(name, email, pass);

  if (res.status) {
    await saveReferral(res.uid, refId);
    window.location.href = "home.html";
  } else {
    alert(res.message);
  }
};
</script>
<div id="refLinkBox"></div>

<script type="module">
import { generateReferralLink } from "./assets/js/referral.js";

let uid = localStorage.getItem("uid");
document.getElementById("refLinkBox").innerText = generateReferralLink(uid);
</script>
<script type="module">
import { getReferralCount } from "./assets/js/referral.js";

let uid = localStorage.getItem("uid");
let count = await getReferralCount(uid);

document.getElementById("refCount").innerText = count;
</script>
import { activateReferral } from "./referral.js";

await activateReferral(uid, price);
<div id="topList"></div>

<script type="module">
import { getTopPromoters } from "./assets/js/referral.js";

async function loadTop() {
  let list = await getTopPromoters();
  let html = "";

  list.forEach((u, i) => {
    html += `
      <div class="top-card">
        <span>#${i+1}</span>
        <p>User: ${u.uid}</p>
        <p>Active Referrals: ${u.activeReferrals}</p>
      </div>
    `;
  });

  document.getElementById("topList").innerHTML = html;
}

loadTop();
</script>
