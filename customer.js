(function () {
    const user = getUser();
    if (!user) { return; }

    const $ = function (id) { return document.getElementById(id); };
    const CART_KEY = "calidatechCart_" + user.username;
    const WISH_KEY = "calidatechWish_" + user.username;
    let cart = LS.get(CART_KEY, []);   // [{id, qty}]
    let wish = LS.get(WISH_KEY, []);   // [id]

    const prod = function (id) { return getProducts().find(function (p) { return p.id === id; }); };
    function persist() { LS.set(CART_KEY, cart); LS.set(WISH_KEY, wish); }

    function card(p, mode) {
        const saved = wish.includes(p.id);
        const buttons = mode === "wish"
            ? '<button class="cart-btn" data-act="move" data-id="' + p.id + '">Move to Cart</button>' +
              '<button class="ghost-btn" data-act="unwish" data-id="' + p.id + '">Remove</button>'
            : '<button class="cart-btn" data-act="add" data-id="' + p.id + '">Add to Cart</button>' +
              '<button class="ghost-btn" data-act="wish" data-id="' + p.id + '" aria-label="Save ' + esc(p.name) + ' to wishlist">' +
              '<i class="fa-' + (saved ? "solid" : "regular") + ' fa-heart"></i></button>';
        return '<article class="pcard"><div class="pimg"><i class="fa-solid ' + esc(p.icon || "fa-box") + '"></i></div>' +
               '<h3>' + esc(p.name) + '</h3><span class="badge">' + esc(p.category) + '</span>' +
               '<p class="price">' + peso(p.price) + '</p><div class="btn-row">' + buttons + '</div></article>';
    }

    function renderHome() {
        $("welcomeText").textContent = "Welcome back, " + user.username + "! Find the best gadgets at great prices.";
        $("featured").innerHTML = getProducts().slice(0, 3).map(function (p) { return card(p, "shop"); }).join("");
    }

    function categories() {
        const map = {};
        getProducts().forEach(function (p) {
            if (!map[p.category]) { map[p.category] = { name: p.category, icon: p.icon, count: 0 }; }
            map[p.category].count++;
        });
        return Object.keys(map).map(function (k) { return map[k]; });
    }

    function renderProducts() {
        const select = $("categoryFilter");
        const current = select.value || "All";
        select.innerHTML = '<option value="All">All categories</option>' + categories().map(function (c) {
            return '<option value="' + esc(c.name) + '">' + esc(c.name) + '</option>';
        }).join("");
        select.value = Array.from(select.options).some(function (o) { return o.value === current; }) ? current : "All";

        const list = getProducts().filter(function (p) { return select.value === "All" || p.category === select.value; });
        $("productGrid").innerHTML = list.length
            ? list.map(function (p) { return card(p, "shop"); }).join("")
            : '<div class="empty">No products in this category.</div>';
    }

    function renderCategories() {
        $("categoryGrid").innerHTML = categories().map(function (c) {
            return '<div class="category-card"><i class="fa-solid ' + esc(c.icon || "fa-box") + '"></i><h3>' + esc(c.name) + '</h3>' +
                   '<p>' + c.count + ' product' + (c.count === 1 ? "" : "s") + '</p>' +
                   '<button class="cart-btn" data-act="browse" data-cat="' + esc(c.name) + '">Browse</button></div>';
        }).join("");
    }

    function renderCart() {
        cart = cart.filter(function (i) { return prod(i.id); });
        let total = 0;
        if (!cart.length) {
            $("cartBody").innerHTML = '<div class="empty">Your cart is empty. Browse the Products page to add items.</div>';
        } else {
            const rows = cart.map(function (i) {
                const p = prod(i.id);
                const sub = p.price * i.qty;
                total += sub;
                return '<tr><td>' + esc(p.name) + '</td><td>' + peso(p.price) + '</td>' +
                       '<td><div class="qty"><button data-act="dec" data-id="' + p.id + '" aria-label="Decrease quantity">−</button>' +
                       '<span>' + i.qty + '</span><button data-act="inc" data-id="' + p.id + '" aria-label="Increase quantity">+</button></div></td>' +
                       '<td>' + peso(sub) + '</td>' +
                       '<td><button class="danger-btn small" data-act="remove" data-id="' + p.id + '">Remove</button></td></tr>';
            }).join("");
            $("cartBody").innerHTML = '<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>' +
                rows + '</tbody></table></div><div class="cart-total"><span>Total: ' + peso(total) +
                '</span><button class="checkout-btn" data-act="checkout">Checkout</button></div>';
        }
        $("cartCount").textContent = cart.reduce(function (n, i) { return n + i.qty; }, 0);
    }

    function renderWishlist() {
        wish = wish.filter(function (id) { return prod(id); });
        $("wishGrid").innerHTML = wish.length
            ? wish.map(function (id) { return card(prod(id), "wish"); }).join("")
            : '<div class="empty">Your wishlist is empty. Tap the heart on a product to save it.</div>';
    }

    function renderOrders() {
        const mine = getOrders().filter(function (o) { return o.customer === user.username; }).reverse();
        $("orderBody").innerHTML = mine.length
            ? '<div class="table-wrap"><table><thead><tr><th>Order No.</th><th>Date</th><th>Items</th><th>Status</th><th>Total</th></tr></thead><tbody>' +
              mine.map(function (o) {
                  return '<tr><td>' + esc(o.id) + '</td><td>' + esc(o.date) + '</td><td>' + esc(o.items) + '</td>' +
                         '<td><span class="status status-' + esc(o.status) + '">' + esc(o.status) + '</span></td><td>' + peso(o.total) + '</td></tr>';
              }).join("") + '</tbody></table></div>'
            : '<div class="empty">No orders yet. Checkout items from your cart to place one.</div>';
    }

    function renderProfile() {
        $("profileName").textContent = user.username;
        $("profileEmail").textContent = user.email;
        $("profileRole").textContent = "Customer";
    }

    function renderAll() {
        persist();
        renderHome(); renderProducts(); renderCategories();
        renderCart(); renderWishlist(); renderOrders(); renderProfile();
    }

    function addToCart(id) {
        const p = prod(id);
        if (!p) { return; }
        const line = cart.find(function (i) { return i.id === id; });
        const qty = line ? line.qty : 0;
        if (qty >= p.stock) { toast(p.stock <= 0 ? "Sorry, this item is out of stock." : "Only " + p.stock + " in stock."); return false; }
        if (line) { line.qty++; } else { cart.push({ id: id, qty: 1 }); }
        return true;
    }

    document.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) { return; }
        const id = Number(btn.dataset.id);
        const act = btn.dataset.act;

        if (act === "add") { if (addToCart(id)) { toast("Added to cart"); } }
        else if (act === "wish") {
            if (wish.includes(id)) { wish = wish.filter(function (w) { return w !== id; }); toast("Removed from wishlist"); }
            else { wish.push(id); toast("Saved to wishlist"); }
        }
        else if (act === "unwish") { wish = wish.filter(function (w) { return w !== id; }); }
        else if (act === "move") {
            if (addToCart(id)) { wish = wish.filter(function (w) { return w !== id; }); toast("Moved to cart"); }
        }
        else if (act === "inc") { addToCart(id); }
        else if (act === "dec") {
            const line = cart.find(function (i) { return i.id === id; });
            if (line) { line.qty--; if (line.qty <= 0) { cart = cart.filter(function (i) { return i.id !== id; }); } }
        }
        else if (act === "remove") { cart = cart.filter(function (i) { return i.id !== id; }); }
        else if (act === "browse") { $("categoryFilter").value = btn.dataset.cat; renderProducts(); showSection("products"); return; }
        else if (act === "checkout") {
            if (!cart.length) { toast("Your cart is empty."); return; }
            const orders = getOrders();
            const next = orders.reduce(function (m, o) { return Math.max(m, parseInt(String(o.id).replace(/\D/g, ""), 10) || 0); }, 1000) + 1;
            let total = 0;
            const items = cart.map(function (i) {
                const p = prod(i.id); total += p.price * i.qty; return p.name + " x" + i.qty;
            }).join(", ");
            orders.push({ id: "ORD-" + next, customer: user.username, items: items, total: total,
                          status: "Pending", date: new Date().toISOString().slice(0, 10) });
            saveOrders(orders);
            cart = [];
            renderAll();
            toast("Order placed!");
            showSection("orders");
            return;
        }
        renderAll();
    });

    $("categoryFilter").addEventListener("change", renderProducts);
    renderAll();
})();
