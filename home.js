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
