auth.onAuthStateChanged(user => {
  if (!user) return;

  const uid = user.uid;

  // ---------------------------
  // 📌 LOAD REFERRAL COUNT
  // ---------------------------
  db.ref("referrals/" + uid).on("value", snap => {
    document.getElementById("referral-count").innerText =
      snap.exists() ? snap.numChildren() : "0";
  });

  // ---------------------------
  // 📌 SET REFERRAL LINK
  // ---------------------------
  let link = `https://yourwebsite.com/signup?ref=${uid}`;
  document.getElementById("referral-link").innerText = link;

});
// ---------------------------
// 📌 COPY REFERRAL LINK
// ---------------------------
function copyReferralLink() {
  let link = document.getElementById("referral-link").innerText;
  navigator.clipboard.writeText(link);
  alert("Referral link copied!");
}
// ---------------------------
// 📌 BECOME A PROMOTER (Safe)
// ---------------------------
function becomePromoter() {
  auth.onAuthStateChanged(user => {
    if (!user) return;

    db.ref("users/" + user.uid).update({
      promoter: true
    });

    alert("You are now a promoter!");
  });
}
// ---------------------------
// 📌 LEADERBOARD (Admin-controlled)
// ---------------------------
db.ref("leaderboard").on("value", snap => {
  let html = "";

  snap.forEach(item => {
    let p = item.val();

    html += `
      <div class="leaderboard-item">
        <p class="lb-name">${p.name}</p>
        <p class="lb-score">${p.referrals} referrals</p>
      </div>
    `;
  });

  document.getElementById("leaderboard-list").innerHTML = html;
});
