(function () {
    const user = getUser();
    if (!user) { return; }

    const $ = function (id) { return document.getElementById(id); };
    let editingId = null;

    function renderDashboard() {
        const products = getProducts();
        const orders = getOrders();
        const sales = orders.reduce(function (n, o) { return n + Number(o.total); }, 0);
        const pending = orders.filter(function (o) { return o.status === "Pending"; }).length;

        $("sellerWelcome").textContent = "Welcome, " + user.username + "! Here is how your store is doing.";
        $("statProducts").textContent = products.length;
        $("statOrders").textContent = orders.length;
        $("statSales").textContent = peso(sales);
        $("statPending").textContent = pending;
    }

    function renderManage() {
        const products = getProducts();
        $("manageBody").innerHTML = products.length
            ? products.map(function (p) {
                return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.category) + '</td><td>' + peso(p.price) + '</td><td>' + p.stock + '</td>' +
                       '<td><div class="btn-row"><button class="cart-btn small" data-act="edit" data-id="' + p.id + '">Edit</button>' +
                       '<button class="danger-btn small" data-act="delete" data-id="' + p.id + '">Delete</button></div></td></tr>';
              }).join("")
            : '<tr><td colspan="5">No products yet. Click "Add Product" to create one.</td></tr>';

        const cats = {};
        products.forEach(function (p) { cats[p.category] = true; });
        $("categoryList").innerHTML = Object.keys(cats).map(function (c) { return '<option value="' + esc(c) + '">'; }).join("");
    }

    function renderOrders() {
        $("sellerOrderBody").innerHTML = getOrders().slice().reverse().map(function (o) {
            return '<tr><td>' + esc(o.id) + '</td><td>' + esc(o.customer) + '</td><td>' + esc(o.items) + '</td>' +
                   '<td><span class="status status-' + esc(o.status) + '">' + esc(o.status) + '</span></td><td>' + peso(o.total) + '</td></tr>';
        }).join("");
    }

    function renderProfile() {
        $("sellerName").textContent = user.username;
        $("sellerEmail").textContent = user.email;
    }

    function renderAll() { renderDashboard(); renderManage(); renderOrders(); renderProfile(); }

    function startForm(id) {
        editingId = id;
        const p = id ? getProducts().find(function (x) { return x.id === id; }) : null;
        $("formTitle").textContent = p ? "Edit Product" : "Add Product";
        $("saveBtn").textContent = p ? "Save Changes" : "Add Product";
        $("pName").value = p ? p.name : "";
        $("pPrice").value = p ? p.price : "";
        $("pCategory").value = p ? p.category : "";
        $("pStock").value = p ? p.stock : "";
        $("formError").textContent = "";
    }

    $("productForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const name = $("pName").value.trim();
        const category = $("pCategory").value.trim();
        const price = Number($("pPrice").value);
        const stock = Number($("pStock").value);

        if (!name || !category) { $("formError").textContent = "Please enter a product name and category."; return; }
        if (!(price > 0)) { $("formError").textContent = "Price must be greater than 0."; return; }
        if (!Number.isInteger(stock) || stock < 0) { $("formError").textContent = "Stock must be a whole number (0 or more)."; return; }

        const products = getProducts();
        if (editingId) {
            const p = products.find(function (x) { return x.id === editingId; });
            if (p) { p.name = name; p.price = price; p.category = category; p.stock = stock; }
        } else {
            const nextId = products.reduce(function (m, p) { return Math.max(m, p.id); }, 0) + 1;
            products.push({ id: nextId, name: name, price: price, category: category, stock: stock, icon: "fa-box" });
        }
        saveProducts(products);
        toast(editingId ? "Product updated" : "Product added");
        startForm(null);
        renderAll();
        showSection("manage");
    });

    document.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-act]");
        if (!btn) { return; }
        const id = Number(btn.dataset.id);

        if (btn.dataset.act === "new") { startForm(null); showSection("add"); }
        else if (btn.dataset.act === "edit") { startForm(id); showSection("add"); }
        else if (btn.dataset.act === "delete") {
            if (confirm("Delete this product?")) {
                saveProducts(getProducts().filter(function (p) { return p.id !== id; }));
                toast("Product deleted");
                renderAll();
            }
        }
    });

    document.querySelector('.menu-link[data-section="add"]').addEventListener("click", function () { startForm(null); });

    startForm(null);
    renderAll();
})();
