// ---------------------------
// 📌 LOAD ALL PRODUCTS
// ---------------------------
db.ref("products").on("value", snap => {
  let html = "";

  snap.forEach(item => {
    let p = item.val();

    html += `
      <div class="product-card">
        <img src="${p.image}" class="product-img" alt="">
        
        <h3 class="product-name">${p.name}</h3>

        <p class="product-price">Price: ₹${p.price}</p>
        <p class="product-profit">Daily Profit: ₹${p.dailyProfit}</p>
        <p class="product-profit">Total Profit: ₹${p.totalProfit}</p>

        <button class="buy-btn" onclick="buyProductDemo('${item.key}')">
          Buy Now
        </button>
      </div>
    `;
  });

  document.getElementById("product-list").innerHTML = html;
});
