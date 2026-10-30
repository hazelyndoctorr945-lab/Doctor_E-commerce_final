// ===============================
// PAGE GUARD (logged in + correct role)
// ===============================
(function () {
    const page = window.location.pathname.split("/").pop();
    const user = LS.get("calidatechUser", null);

    if (localStorage.getItem("calidatechLoggedIn") !== "true" || !user) {
        window.location.replace("login.html");
    } else if (user.role === "Seller" && page === "side-menu.html") {
        window.location.replace("seller-dashboard.html");
    } else if (user.role !== "Seller" && page === "seller-dashboard.html") {
        window.location.replace("side-menu.html");
    }
})();

// ===============================
// SIDEBAR TOGGLE
// ===============================
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector(".main-content");

    if (window.innerWidth <= 768) {
        sidebar.classList.toggle("open");
    } else {
        sidebar.classList.toggle("closed");
        main.classList.toggle("full");
    }
}

// ===============================
// LOGGED-IN USER NAME
// ===============================
(function () {
    const user = LS.get("calidatechUser", null);
    const el = document.getElementById("userName");
    if (user && el) { el.textContent = user.username; }
})();

// ===============================
// SECTION NAVIGATION
// ===============================
const menuItems = document.querySelectorAll(".menu-link");
const sections = document.querySelectorAll(".content-section");

function showSection(name) {
    const target = document.getElementById(name);
    if (!target) { return; }

    menuItems.forEach(function (link) {
        link.classList.toggle("active", link.getAttribute("data-section") === name);
    });
    sections.forEach(function (s) {
        s.classList.toggle("active-section", s === target);
    });

    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("open");
    }
    window.scrollTo(0, 0);
}

menuItems.forEach(function (item) {
    item.addEventListener("click", function (e) {
        e.preventDefault();
        if (this.id === "logout") { logoutUser(); return; }
        const name = this.getAttribute("data-section");
        if (name) { showSection(name); }
    });
});

// ===============================
// LOGOUT
// ===============================
function logoutUser() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("calidatechLoggedIn");
        localStorage.removeItem("calidatechUser");
        window.location.href = "login.html";
    }
}
