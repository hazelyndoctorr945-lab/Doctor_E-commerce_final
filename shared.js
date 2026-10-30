// Shared data + helpers (localStorage as the "database")
const LS = {
    get(key, fallback) {
        try {
            const v = JSON.parse(localStorage.getItem(key));
            return v === null || v === undefined ? fallback : v;
        } catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
    }
};

const SEED_PRODUCTS = [
    { id: 1, name: "Smartphone",          price: 15000, category: "Phones",      stock: 20, icon: "fa-mobile-screen" },
    { id: 2, name: "Laptop",              price: 45000, category: "Laptops",     stock: 10, icon: "fa-laptop" },
    { id: 3, name: "Mechanical Keyboard", price: 2500,  category: "Accessories", stock: 35, icon: "fa-keyboard" },
    { id: 4, name: "Gaming Headset",      price: 3200,  category: "Accessories", stock: 25, icon: "fa-headphones" },
    { id: 5, name: "Game Controller",     price: 2800,  category: "Gaming",      stock: 18, icon: "fa-gamepad" },
    { id: 6, name: "Tablet",              price: 18000, category: "Phones",      stock: 12, icon: "fa-tablet-screen-button" },
    { id: 7, name: "Smartwatch",          price: 6500,  category: "Accessories", stock: 15, icon: "fa-clock" }
];

const SEED_ORDERS = [
    { id: "ORD-1001", customer: "user",  items: "Gaming Headset x1",                          total: 3200,  status: "Delivered", date: "2026-10-12" },
    { id: "ORD-1002", customer: "user",  items: "Mechanical Keyboard x1, Game Controller x1", total: 5300,  status: "Shipped",   date: "2026-10-24" },
    { id: "ORD-1003", customer: "user",  items: "Smartphone x1",                              total: 15000, status: "Pending",   date: "2026-10-29" },
    { id: "ORD-1004", customer: "maria", items: "Laptop x1",                                  total: 45000, status: "Pending",   date: "2026-10-28" },
    { id: "ORD-1005", customer: "john",  items: "Tablet x1, Smartwatch x1",                   total: 24500, status: "Shipped",   date: "2026-10-27" }
];

function getProducts() {
    let list = LS.get("calidatechProducts", null);
    if (!Array.isArray(list)) { list = SEED_PRODUCTS; LS.set("calidatechProducts", list); }
    return list;
}
function saveProducts(list) { LS.set("calidatechProducts", list); }

function getOrders() {
    let list = LS.get("calidatechOrders", null);
    if (!Array.isArray(list)) { list = SEED_ORDERS; LS.set("calidatechOrders", list); }
    return list;
}
function saveOrders(list) { LS.set("calidatechOrders", list); }

function getUser() { return LS.get("calidatechUser", null); }

function peso(n) { return "₱" + Number(n).toLocaleString("en-PH"); }

function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

function toast(message) {
    let el = document.getElementById("toast");
    if (!el) {
        el = document.createElement("div");
        el.id = "toast";
        el.setAttribute("role", "status");
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove("show"); }, 2200);
}
