/* ------------------------------------------------------------------------------------------ */
/* SETUP AND VARIABLES */

// Defining the URL paths of the website
const ROUTES = {
  login: "/login",
  "create-account": "/create-account",
  "forgot-password": "/forgot-password",
  verification: "/verification",
  "new-password": "/new-password",
  home: "/home",
};

// Referencing form sections from the HTML
const sections = {
  "create-account": document.querySelector("#create-account"),
  login: document.querySelector("#login"),
  "forgot-password": document.querySelector("#forgot-password"),
  verification: document.querySelector("#verification"),
  "new-password": document.querySelector("#new-password"),
};

// Storing information in local storage for the login and password reset verification process
const STORAGE_KEYS = {
  currentUser: "currentUser",     // Logged in user information
  resetEmail: "resetEmail",       // Email used for password reset
  resetVerified: "resetVerified", // Whether verification succeeded
  favorites: "favorites",         // Favorite product ids
  cart: "cart",                   // Cart items
  checkoutAddress: "checkoutAddress", // Checkout shipping address
};

// Storing main HTML page containers
const formContainer = document.querySelector(".form-container");  // Holds all forms (login, create, forgot-password, verification, reset-password)
const homeContainer = document.querySelector("#home");            // Main homepage 

// Storing profile dropdown menu elements
const profileBtn = document.getElementById("profile-btn");
const profileMenu = document.getElementById("profile-menu");
const userProfile = document.querySelector(".user-profile");
const signoutBtn = document.getElementById("signout-btn");

// Storing form references 
const createForm = document.getElementById("create-form");
const loginForm = document.getElementById("login-form");
const forgotPasswordForm = document.getElementById("forgot-password-form");
const verificationForm = document.getElementById("verification-form");
const newPasswordForm = document.getElementById("new-password-form");



/* ------------------------------------------------------------------------------------------ */
/* BASIC HELPERS */

// Shorter way to find HTML elements
function $(selector, scope = document) {
  return scope.querySelector(selector);
}

// Storing submitted form values
function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

// Changing the page URL without refereshing the page
function navigate(path) {
  history.pushState({}, "", path);
}

// Showing elements by removing hidden class
function showElement(element) {
  element?.classList.remove("hidden");
}

// Hiding elements by adding the hidden class
function hideElement(element) {
  element?.classList.add("hidden");
}



/* ------------------------------------------------------------------------------------------ */
/* USER & VERIFICATION LOCAL STORAGE HELPERS */

// Storing logged in user information into localStorage
function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

// Retrieving stored logged in user from localStorage
function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
  return stored ? JSON.parse(stored) : null;
}

// Removing stored logged in user from localStorage
function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

// Storing reset email into localStorage
function saveResetEmail(email) {
  localStorage.setItem(STORAGE_KEYS.resetEmail, email);
}

// Retrieving stored reset email from localStorage
function getResetEmail() {
  return localStorage.getItem(STORAGE_KEYS.resetEmail);
}

// Storing whether the verification code was successful into localStorage
function saveResetVerified(value) {
  localStorage.setItem(STORAGE_KEYS.resetVerified, value);
}

// Retrieving current verification status from localstorage
function getResetVerified() {
  return localStorage.getItem(STORAGE_KEYS.resetVerified);
}

// Removing stored reset email and verification status from localStorage
function clearResetState() {
  localStorage.removeItem(STORAGE_KEYS.resetEmail);
  localStorage.removeItem(STORAGE_KEYS.resetVerified);
}



/* ------------------------------------------------------------------------------------------ */
/* ALERT HELPERS */

// Displaying the error alert message on the screen
function showError(boxId, message) {

  // Finding the HTML alert box
  const box = document.getElementById(boxId);

  // If box doesn't exist, then don't do anything
  if (!box) return;

  // If box exists, then make alert visible and insert the error message text
  box.classList.remove("hidden");
  const text = box.querySelector(".msg-error-text");
  if (text) text.textContent = message;
  
}

// Hiding the error alert message from the screen
function hideError(boxId) {

  // Finding the HTML alert box
  const box = document.getElementById(boxId);

  // If box doesn't exist, then don't do anything
  if (!box) return;

  // If box exists, then hide alert and clear the error message text
  box.classList.add("hidden");
  const text = box.querySelector(".msg-error-text");
  if (text) text.textContent = "";

}

// Displaying the success alert message on the screen
function showSuccess(boxId, message) {

  // Finding the HTML alert box
  const box = document.getElementById(boxId);

  // If box doesn't exist, then don't do anything
  if (!box) return;

  // If box exists, then make alert visible and insert the success message text
  box.classList.remove("hidden");
  const text = box.querySelector(".msg-success-text");
  if (text) text.textContent = message;

}

// Hiding the success alert message from the screen
function hideSuccess(boxId) {

  // Finding the HTML alert box
  const box = document.getElementById(boxId);

  // If box doesn't exist, then don't do anything
  if (!box) return;

  // If box exists, then hide alert and clearthe success message text
  box.classList.add("hidden");
  const text = box.querySelector(".msg-success-text");
  if (text) text.textContent = "";

}

// Auto-hiding success alert messages from screen after user starts typing into the form inputs
function setupInputListeners() {

  // Hide alert once user start typing the verification code 
  $('#verification-form input[name="code"]')?.addEventListener("input", () => {
    hideSuccess("verification-success");
  });

  // Hide alert once user starts typing the email
  $('#login-form input[name="email"]')?.addEventListener("input", () => {
    hideSuccess("login-success");
  });

  // Hide alert once user starts typing the password
  $('#login-form input[name="password"]')?.addEventListener("input", () => {
    hideSuccess("login-success");
  });
}



/* ------------------------------------------------------------------------------------------ */
/* API HELPER */

// Sending POST requests to the server
async function postJSON(url, body) {

  // Uses fetch to send the POST request 
  // Converting body into JSON text before sending to server
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Getting server response and returning result
  const data = await res.json().catch(() => ({}));
  return { res, data };
}



/* ------------------------------------------------------------------------------------------ */
/* SECTION & ROUTE HANDLING */

// Hiding all form sections (login, create-account, forgot-password, verification, new-password)
function hideAllSections() {

  // Removing active class in all form sections
  Object.values(sections).forEach((section) => {
    section?.classList.remove("active");
  });

}

// Displaying one specified form section
function showSection(sectionName) {
  
  // Displaying form container
  showElement(formContainer);

  // Hiding homepage
  hideElement(homeContainer);

  // Hiding all form sections
  hideAllSections();

  // Displaying specified form section by adding active class
  sections[sectionName]?.classList.add("active");

}

// Inserting user information into the homepage after login or create account
function populateHome(user) {
  
  // If user does not exists, then don't do anything
  if (!user) return;

  // Pulling user information
  const firstname = user.firstname || "";
  const lastname = user.lastname || "";
  const email = user.email || "";

  // Creating full name and name initials from user informatiom
  const fullName = `${firstname} ${lastname}`.trim();
  const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();

  // Getting HTML Elements that will be updated
  const topbarTitle = document.getElementById("topbar-title");
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.querySelector(".profile-email");
  const profileImg = document.querySelector(".profile-img");

  // Updating UI with user's information
  if (topbarTitle) topbarTitle.textContent = `Welcome back, ${firstname}`;
  if (profileName) profileName.textContent = fullName;
  if (profileEmail) profileEmail.textContent = email;
  if (profileImg) profileImg.textContent = initials;

}

// Displaying homepage after login or account creation
function showHome(message = "") {

  // Hiding all forms
  hideElement(formContainer);

  // Displaying homepage
  showElement(homeContainer);

  // Inserting users's information from localStorage
  populateHome(getCurrentUser());

  // If success alert message is empty, then show success alert
  if (!message) return;

  // If message exists, then display success alert message
  showSuccess("home-success", message);

  // Auto-hide success alert message after 3 seconds
  setTimeout(() => {
    hideSuccess("home-success");
  }, 3000);

}

// Displaying correct form section or page based on current URL path 
// Handles navigation when page refreshes, user presses back and forward, and user opens a URL directly
function loadRoute() {

  // Getting current URL path
  const path = window.location.pathname;

  // Displaying form section or page according to URL path
  switch (path) {
    case ROUTES["create-account"]:
      showSection("create-account");
      break;
    case ROUTES["forgot-password"]:
      showSection("forgot-password");
      break;
    case ROUTES.verification:
      showSection("verification");
      break;
    case ROUTES["new-password"]:
      showSection("new-password");
      break;
    case ROUTES.home:
      showHome();
      break;
    case ROUTES.login:
    default:
      showSection("login");
      break;
  }

}

// Displaying correct form section form section or page after user clicks buttons
// Handles navigation when the user clicks button inside the app
function setupRouteSwitching() {

  // Listening for any clicks happening on the page
  document.addEventListener("click", (e) => {

    // Finding the HTML button with the "data-switch" attribute
    const btn = e.target.closest("[data-switch]");

    // If what was clicked was not a navigation button, then don't do anything
    if (!btn) return;

    // Storing the target section from the "data-switch" value
    const target = btn.dataset.switch;

    // Getting specified route according to the target section
    const route = ROUTES[target];

    // If route does not exists, them don't do anything
    if (!route) return;

    // Changing URL without reloading the page
    navigate(route);

    // Displaying form section or page according target section
    showSection(target);

  });

  // Displaying correct form section or page when user presses back and forward buttons using
  window.addEventListener("popstate", loadRoute);

}



/* ------------------------------------------------------------------------------------------ */
/* PROFILE MENU */

// Controlling profile menu interaction according to user's actions
function setupProfileMenu() {

  // Listening for any clicks on the profile button
  profileBtn?.addEventListener("click", (e) => {

    // Preventing menu from closing immediately after click
    e.stopPropagation();

    // Displaying profile menu by adding the "open" class
    profileMenu?.classList.toggle("open");

  });

  // Listening for any clicks anywhere on the page
  document.addEventListener("click", (e) => {

    // If click was inside the profile area, then do nothing
    if (!userProfile || userProfile.contains(e.target)) return;

    // If click was outside the profile area, then hide profile menu by removing the "open" class
    profileMenu?.classList.remove("open");

  })
  ;
}



/* ------------------------------------------------------------------------------------------ */
/* SIGN OUT */

// Setting up sign out behaviour
function setupSignout() {

  // Listening for any clicks on the sign out button
  signoutBtn?.addEventListener("click", () => {

    // Removing stored logged in user from localStorage
    clearCurrentUser();

    // Removing temporary reset email and verification status from localStorage
    clearResetState();

    // Hiding profile menu by removing "open" class
    profileMenu?.classList.remove("open");

    // Changing URL to login without reloading the page
    navigate(ROUTES.login);

    // Displaying login form section
    showSection("login");

  });

}



/* ------------------------------------------------------------------------------------------ */
/* PASSWORD TOGGLES */

// Setting up password visibility toggle button behavior
function setupPasswordToggles() {

  // Finding the HTML button with the "password-toggle" class
  document.querySelectorAll(".password-toggle").forEach((button) => {

    // Listening for any clicks on all password visibitly toggle buttons
    button.addEventListener("click", () => {

      // Finding the HTML input field and icon
      const input = button.parentElement.querySelector("input");
      const icon = button.querySelector(".material-icons");

      // If input field or icon cannot be found, then don't do anything
      if (!input || !icon) return;

      // Checking if password is currently hidden
      const isHidden = input.type === "password";

      // Switching the input type between text (for visibility) and password (for no visibility)
      input.type = isHidden ? "text" : "password";

      // Updating icon according to toggle status
      icon.textContent = isHidden ? "visibility" : "visibility_off";

      // Updating accessiblity screen reader attribute according to toggle status
      button.setAttribute("aria-pressed", String(isHidden));

    });

  });

}



/* ------------------------------------------------------------------------------------------ */
/* CREATE ACCOUNT */

async function handleCreateAccountSubmit(e) {

  // Stopping the page from refreshing
  e.preventDefault();

  // Hiding any previous error alert messages
  hideError("create-error");

  // Getting the form that was submitted
  const form = e.currentTarget;

  // Pulling all user inputs from form
  const body = getFormData(form);

  try {

    // Sendaing a POST request of  all user information to the server
    const { res, data } = await postJSON("/api/create-account", body);

    // If request fails, then send an error alert message
    if (!res.ok || !data.ok) {
      showError("create-error", data.message || "System error, please try again");
      return;
    }

    // Storing logged in user information into localStorage
    saveCurrentUser(data.user);

    // Clearing all form inputs
    form.reset();

    // Changing URL to homepage without reloading the page
    navigate(ROUTES.home);

    // Displaying success alert message
    showHome("Account created successfully!");

  } catch {

    // If unknown error happens, then display error alert message
    showError("create-error", "System error, please try again");

  }

}


/* ------------------------------------------------------------------------------------------ */
/* LOGIN */

async function handleLoginSubmit(e) {

  // Stopping the page from refreshing
  e.preventDefault();

  // Hiding any previous error alert messages
  hideError("login-error");

  // Getting the form that was submitted
  const form = e.currentTarget;

  // Pulling all user inputs from form
  const body = getFormData(form);

  try {

    // Sendaing a POST request of all user information to the server
    const { res, data } = await postJSON("/api/login", body);

    // If request fails, then send an error alert message
    if (!res.ok || !data.ok) {
      showError("login-error", data.message || "System error, please try again");
      return;
    }

    // Storing logged in user information into localStorage
    saveCurrentUser(data.user);

    // Clearing all form inputs
    form.reset();

    // Changing URL to homepage without reloading the page
    navigate(ROUTES.home);

    // Displaying success alert message
    showHome("Login successful!");

  } catch {

    // If unknown error happens, then display error alert message
    showError("login-error", "System error, please try again");

  }

}


/* ------------------------------------------------------------------------------------------ */
/* FORGOT PASSWORD */

async function handleForgotPasswordSubmit(e) {

  // Stopping the page from refreshing
  e.preventDefault();

  // Hiding any previous error alert messages
  hideError("forgot-password-error");

  // Getting the form that was submitted
  const form = e.currentTarget;

  // Pulling all user inputs from form
  const body = getFormData(form);

  try {

    // Sendaing a POST request of all user information to the server
    const { res, data } = await postJSON("/api/forgot-password", body);

    // If request fails, then send an error alert message
    if (!res.ok || !data.ok) {
      showError("forgot-password-error", data.message || "System error, please try again");
      return;
    }

    // Storing submitted reset email into localStorage
    saveResetEmail(body.email);

    // Clearing all form inputs
    form.reset();

    // Changing URL to verification form without reloading the page
    navigate(ROUTES.verification);

    // Displaying verification section
    showSection("verification");

    // Displaying success alert message
    showSuccess("verification-success", "We've sent a verification code to your email.");

  } catch {

    // If unknown error happens, then display error alert message
    showError("forgot-password-error", "System error, please try again");

  }

}


/* ------------------------------------------------------------------------------------------ */
/* VERIFICATION */

async function handleVerificationSubmit(e) {

  // Stopping the page from refreshing
  e.preventDefault();

  // Hiding any previous error and success alert messages
  hideError("verification-error");
  hideSuccess("verification-success");

  // Getting the form that was submitted
  const form = e.currentTarget;

  // Pulling all user inputs from form
  const body = getFormData(form);

  // Getting the stored reset email
  const email = getResetEmail();

  // Checking if all required fields are present, else send missing error
  if (!body.code || !email) {
    showError("verification-error", "Missing required fields");
    return;
  }

  // Checking if code only contains numbers, else send numbers only error
  if (!/^\d+$/.test(body.code)) {
    showError("verification-error", "Code must contain numbers only");
    return;
  }

  try {

    // Sendaing a POST request of all user information to the server
    const { res, data } = await postJSON("/api/verification", { email, code: body.code});

    // If request fails, then send an error alert message
    if (!res.ok || !data.ok) {
      showError("verification-error", data.message || "System error, please try again");
      return;
    }

    // Clearing all form inputs
    form.reset();

    // Setting varification status as successful
    saveResetVerified("true");

    // Changing URL to new-password form without reloading the page
    navigate(ROUTES["new-password"]);

    // Displaying new-password section
    showSection("new-password");

  } catch {

    // If unknown error happens, then display error alert message
    showError("verification-error", "System error, please try again");

  }

}


/* ------------------------------------------------------------------------------------------ */
/* NEW PASSWORD */

async function handleNewPasswordSubmit(e) {

  // Stopping the page from refreshing
  e.preventDefault();

  // Hiding any previous error alert messages
  hideError("new-password-error");

  // Getting the form that was submitted
  const form = e.currentTarget;

  // Pulling all user inputs from form
  const body = getFormData(form);

  // Getting the stored reset email
  const email = getResetEmail();

  // Getting the stored verfication status 
  const resetVerified = getResetVerified();

  // Checking if verification was completed, else send an error alert message
  if (!email || resetVerified !== "true") {
    showError("new-password-error", "System error, please try again");
    return;
  }

  // Checking if all required fields are present, else send missing error
  if (!body.newPassword || !body.confirmPassword) {
    showError("new-password-error", "Missing required fields");
    return;
  }

  // Checking if new and confirm passwords match, else send mismatch error
  if (body.newPassword !== body.confirmPassword) {
    showError("new-password-error", "New password and confirm password do not match");
    return;
  }

  try {

    // Sendaing a POST request of all user information to the server
    const { res, data } = await postJSON("/api/new-password", {
      email,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    });

    // If request fails, then send an error alert message
    if (!res.ok || !data.ok) {
      showError("new-password-error", data.message || "System error, please try again");
      return;
    }

    // Clearing all form inputs
    form.reset();

    // Removing temporary reset email and verification status from localStorage
    clearResetState();

    // Changing URL to login form without reloading the page
    navigate(ROUTES.login);

    // Displaying login section
    showSection("login");

    // Displaying success alert message
    showSuccess("login-success", "Password updated successfully!");

  } catch {

    // If unknown error happens, then display error alert message
    showError("new-password-error", "System error, please try again");

  }

}



/* ------------------------------------------------------------------------------------------ */
/* PRODUCTS */

const productList = document.querySelector("#product-list");
const productPageContent = document.querySelector("#product-details");
const productRecommendedProducts = document.querySelector(".product-recommended-products");
const cartRecommendedProducts = document.querySelector(".cart-recommended-products");
const categoryPage = document.querySelector("#category-page");
const productPage = document.querySelector("#product-page");
const cartPage = document.querySelector("#cart-page");
const cartList = document.querySelector("#cart-list");
const orderSummary = document.querySelector("#order-summary");
const removeCartModal = document.querySelector("#remove-cart-modal");
const checkoutPage = document.querySelector("#checkout-page");
const checkoutItemsList = document.querySelector("#checkout-items-list");
const checkoutSummary = document.querySelector("#checkout-summary");
const checkoutDeliveryDate = document.querySelector("#checkout-delivery-date");
const deliveryAddress = document.querySelector("#delivery-address");
const addressModal = document.querySelector("#address-modal");
const addressForm = document.querySelector("#address-form");
const paymentDetails = document.querySelector("#payment-details");
const favoritesPage = document.querySelector("#favorites-page");
const favoritesList = document.querySelector("#favorites-list");
const backToCategoryBtn = document.querySelector(".back-to-category-btn");
const cartNavBtn = document.querySelector(".cart-nav-btn");
const favoritesNavBtn = document.querySelector(".favorites-nav-btn");

let allProducts = [];
let favoriteProductIds = getFavoriteProductIds();
let cartItems = getCartItems();
let checkoutAddress = getCheckoutAddress();
let selectedPaymentOption = "";
let pendingRemoveCartItemId = null;
const PRODUCT_COLORS = [
  { name: "Black", value: "#2D0404" },
  { name: "Cream", value: "#FEF7F1" },
  { name: "Red", value: "#B4201E" },
  { name: "Pink", value: "#FEBDD4" },
  { name: "Blue", value: "#AFD2EB" },
  { name: "Brown", value: "#6F4B45" },
];
const PRODUCT_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

function getFavoriteProductIds() {
  const stored = localStorage.getItem(STORAGE_KEYS.favorites);
  return stored ? JSON.parse(stored) : [];
}

function saveFavoriteProductIds() {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteProductIds));
}

function isProductFavorite(productId) {
  return favoriteProductIds.includes(Number(productId));
}

function addFavoriteProduct(productId) {
  const id = Number(productId);
  if (isProductFavorite(id)) return;
  favoriteProductIds.push(id);
  saveFavoriteProductIds();
}

function removeFavoriteProduct(productId) {
  const id = Number(productId);
  favoriteProductIds = favoriteProductIds.filter((favoriteId) => favoriteId !== id);
  saveFavoriteProductIds();
}

function showStorePage(page) {
  document.querySelectorAll(".content .page-section").forEach((section) => {
    section.classList.add("hidden");
  });

  page?.classList.remove("hidden");
}

function showCategoryPage() {
  showStorePage(categoryPage);
}

function getCartItems() {
  const stored = localStorage.getItem(STORAGE_KEYS.cart);
  return stored ? JSON.parse(stored) : [];
}

function saveCartItems() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartItems));
}

function getProductById(productId) {
  return allProducts.find((product) => product.id === Number(productId));
}

function parsePrice(price) {
  return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function getCheckoutAddress() {
  const stored = localStorage.getItem(STORAGE_KEYS.checkoutAddress);
  return stored ? JSON.parse(stored) : {
    name: "Chenilyn Espineda",
    street: "123 Main Street",
    city: "City",
    state: "ST",
    zip: "12345",
  };
}

function saveCheckoutAddress() {
  localStorage.setItem(STORAGE_KEYS.checkoutAddress, JSON.stringify(checkoutAddress));
}

function renderDeliveryAddress() {
  if (!deliveryAddress) return;

  deliveryAddress.innerHTML = `
    <h4>Shipping address</h4>
    <p>${checkoutAddress.name}</p>
    <p>${checkoutAddress.street}</p>
    <p>${checkoutAddress.city}, ${checkoutAddress.state} ${checkoutAddress.zip}</p>
  `;
}

function getEstimatedDeliveryDate() {
  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(startDate.getDate() + 5);
  endDate.setDate(endDate.getDate() + 9);

  const format = { month: "short", day: "numeric" };
  return `Estimated delivery: ${startDate.toLocaleDateString("en-US", format)} - ${endDate.toLocaleDateString("en-US", format)}`;
}

function getOrderSummaryMarkup(showCheckoutButton = false) {
  const totals = getCartTotals();

  return `
    <div class="order-summary-card">
      <div class="order-summary-header">
        <h3>Order Summary</h3>
        <span>${totals.itemCount} item(s)</span>
      </div>

      <div class="summary-group summary-info-group">
        <div class="summary-divider"></div>

        <div class="summary-row">
          <span>Item(s) subtotal</span>
          <span>${formatCurrency(totals.itemSubtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${formatCurrency(totals.shipping)}</span>
        </div>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatCurrency(totals.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Estimated tax</span>
          <span>${formatCurrency(totals.tax)}</span>
        </div>
      </div>

      <div class="summary-group summary-total-group">
        <div class="summary-divider"></div>

        <div class="summary-row order-total-row">
          <span>Order total</span>
          <span>${formatCurrency(totals.total)}</span>
        </div>
      </div>

      ${showCheckoutButton ? `<button class="checkout-btn" type="button" ${totals.itemCount === 0 ? "disabled" : ""}>Checkout</button>` : ""}
    </div>

    <div class="order-summary-help">
      <div class="summary-help-row">
        <span class="material-icons">local_shipping</span>
        <span>Free standard shipping on orders over $75</span>
      </div>

      <div class="summary-help-row">
        <span class="material-icons">restart_alt</span>
        <span>Easy returns within 30 days</span>
      </div>

      <div class="summary-help-row">
        <span class="material-icons">lock</span>
        <span>Secure checkout</span>
      </div>
    </div>

    <div class="order-summary-support">
      <div>
        <span class="material-icons">support_agent</span>
        <h4>Need help?</h4>
        <p>Questions about your order? Our support team can help before you check out.</p>
      </div>

      <div>
        <span class="material-icons">credit_card</span>
        <h4>Payment options</h4>
        <p>Use major credit or debit cards at checkout.</p>
      </div>
    </div>
  `;
}

async function loadProducts() {
  if (!productList) return;

  const response = await fetch("products.json");
  allProducts = await response.json();

  renderProducts(allProducts);
}

function renderProducts(products) {
  productList.innerHTML = renderProductCards(products);
}

function renderProductCards(products) {
  return products.map((product) => {
    return `
      <div class="product-card" data-product-id="${product.id}">

        <div class="product-image">

          ${product.tag ? `
            <div class="product-tag">
              <span>${product.tag}</span>
            </div>
          ` : ""}

          <img src="${product.image}" alt="${product.name}"/>

        </div>

        <div class="product-info">

          <div class="product-info-details">
            <span class="product-name">${product.name}</span>
            <span class="product-price">${product.price}</span>
          </div>

          <button class="product-cart-btn" type="button" aria-label="Add ${product.name} to cart">
            <span class="material-icons">shopping_cart</span>
          </button>

        </div>

      </div>
    `;
  }).join("");
}

function renderFavorites() {
  if (!favoritesList) return;

  const favoriteProducts = allProducts.filter((product) => isProductFavorite(product.id));

  if (favoriteProducts.length === 0) {
    favoritesList.classList.add("is-empty");
    favoritesList.innerHTML = `
      <div class="favorites-empty-state">
        <span class="material-icons">shopping_bag</span>
        <span>No favorites yet</span>
      </div>
    `;
    return;
  }

  favoritesList.classList.remove("is-empty");
  favoritesList.innerHTML = renderProductCards(favoriteProducts);
}

function addCartItem(productId, quantity = 1, color = "", size = "") {
  const id = Number(productId);
  if (!getProductById(id)) {
    throw new Error("Product not found");
  }

  const existingItem = cartItems.find((item) => (
    item.productId === id &&
    item.color === color &&
    item.size === size
  ));

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({
      id: Date.now(),
      productId: id,
      color,
      size,
      quantity,
    });
  }

  saveCartItems();
  renderCart();
}

function updateCartItemQuantity(cartItemId, quantity) {
  const item = cartItems.find((cartItem) => cartItem.id === Number(cartItemId));
  if (!item) return;

  item.quantity = Math.max(1, quantity);
  saveCartItems();
  renderCart();
}

function removeCartItem(cartItemId) {
  cartItems = cartItems.filter((cartItem) => cartItem.id !== Number(cartItemId));
  saveCartItems();
  renderCart();
}

function getCartTotals() {
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const itemSubtotal = cartItems.reduce((total, item) => {
    const product = getProductById(item.productId);
    return total + (product ? parsePrice(product.price) * item.quantity : 0);
  }, 0);
  const shipping = itemSubtotal > 0 ? 0 : 0;
  const subtotal = itemSubtotal + shipping;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return { itemCount, itemSubtotal, shipping, subtotal, tax, total };
}

function renderCart() {
  if (!cartList || !orderSummary) return;

  const cartProducts = cartItems
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter(({ product }) => product);

  if (cartProducts.length === 0) {
    cartList.classList.add("is-empty");
    cartList.innerHTML = `
      <div class="cart-empty-state">
        <span class="material-icons">shopping_bag</span>
        <span>Your cart is empty</span>
      </div>
    `;
  } else {
    cartList.classList.remove("is-empty");
    cartList.innerHTML = cartProducts.map(({ item, product }) => `
      <div class="cart-row" data-cart-item-id="${item.id}">
        <div class="cart-item-image">
          <img src="${product.image}" alt="${product.name}"/>
        </div>

        <div class="cart-item-info">
          <div class="cart-item-heading">
            <span class="cart-item-name">${product.name}</span>
            <span class="cart-item-type">${product.type}</span>
          </div>
          <span class="cart-item-price">${product.price}</span>
        </div>

        <div class="cart-item-quantity" aria-label="Quantity">
          <button class="cart-quantity-btn cart-quantity-minus-btn" type="button" aria-label="Decrease quantity">
            <span class="material-icons">remove</span>
          </button>
          <span class="cart-quantity-value">${item.quantity}</span>
          <button class="cart-quantity-btn cart-quantity-plus-btn" type="button" aria-label="Increase quantity">
            <span class="material-icons">add</span>
          </button>
        </div>

        <button class="cart-remove-btn" type="button" aria-label="Remove ${product.name}">
          <span class="material-icons">delete</span>
        </button>
      </div>
    `).join("");
  }

  orderSummary.innerHTML = getOrderSummaryMarkup(true);
}

function renderCartRecommendations() {
  if (!cartRecommendedProducts) return;

  cartRecommendedProducts.innerHTML = `
    <div class="recommended-header">
      <h2 class="recommended-title">You may also like</h2>
    </div>

    <div class="recommended-list">
      ${renderProductCards(allProducts.slice(0, 12))}
    </div>
  `;
}

function renderCheckout() {
  if (!checkoutItemsList || !checkoutSummary) return;

  const checkoutProducts = cartItems
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter(({ product }) => product);

  if (checkoutDeliveryDate) {
    checkoutDeliveryDate.textContent = getEstimatedDeliveryDate();
  }
  renderDeliveryAddress();
  renderPaymentDetails();

  if (checkoutProducts.length === 0) {
    checkoutItemsList.classList.add("is-empty");
    checkoutItemsList.innerHTML = `
      <div class="checkout-empty-state">
        <span class="material-icons">shopping_bag</span>
        <span>No items to checkout</span>
      </div>
    `;
  } else {
    checkoutItemsList.classList.remove("is-empty");
    checkoutItemsList.innerHTML = checkoutProducts.map(({ item, product }) => `
      <div class="checkout-item-row">
        <div class="checkout-item-image">
          <img src="${product.image}" alt="${product.name}"/>
        </div>

        <div class="checkout-item-info">
          <span class="checkout-item-name">${product.name}</span>
          <span>${product.type}</span>
          <span>Color: ${item.color || "Not selected"}</span>
          <span>Size: ${item.size || "Not selected"}</span>
          <span>Quantity: ${item.quantity}</span>
        </div>

        <span class="checkout-item-price">${formatCurrency(parsePrice(product.price) * item.quantity)}</span>
      </div>
    `).join("");
  }

  checkoutSummary.innerHTML = getOrderSummaryMarkup(false);
}

function renderPaymentDetails() {
  if (!paymentDetails) return;

  checkoutPage?.querySelectorAll(".payment-option").forEach((button) => {
    button.classList.toggle("selected", button.dataset.payment === selectedPaymentOption);
  });

  if (!selectedPaymentOption) {
    paymentDetails.classList.add("hidden");
    paymentDetails.innerHTML = "";
    return;
  }

  paymentDetails.classList.remove("hidden");
  paymentDetails.innerHTML = `
    <div class="payment-form-section">
      <h4>Billing information</h4>
      <div class="payment-form-grid">
        <label>
          Name on card
          <input type="text" name="billingName" placeholder="Name on card" required/>
        </label>

        <label>
          Street address
          <input type="text" name="billingStreet" placeholder="Street address" required/>
        </label>

        <label>
          City
          <input type="text" name="billingCity" placeholder="City" required/>
        </label>

        <label>
          State
          <input type="text" name="billingState" placeholder="State" required maxlength="2"/>
        </label>

        <label>
          ZIP code
          <input type="text" name="billingZip" placeholder="ZIP code" required/>
        </label>
      </div>
    </div>

    <div class="payment-form-section">
      <h4>${selectedPaymentOption === "paypal" ? "PayPal account" : "Card information"}</h4>
      <div class="payment-form-grid">
        ${selectedPaymentOption === "paypal" ? `
          <label>
            PayPal email
            <input type="email" name="paypalEmail" placeholder="email@example.com" required/>
          </label>
        ` : `
          <label>
            Card number
            <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456" required/>
          </label>

          <label>
            Expiration
            <input type="text" name="cardExpiration" placeholder="MM/YY" required/>
          </label>

          <label>
            CVV
            <input type="text" name="cardCvv" placeholder="123" required/>
          </label>
        `}
      </div>
    </div>

    <button class="place-order-btn" type="button" disabled>Place Order</button>
  `;
  updatePlaceOrderButton();
}

function updatePlaceOrderButton() {
  const placeOrderButton = checkoutPage?.querySelector(".place-order-btn");
  if (!placeOrderButton || !paymentDetails || paymentDetails.classList.contains("hidden")) return;

  const requiredInputs = Array.from(paymentDetails.querySelectorAll("input[required]"));
  const isComplete = requiredInputs.every((input) => input.value.trim() !== "");
  placeOrderButton.disabled = !isComplete;
}



/* ------------------------------------------------------------------------------------------ */
/* PRODUCT PAGE */

function getProductDescription(product) {
  return product.description || `A polished everyday ${product.type.toLowerCase()} made for easy styling and repeat wear.`;
}

function getRatingStars(rating) {
  return Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const icon = rating >= starValue ? "star" : rating >= starValue - 0.5 ? "star_half" : "star_outline";
    return `<span class="material-icons">${icon}</span>`;
  }).join("");
}

function showToast(type, message) {
  const boxId = type === "error" ? "home-error" : "home-success";

  if (type === "error") {
    showError(boxId, message);
  } else {
    showSuccess(boxId, message);
  }

  setTimeout(() => {
    if (type === "error") {
      hideError(boxId);
    } else {
      hideSuccess(boxId);
    }
  }, 2000);
}

function setupProductClicks() {
  productList?.addEventListener("click", (e) => {
    if (e.target.closest(".product-cart-btn")) return;

    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = Number(card.dataset.productId);
    const product = allProducts.find((item) => item.id === productId);

    if (!product) return;

    showProductPage(product);
  });

  favoritesList?.addEventListener("click", (e) => {
    if (e.target.closest(".product-cart-btn")) return;

    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = Number(card.dataset.productId);
    const product = allProducts.find((item) => item.id === productId);

    if (!product) return;

    showProductPage(product);
  });

  productRecommendedProducts?.addEventListener("click", (e) => {
    if (e.target.closest(".product-cart-btn")) return;

    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = Number(card.dataset.productId);
    const product = getProductById(productId);

    if (!product) return;

    showProductPage(product);
  });

  cartRecommendedProducts?.addEventListener("click", (e) => {
    if (e.target.closest(".product-cart-btn")) return;

    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = Number(card.dataset.productId);
    const product = getProductById(productId);

    if (!product) return;

    showProductPage(product);
  });
}

function showProductPage(product) {
  showStorePage(productPage);

  if (!productPageContent) return;

  const isFavorite = isProductFavorite(product.id);
  const recommended = allProducts
  .filter((item) => item.id !== product.id)
  .slice(0, 8);

  productPageContent.innerHTML = `
    <div class="product-detail" data-product-id="${product.id}">

      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}"/>
      </div>

      <div class="product-detail-info">

        <h2 class="product-detail-name">${product.name}</h2>
        <p class="product-detail-description">${getProductDescription(product)}</p>

        <div class="product-detail-rating" aria-label="Rated ${product.rating} out of 5">
          <span class="product-rating-stars">${getRatingStars(product.rating)}</span>
          <span class="product-rating-number">(${product.rating.toFixed(1)})</span>
        </div>

        ${product.tag ? `
          <div class="product-detail-tag">
            <span>${product.tag}</span>
          </div>
        ` : ""}

        <span class="product-detail-price">${product.price}</span>

        <div class="product-option-group">
          <span class="product-option-label">Color: <span class="selected-color-text"></span></span>
          <div class="product-color-options">
            ${PRODUCT_COLORS.map((color) => `
              <button
                class="product-color-option"
                type="button"
                data-color="${color.name}"
                aria-label="${color.name}"
                style="--option-color: ${color.value};"
              >
                <span class="material-icons">check</span>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="product-option-group">
          <span class="product-option-label">Size: <span class="selected-size-text"></span></span>
          <div class="product-size-options">
            ${PRODUCT_SIZES.map((size) => `
              <button class="size-option product-size-option" type="button" data-size="${size}">${size}</button>
            `).join("")}
          </div>
        </div>

        <div class="product-detail-actions">
          <div class="product-quantity" aria-label="Quantity">
            <button class="quantity-btn quantity-minus-btn" type="button" aria-label="Decrease quantity">
              <span class="material-icons">remove</span>
            </button>

            <span class="quantity-value">1</span>

            <button class="quantity-btn quantity-plus-btn" type="button" aria-label="Increase quantity">
              <span class="material-icons">add</span>
            </button>
          </div>

          <button class="product-detail-cart-btn" type="button">Add to Cart</button>

          <button class="product-favorite-btn ${isFavorite ? "selected" : ""}" type="button" aria-label="Add to favorites">
            <span class="material-icons">${isFavorite ? "favorite" : "favorite_border"}</span>
          </button>
        </div>

      </div>

    </div>
  `;

  if (productRecommendedProducts) {
    productRecommendedProducts.innerHTML = `
      <div class="recommended-header">
        <h2 class="recommended-title">You may also like</h2>
        <button class="text-link view-more-link recommended-view-more-btn" type="button">
          <span class="link-text">View more</span>
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>

      <div class="recommended-list">
        ${renderProductCards(recommended)}
      </div>
    `;
  }
}

function setupProductPageBackButton() {
  backToCategoryBtn?.addEventListener("click", () => {
    showCategoryPage();
  });
}


function showCartToast() {
  showToast("success", "Added to cart");
}

function setupCartButtons() {
  document.addEventListener("click", (e) => {
    const cartButton = e.target.closest(".product-cart-btn, .product-detail-cart-btn");

    if (!cartButton) return;

    e.stopPropagation();

    if (cartButton.classList.contains("product-detail-cart-btn")) {
      const detail = cartButton.closest(".product-detail");
      const selectedColor = detail?.dataset.selectedColor;
      const selectedSize = detail?.dataset.selectedSize;

      if (!selectedColor && !selectedSize) {
        showToast("error", "Please select a color and size");
        return;
      }

      if (!selectedColor) {
        showToast("error", "Please select a color");
        return;
      }

      if (!selectedSize) {
        showToast("error", "Please select a size");
        return;
      }
    }

    try {
      if (cartButton.classList.contains("product-detail-cart-btn")) {
        const detail = cartButton.closest(".product-detail");
        const productId = Number(detail?.dataset.productId);
        const selectedColor = detail?.dataset.selectedColor;
        const selectedSize = detail?.dataset.selectedSize;
        const quantity = Number(detail?.querySelector(".quantity-value")?.textContent || 1);

        addCartItem(productId, quantity, selectedColor, selectedSize);
      } else {
        const card = cartButton.closest(".product-card");
        const productId = Number(card?.dataset.productId);

        addCartItem(productId);
      }

      showCartToast();
    } catch {
      showToast("error", "Couldn't be added to cart");
    }
  });
}

function setupProductDetailControls() {
  document.addEventListener("click", (e) => {
    const viewMoreButton = e.target.closest(".recommended-view-more-btn");
    if (viewMoreButton) {
      showCategoryPage();
      return;
    }

    const detail = e.target.closest(".product-detail");
    if (!detail) return;

    const colorButton = e.target.closest(".product-color-option");
    if (colorButton) {
      detail.dataset.selectedColor = colorButton.dataset.color;
      detail.querySelectorAll(".product-color-option").forEach((button) => button.classList.remove("selected"));
      colorButton.classList.add("selected");
      const selectedColorText = detail.querySelector(".selected-color-text");
      if (selectedColorText) selectedColorText.textContent = colorButton.dataset.color;
      return;
    }

    const sizeButton = e.target.closest(".product-size-option");
    if (sizeButton) {
      detail.dataset.selectedSize = sizeButton.dataset.size;
      detail.querySelectorAll(".product-size-option").forEach((button) => button.classList.remove("selected"));
      sizeButton.classList.add("selected");
      const selectedSizeText = detail.querySelector(".selected-size-text");
      if (selectedSizeText) selectedSizeText.textContent = sizeButton.dataset.size;
      return;
    }

    const quantityValue = detail.querySelector(".quantity-value");
    const currentQuantity = Number(quantityValue?.textContent || 1);

    if (e.target.closest(".quantity-minus-btn")) {
      if (quantityValue) quantityValue.textContent = String(Math.max(1, currentQuantity - 1));
      return;
    }

    if (e.target.closest(".quantity-plus-btn")) {
      if (quantityValue) quantityValue.textContent = String(currentQuantity + 1);
      return;
    }

    const favoriteButton = e.target.closest(".product-favorite-btn");
    if (favoriteButton) {
      try {
        const productId = Number(detail.dataset.productId);
        const isSelected = favoriteButton.classList.toggle("selected");
        const icon = favoriteButton.querySelector(".material-icons");

        if (icon) icon.textContent = isSelected ? "favorite" : "favorite_border";

        if (isSelected) {
          addFavoriteProduct(productId);
        } else {
          removeFavoriteProduct(productId);
        }

        renderFavorites();

        showToast(
          "success",
          isSelected ? "Added to favorites" : "Removed from favorites"
        );
      } catch {
        showToast("error", "Couldn't be added to favorites");
      }
    }
  });
}

function setupFavoritesPage() {
  favoritesNavBtn?.addEventListener("click", () => {
    renderFavorites();
    showStorePage(favoritesPage);
  });
}

function openRemoveCartModal(cartItemId) {
  pendingRemoveCartItemId = Number(cartItemId);
  removeCartModal?.classList.remove("hidden");
}

function closeRemoveCartModal() {
  pendingRemoveCartItemId = null;
  removeCartModal?.classList.add("hidden");
}

function setupCartPage() {
  cartNavBtn?.addEventListener("click", () => {
    renderCart();
    renderCartRecommendations();
    showStorePage(cartPage);
  });

  cartList?.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-row");
    if (!row) return;

    const cartItemId = Number(row.dataset.cartItemId);
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (!item) return;

    if (e.target.closest(".cart-quantity-minus-btn")) {
      updateCartItemQuantity(cartItemId, item.quantity - 1);
      return;
    }

    if (e.target.closest(".cart-quantity-plus-btn")) {
      updateCartItemQuantity(cartItemId, item.quantity + 1);
      return;
    }

    if (e.target.closest(".cart-remove-btn")) {
      openRemoveCartModal(cartItemId);
    }
  });

  removeCartModal?.addEventListener("click", (e) => {
    if (
      e.target === removeCartModal ||
      e.target.closest(".remove-modal-close-btn") ||
      e.target.closest(".remove-modal-cancel-btn")
    ) {
      closeRemoveCartModal();
      return;
    }

    if (e.target.closest(".remove-modal-confirm-btn")) {
      removeCartItem(pendingRemoveCartItemId);
      closeRemoveCartModal();
    }
  });

  orderSummary?.addEventListener("click", (e) => {
    const checkoutButton = e.target.closest(".checkout-btn");
    if (!checkoutButton || checkoutButton.disabled) return;

    selectedPaymentOption = "";
    renderCheckout();
    showStorePage(checkoutPage);
  });
}

function openAddressModal() {
  if (!addressForm) return;

  addressForm.elements.name.value = checkoutAddress.name;
  addressForm.elements.street.value = checkoutAddress.street;
  addressForm.elements.city.value = checkoutAddress.city;
  addressForm.elements.state.value = checkoutAddress.state;
  addressForm.elements.zip.value = checkoutAddress.zip;
  addressModal?.classList.remove("hidden");
}

function closeAddressModal() {
  addressModal?.classList.add("hidden");
}

function setupCheckoutPage() {
  checkoutPage?.addEventListener("click", (e) => {
    if (e.target.closest(".checkout-back-cart-btn")) {
      renderCart();
      renderCartRecommendations();
      showStorePage(cartPage);
      return;
    }

    if (e.target.closest(".checkout-edit-btn")) {
      openAddressModal();
      return;
    }

    const paymentOption = e.target.closest(".payment-option");
    if (paymentOption) {
      selectedPaymentOption = paymentOption.dataset.payment;
      checkoutPage.querySelectorAll(".payment-option").forEach((button) => {
        button.classList.toggle("selected", button === paymentOption);
      });
      renderPaymentDetails();
      return;
    }

    if (e.target.closest(".place-order-btn")) {
      if (e.target.closest(".place-order-btn").disabled) return;
      cartItems = [];
      saveCartItems();
      renderCart();
      showToast("success", "Order placed");
      showCategoryPage();
    }
  });

  checkoutPage?.addEventListener("input", (e) => {
    if (e.target.closest("#payment-details")) {
      updatePlaceOrderButton();
    }
  });

  addressModal?.addEventListener("click", (e) => {
    if (
      e.target === addressModal ||
      e.target.closest(".address-modal-close-btn") ||
      e.target.closest(".address-modal-cancel-btn")
    ) {
      closeAddressModal();
    }
  });

  addressForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getFormData(addressForm);
    checkoutAddress = {
      name: data.name,
      street: data.street,
      city: data.city,
      state: data.state.toUpperCase(),
      zip: data.zip,
    };
    saveCheckoutAddress();
    renderDeliveryAddress();
    closeAddressModal();
  });
}




/* ------------------------------------------------------------------------------------------ */
/* FORM EVENT BINDINGS */

// Connecting forms to their handler functions, after user submits form then it should perform specified tasks after submission
function setupFormHandlers() {
  createForm?.addEventListener("submit", handleCreateAccountSubmit);
  loginForm?.addEventListener("submit", handleLoginSubmit);
  forgotPasswordForm?.addEventListener("submit", handleForgotPasswordSubmit);
  verificationForm?.addEventListener("submit", handleVerificationSubmit);
  newPasswordForm?.addEventListener("submit", handleNewPasswordSubmit);
}


/* ------------------------------------------------------------------------------------------ */
/* INIT */

// Setup to running all functions 
function init() {
  setupRouteSwitching();
  setupProfileMenu();
  setupSignout();
  setupPasswordToggles();
  setupInputListeners();
  setupFormHandlers();
  loadRoute();
  loadProducts();
  setupProductClicks();
  setupProductPageBackButton();
  setupCartButtons();
  setupProductDetailControls();
  setupFavoritesPage();
  setupCartPage();
  setupCheckoutPage();
}

// Starting the app
init();
