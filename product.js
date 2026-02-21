import { db } from "./firebase.js";
import {
  ref,
  set,
  get,
  update,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



// --------------------------------------------------
// ADMIN → ADD PRODUCT
// --------------------------------------------------
export async function addProduct(name, price, dailyProfit, totalDays, imageURL) {
  const productRef = push(ref(db, "products/"));

  await set(productRef, {
    productId: productRef.key,
    name: name,
    price: Number(price),
    dailyProfit: Number(dailyProfit),
    totalDays: Number(totalDays),
    totalProfit: Number(dailyProfit) * Number(totalDays),
    image: imageURL,
    time: Date.now()
  });

  return true;
}



// --------------------------------------------------
// ADMIN → EDIT PRODUCT
// --------------------------------------------------
export async function editProduct(productId, data) {
  await update(ref(db, "products/" + productId), data);
  return true;
}



// --------------------------------------------------
// USER → GET ALL PRODUCTS
// --------------------------------------------------
export async function getProducts() {
  const snap = await get(ref(db, "products/"));
  return snap.exists() ? Object.values(snap.val()) : [];
}



// --------------------------------------------------
// USER → GET NEW ARRIVALS (Last 5 Products)
// --------------------------------------------------
export async function getNewArrivals() {
  const snap = await get(ref(db, "products/"));
  if (!snap.exists()) return [];

  const all = Object.values(snap.val());
  
  // Sort by time created
  all.sort((a, b) => b.time - a.time);

  return all.slice(0, 5);
}
<script type="module">
import { addProduct } from "./assets/js/product.js";

document.getElementById("addBtn").onclick = async () => {
  let name = document.getElementById("pname").value;
  let price = document.getElementById("pprice").value;
  let dp = document.getElementById("dailyProfit").value;
  let days = document.getElementById("days").value;
  let imgURL = "IMAGE_URL";

  await addProduct(name, price, dp, days, imgURL);

  alert("Product Added!");
};
</script>
<div id="productList"></div>

<script type="module">
import { getProducts } from "./assets/js/product.js";

async function loadProducts() {
  const products = await getProducts();
  let html = "";

  products.forEach(p => {
    html += `
      <div class="card">
        <img src="${p.image}" class="pimg" />
        <h3>${p.name}</h3>
        <p>Price: ₹${p.price}</p>
        <p>Daily Profit: ₹${p.dailyProfit}</p>
        <p>Total Profit: ₹${p.totalProfit}</p>
        <button onclick="buy('${p.productId}', ${p.price})">Buy Now</button>
      </div>
    `;
  });

  document.getElementById("productList").innerHTML = html;
}

loadProducts();
</script>
<div id="newArrivals"></div>

<script type="module">
import { getNewArrivals } from "./assets/js/product.js";

async function loadNew() {
  const items = await getNewArrivals();
  let html = "";

  items.forEach(p => {
    html += `
      <div class="new-card">
        <img src="${p.image}" />
        <p>${p.name}</p>
        <span>₹${p.price}</span>
      </div>
    `;
  });

  document.getElementById("newArrivals").innerHTML = html;
}

loadNew();
</script>
<script type="module">
import { buyProduct } from "./assets/js/wallet.js";

window.buy = async (pid, price) => {
  let uid = localStorage.getItem("uid");

  const res = await buyProduct(uid, pid, price);

  if (res.status) {
    alert("Purchase Successful!");
  } else {
    alert(res.message);
  }
};
</script>
