// Load pages
function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then(res => res.text())
    .then(data => {
      document.getElementById("app").innerHTML = data;
    });
}

// Load bottom nav
fetch("components/bottom-nav.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("bottom-nav").innerHTML = data;
  });

// Default page
loadPage("home");
