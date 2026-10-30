// ==========================================
// CALIDATECH LOGIN, REGISTRATION AND ROLES
// School project demo using localStorage
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("container");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginError = document.getElementById("loginError");
    const registerError = document.getElementById("registerError");

    const popup = document.getElementById("successPopup");
    const popupMessage = document.getElementById("popupMessage");
    const popupTitle = document.getElementById("popupTitle");
    const closePopup = document.getElementById("closePopup");

    const STORAGE_ACCOUNTS = "calidatechAccounts";
    const STORAGE_USER = "calidatechUser";
    const STORAGE_LOGGED_IN = "calidatechLoggedIn";

    // ------------------------------------------
    // ACCOUNT STORAGE
    // ------------------------------------------

    function getAccounts() {
        try {
            const saved = localStorage.getItem(STORAGE_ACCOUNTS);
            const accounts = saved ? JSON.parse(saved) : [];
            return Array.isArray(accounts) ? accounts : [];
        } catch (error) {
            console.error("Unable to read saved accounts:", error);
            return [];
        }
    }

    function saveAccounts(accounts) {
        try {
            localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
            return true;
        } catch (error) {
            console.error("Unable to save accounts:", error);
            return false;
        }
    }

    

    function createDemoAccounts() {
        const accounts = getAccounts();

        const demoAccounts = [
            { username: "admin",  email: "admin@calidatech.com",  password: "Admin123",  role: "Admin" },
            { username: "user",   email: "user@example.com",      password: "user123",   role: "User" },
            { username: "seller", email: "seller@example.com",    password: "seller123", role: "Seller" }
        ];

        let changed = false;

        demoAccounts.forEach(function (demoAccount) {
            const index = accounts.findIndex(function (account) {
                return String(account.username || "").toLowerCase() ===
                    demoAccount.username.toLowerCase();
            });

            if (index === -1) {
                accounts.push(demoAccount);
                changed = true;
            } else if (JSON.stringify(accounts[index]) !== JSON.stringify(demoAccount)) {
                accounts[index] = demoAccount;
                changed = true;
            }
        });

        if (changed && !saveAccounts(accounts)) {
            console.error("Demo accounts could not be saved.");
        }
    }

    createDemoAccounts();

    // ------------------------------------------
    // ERROR MESSAGE HELPERS
    // ------------------------------------------

    function showError(element, message) {
        element.textContent = message;
        element.classList.add("show");
    }

    function clearError(element) {
        element.textContent = "";
        element.classList.remove("show");
    }

   
// ------------------------------------------
// SUCCESS POPUP
// ------------------------------------------

let redirectAfterPopup = null;

function showPopup(title, message) {
    redirectAfterPopup = null;
    popupTitle.textContent = title;
    popupMessage.textContent = message;

    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");

    closePopup.focus();
}

function hidePopup() {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");

    if (redirectAfterPopup) {
        const destination = redirectAfterPopup;
        redirectAfterPopup = null;
        window.location.href = destination;
    }
}

// Close popup only
closePopup.addEventListener("click", function () {
    hidePopup();
});

popup.addEventListener("click", function (event) {
    if (event.target === popup) {
        hidePopup();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && popup.classList.contains("show")) {
        hidePopup();
    }
});

    // ------------------------------------------
    // SWITCH LOGIN AND REGISTER
    // ------------------------------------------

    function showLogin() {
        container.classList.remove("active");
        clearError(loginError);
        clearError(registerError);
    }

    function showRegister() {
        container.classList.add("active");
        clearError(loginError);
        clearError(registerError);
    }

    document.getElementById("register").addEventListener("click", showRegister);
    document.getElementById("registerLink").addEventListener("click", function (event) {
        event.preventDefault();
        showRegister();
    });

    document.getElementById("login").addEventListener("click", showLogin);
    document.getElementById("loginLink").addEventListener("click", function (event) {
        event.preventDefault();
        showLogin();
    });

    // ------------------------------------------
    // SHOW / HIDE PASSWORD
    // ------------------------------------------

    document.querySelectorAll(".toggle-password").forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = button.querySelector("i");

            if (!input || !icon) {
                return;
            }

            const shouldShow = input.type === "password";
            input.type = shouldShow ? "text" : "password";

            icon.classList.toggle("fa-eye", !shouldShow);
            icon.classList.toggle("fa-eye-slash", shouldShow);

            button.setAttribute(
                "aria-label",
                shouldShow ? "Hide password" : "Show password"
            );
        });
    });

    // ------------------------------------------
    // SELLER ROLE CODE
    // ------------------------------------------

    const SELLER_CODE = "CALIDA-SELLER-2026";

    document.getElementById("regRole").addEventListener("change", function () {
        document.getElementById("sellerCodeBox").style.display =
            this.value === "Seller" ? "flex" : "none";
    });

    // ------------------------------------------
    // REGISTER NEW USER
    // New registrations are always User accounts.
    // ------------------------------------------

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearError(registerError);

        const username = document.getElementById("regUsername")
            .value.trim();

        const email = document.getElementById("regEmail")
            .value.trim().toLowerCase();

        const password = document.getElementById("regPassword").value;
        const confirmPassword =
            document.getElementById("regConfirmPassword").value;

        if (!username || !email || !password || !confirmPassword) {
            showError(registerError, "Please complete all fields.");
            return;
        }

        if (username.length < 3) {
            showError(registerError, "Username must be at least 3 characters.");
            return;
        }

        if (password.length < 6) {
            showError(registerError, "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showError(registerError, "Passwords do not match.");
            return;
        }

        const accounts = getAccounts();

        const duplicate = accounts.some(function (account) {
            const savedUsername = String(account.username || "").toLowerCase();
            const savedEmail = String(account.email || "").toLowerCase();

            return savedUsername === username.toLowerCase() ||
                   savedEmail === email;
        });

        if (duplicate) {
            showError(
                registerError,
                "That username or email is already registered."
            );
            return;
        }

        const role = document.getElementById("regRole").value === "Seller"
            ? "Seller"
            : "User";

        if (role === "Seller" &&
            document.getElementById("regSellerCode").value.trim() !== SELLER_CODE) {
            showError(registerError, "Invalid seller access code.");
            return;
        }

        const newAccount = {
            username: username,
            email: email,
            password: password,
            role: role
        };

        accounts.push(newAccount);

        if (!saveAccounts(accounts)) {
            showError(
                registerError,
                "The account could not be saved. Check your browser storage."
            );
            return;
        }

        registerForm.reset();
        document.getElementById("sellerCodeBox").style.display = "none";
        showLogin();

        document.getElementById("loginUsername").value = username;

        showPopup(
            "Registration Successful!",
            "Your account has been created. You can now log in."
        );
    });

    // ------------------------------------------
// LOGIN AND ROLE-BASED REDIRECTION
// ------------------------------------------

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError(loginError);

    const usernameOrEmail = document.getElementById("loginUsername")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    if (!usernameOrEmail || !password) {
        showError(loginError, "Please enter your username/email and password.");
        return;
    }

    const accounts = getAccounts();

    const account = accounts.find(function (savedAccount) {
        const savedUsername =
            String(savedAccount.username || "").toLowerCase();
        const savedEmail =
            String(savedAccount.email || "").toLowerCase();

        return (
            savedUsername === usernameOrEmail ||
            savedEmail === usernameOrEmail
        ) && savedAccount.password === password;
    });

    if (!account) {
        showError(loginError, "Invalid username/email or password.");
        return;
    }

    const allowedRoles = ["Admin", "User", "Seller"];

    if (!allowedRoles.includes(account.role)) {
        showError(loginError, "This account has an invalid user role.");
        return;
    }

    try {
        localStorage.setItem(STORAGE_LOGGED_IN, "true");

        localStorage.setItem(
            STORAGE_USER,
            JSON.stringify({
                username: account.username,
                email: account.email,
                role: account.role
            })
        );
    } catch (error) {
        console.error("Unable to save login session:", error);
        showError(
            loginError,
            "Unable to save your login session. Check browser storage."
        );
        return;
    }

    // Determine destination based on account role.
    const destination = account.role === "Seller"
        ? "seller-dashboard.html"
        : "side-menu.html";

    // Show the success popup first.
    showPopup(
        "Login Successful!",
        "Welcome back, " + account.username + "!"
    );

    // Redirect when the popup is closed (OK, Escape, or backdrop click).
    redirectAfterPopup = destination;
});
    // ------------------------------------------
    // FORGOT PASSWORD DEMO
    // ------------------------------------------

    document.getElementById("forgotPassword")
        .addEventListener("click", function (event) {
            event.preventDefault();

            showPopup(
                "Password Recovery",
                "Password recovery is not connected yet. Please contact the website administrator."
            );
        });

    // ------------------------------------------
    // GOOGLE SIGN-IN DEMO
    // ------------------------------------------

    document.getElementById("googleSignIn")
        .addEventListener("click", function () {
            showPopup(
                "Google Sign-In",
                "Google sign-in is not connected yet. Please use your CalidaTech account."
            );
        });
});