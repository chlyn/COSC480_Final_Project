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
  orders: "orders",               // Placed orders
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
const categoryTitle = document.querySelector(".category-title");
const categoryNavButtons = document.querySelectorAll(".nav-btn[data-category]");
const filtersClearBtn = document.querySelector(".filters-clear-btn");
const searchInput = document.querySelector('.search input[name="search"]');
const searchClearBtn = document.querySelector("#search-clear-btn");
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
const profilePage = document.querySelector("#profile-page");
const profileAccountCard = document.querySelector("#profile-account-card");
const profileOrdersList = document.querySelector("#profile-orders-list");
const orderConfirmationModal = document.querySelector("#order-confirmation-modal");
const orderConfirmationBody = document.querySelector("#order-confirmation-body");
const profileEditModal = document.querySelector("#profile-edit-modal");
const profileEditForm = document.querySelector("#profile-edit-form");
const profilePasswordModal = document.querySelector("#profile-password-modal");
const profilePasswordForm = document.querySelector("#profile-password-form");
const favoritesPage = document.querySelector("#favorites-page");
const favoritesList = document.querySelector("#favorites-list");
const backToCategoryBtn = document.querySelector(".back-to-category-btn");
const cartNavBtn = document.querySelector(".cart-nav-btn");
const favoritesNavBtn = document.querySelector(".favorites-nav-btn");
const profileNavBtn = document.querySelector(".profile-nav-btn");

let allProducts = [];
let activeCategory = "women";
let selectedTypes = [];
let selectedTags = [];
let searchTerm = "";
let favoriteProductIds = getFavoriteProductIds();
let cartItems = getCartItems();
let orders = getOrders();
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

function getOrders() {
  const stored = localStorage.getItem(STORAGE_KEYS.orders);
  return stored ? JSON.parse(stored) : [];
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function addOrder(order) {
  orders.unshift(order);
  saveOrders();
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

  try {
    const response = await fetch("/api/products");
    const products = await response.json();
    allProducts = Array.isArray(products) && products.length > 0 ? products : [];
  } catch {
    allProducts = [];
  }

  if (allProducts.length === 0) {
    const response = await fetch("products.json");
    allProducts = await response.json();
  }

  applyProductFilters();
}

function renderProducts(products) {
  productList.innerHTML = renderProductCards(products);
}

function normalizeProductType(type) {
  const value = String(type || "").toLowerCase();
  if (["top", "tops", "shirt", "sweater", "jacket"].includes(value)) return "top";
  if (["bottom", "bottoms", "pants", "skirt", "shorts"].includes(value)) return "bottom";
  if (["shoe", "shoes", "sneakers", "boots"].includes(value)) return "shoes";
  if (["dress", "dresses"].includes(value)) return "dress";
  if (["accessory", "accessories", "bag", "bags"].includes(value)) return "accessory";
  return value;
}

function isProductInActiveCategory(product) {
  const category = String(product.category || "women").toLowerCase();

  if (activeCategory === "sales") {
    return category === "sales" || String(product.tag || "").toLowerCase().includes("off");
  }

  return category === activeCategory;
}

function applyProductFilters() {
  let products = allProducts.filter(isProductInActiveCategory);

  if (selectedTypes.length > 0) {
    products = products.filter((product) => selectedTypes.includes(normalizeProductType(product.type)));
  }

  if (selectedTags.length > 0) {
    products = products.filter((product) => selectedTags.includes(product.tag));
  }

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    products = products.filter((product) => (
      product.name.toLowerCase().includes(query) ||
      String(product.description || "").toLowerCase().includes(query) ||
      String(product.type || "").toLowerCase().includes(query)
    ));
  }

  if (categoryTitle) {
    categoryTitle.textContent = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
  }

  if (searchClearBtn) {
    searchClearBtn.classList.toggle("hidden", !searchTerm);
  }

  renderProducts(products);
}

function renderProductCards(products) {
  return products.map((product) => {
    const hasImage = Boolean(product.image);
    return `
      <div class="product-card" data-product-id="${product.id}">

        <div class="product-image">

          ${product.tag ? `
            <div class="product-tag">
              <span>${product.tag}</span>
            </div>
          ` : ""}

          ${hasImage ? `
            <img src="${product.image}" alt="${product.name}"/>
          ` : `
            <div class="product-image-placeholder">
              <span>${product.name}</span>
            </div>
          `}

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

function getOrderItemsSnapshot() {
  return cartItems
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;

      return {
        name: product.name,
        type: product.type,
        price: product.price,
        image: product.image,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);
}

function getOrderSummarySnapshot() {
  const totals = getCartTotals();
  return {
    itemCount: totals.itemCount,
    itemSubtotal: totals.itemSubtotal,
    shipping: totals.shipping,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
  };
}

function renderOrderConfirmation(order) {
  if (!orderConfirmationBody) return;

  orderConfirmationBody.innerHTML = `
    <div class="order-confirmation-section">
      <h4>Shipping information</h4>
      <p>${order.shipping.name}</p>
      <p>${order.shipping.street}</p>
      <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}</p>
      <p>${order.deliveryDate}</p>
    </div>

    <div class="order-confirmation-section">
      <h4>Order summary</h4>
      <div class="summary-row">
        <span>Items</span>
        <span>${order.summary.itemCount}</span>
      </div>
      <div class="summary-row">
        <span>Order total</span>
        <span>${formatCurrency(order.summary.total)}</span>
      </div>
    </div>

    <div class="order-confirmation-section">
      <h4>Etherscan receipt</h4>
      <a class="text-link etherscan-link" href="${order.etherscanUrl}" target="_blank" rel="noopener noreferrer">
        <span class="link-text">Open Etherscan receipt</span>
      </a>
    </div>
  `;

  orderConfirmationModal?.classList.remove("hidden");
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

function setupCategoryControls() {
  categoryNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      categoryNavButtons.forEach((navButton) => navButton.classList.toggle("active", navButton === button));
      selectedTypes = [];
      selectedTags = [];
      searchTerm = "";
      if (searchInput) searchInput.value = "";
      document.querySelectorAll('.filter-checkbox input[name="category"]').forEach((input) => input.checked = false);
      document.querySelectorAll(".tag-option, .color-option, .size-option").forEach((option) => option.classList.remove("selected"));
      showCategoryPage();
      applyProductFilters();
    });
  });

  document.querySelectorAll('.filter-checkbox input[name="category"]').forEach((input) => {
    input.addEventListener("change", () => {
      selectedTypes = Array.from(document.querySelectorAll('.filter-checkbox input[name="category"]:checked'))
        .map((checkedInput) => checkedInput.value);
      applyProductFilters();
    });
  });

  document.querySelectorAll(".tag-option").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      selectedTags = Array.from(document.querySelectorAll(".tag-option.selected"))
        .map((tagButton) => tagButton.dataset.tag);
      applyProductFilters();
    });
  });

  document.querySelectorAll(".color-option, .size-option").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
    });
  });

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    applyProductFilters();
  });

  searchClearBtn?.addEventListener("click", () => {
    searchTerm = "";
    if (searchInput) searchInput.value = "";
    applyProductFilters();
  });

  filtersClearBtn?.addEventListener("click", () => {
    selectedTypes = [];
    selectedTags = [];
    searchTerm = "";
    if (searchInput) searchInput.value = "";
    document.querySelectorAll('.filter-checkbox input[name="category"]').forEach((input) => input.checked = false);
    document.querySelectorAll(".tag-option, .color-option, .size-option").forEach((option) => option.classList.remove("selected"));
    applyProductFilters();
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
        ${product.image ? `
          <img src="${product.image}" alt="${product.name}"/>
        ` : `
          <div class="product-image-placeholder product-detail-placeholder">
            <span>${product.name}</span>
          </div>
        `}
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

function renderProfile() {
  const user = getCurrentUser();

  if (profileAccountCard) {
    if (user) {
      const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Rouge shopper";
      profileAccountCard.innerHTML = `
        <div class="profile-card-header">
          <h3>Account</h3>
        </div>
        <div class="profile-account-details">
          <span class="profile-account-name">${fullName}</span>
          <span>${user.email || ""}</span>
        </div>
        <div class="profile-actions">
          <button class="modal-cancel-btn profile-edit-btn" type="button">Edit profile</button>
          <button class="modal-cancel-btn profile-change-password-btn" type="button">Change password</button>
          <button class="modal-remove-btn profile-logout-btn" type="button">Log out</button>
        </div>
      `;
    } else {
      profileAccountCard.innerHTML = `
        <div class="profile-card-header">
          <h3>Account</h3>
        </div>
        <p class="profile-empty-text">Login to see your profile and order history.</p>
        <button class="form-btn profile-login-btn" type="button">Login</button>
      `;
    }
  }

  if (!profileOrdersList) return;

  if (orders.length === 0) {
    profileOrdersList.classList.add("is-empty");
    profileOrdersList.innerHTML = `
      <div class="profile-empty-state">
        <span class="material-icons">receipt_long</span>
        <span>No orders yet</span>
      </div>
    `;
    return;
  }

  profileOrdersList.classList.remove("is-empty");
  profileOrdersList.innerHTML = orders.map((order) => `
    <div class="profile-order-row">
      <div>
        <span class="profile-order-title">Order ${order.id}</span>
        <span class="profile-order-meta">${order.date} · ${order.summary.itemCount} item(s)</span>
      </div>
      <span class="profile-order-total">${formatCurrency(order.summary.total)}</span>
      <a class="text-link etherscan-link" href="${order.etherscanUrl}" target="_blank" rel="noopener noreferrer">
        <span class="link-text">Etherscan receipt</span>
      </a>
    </div>
  `).join("");
}

function setupProfilePage() {
  profileNavBtn?.addEventListener("click", () => {
    renderProfile();
    showStorePage(profilePage);
  });

  profilePage?.addEventListener("click", (e) => {
    if (e.target.closest(".profile-login-btn")) {
      navigate(ROUTES.login);
      showSection("login");
      return;
    }

    if (e.target.closest(".profile-edit-btn")) {
      const user = getCurrentUser();
      if (!user || !profileEditForm) return;
      profileEditForm.elements.firstname.value = user.firstname || "";
      profileEditForm.elements.lastname.value = user.lastname || "";
      profileEditForm.elements.email.value = user.email || "";
      profileEditModal?.classList.remove("hidden");
      return;
    }

    if (e.target.closest(".profile-change-password-btn")) {
      const user = getCurrentUser();
      if (user && profilePasswordForm) {
        profilePasswordForm.elements.email.value = user.email || "";
      }
      profilePasswordModal?.classList.remove("hidden");
      return;
    }

    if (e.target.closest(".profile-logout-btn")) {
      clearCurrentUser();
      renderProfile();
      return;
    }
  });

  profileEditModal?.addEventListener("click", (e) => {
    if (
      e.target === profileEditModal ||
      e.target.closest(".profile-edit-close-btn") ||
      e.target.closest(".profile-edit-cancel-btn")
    ) {
      profileEditModal.classList.add("hidden");
    }
  });

  profileEditForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    const data = getFormData(profileEditForm);
    const updatedUser = { ...currentUser, ...data };

    try {
      await postJSON("/api/update-profile", {
        currentEmail: currentUser.email,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
      });
    } catch {
      // Local profile still updates so the UI remains usable offline.
    }

    saveCurrentUser(updatedUser);
    populateHome(updatedUser);
    renderProfile();
    profileEditModal?.classList.add("hidden");
  });

  profilePasswordModal?.addEventListener("click", (e) => {
    if (
      e.target === profilePasswordModal ||
      e.target.closest(".profile-password-close-btn") ||
      e.target.closest(".profile-password-cancel-btn")
    ) {
      profilePasswordModal.classList.add("hidden");
    }
  });

  profilePasswordModal?.addEventListener("click", async (e) => {
    if (!e.target.closest(".profile-send-code-btn") || !profilePasswordForm) return;
    const email = profilePasswordForm.elements.email.value.trim();
    if (!email) {
      showToast("error", "Please enter your email");
      return;
    }
    const { res, data } = await postJSON("/api/forgot-password", { email });
    if (!res.ok || !data.ok) {
      showToast("error", data.message || "Could not send code");
      return;
    }
    showToast("success", "Verification code sent");
  });

  profilePasswordForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = getFormData(profilePasswordForm);

    const verification = await postJSON("/api/verification", {
      email: body.email,
      code: body.code,
    });

    if (!verification.res.ok || !verification.data.ok) {
      showToast("error", verification.data.message || "Invalid verification code");
      return;
    }

    const passwordUpdate = await postJSON("/api/new-password", {
      email: body.email,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    });

    if (!passwordUpdate.res.ok || !passwordUpdate.data.ok) {
      showToast("error", passwordUpdate.data.message || "Could not update password");
      return;
    }

    profilePasswordForm.reset();
    profilePasswordModal?.classList.add("hidden");
    showToast("success", "Password updated successfully");
  });

  orderConfirmationModal?.addEventListener("click", (e) => {
    if (
      e.target === orderConfirmationModal ||
      e.target.closest(".order-confirmation-close-btn") ||
      e.target.closest(".order-confirmation-done-btn")
    ) {
      orderConfirmationModal.classList.add("hidden");
    }
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
  checkoutPage?.addEventListener("click", async (e) => {
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
      const placeOrderButton = e.target.closest(".place-order-btn");
      if (placeOrderButton.disabled) return;

      try {
        placeOrderButton.disabled = true;
        placeOrderButton.textContent = "Placing order...";

        const totals = getCartTotals();
        const orderItems = getOrderItemsSnapshot();
        const orderSummarySnapshot = getOrderSummarySnapshot();

        const { res, data } = await postJSON("/api/place-order", {
          user: getCurrentUser(),
          cartItems,
          total: totals.total,
        });

        if (!res.ok || !data.ok) {
          showToast("error", data.message || "Order could not be placed");
          placeOrderButton.disabled = false;
          placeOrderButton.textContent = "Place Order";
          return;
        }

        const order = {
          id: `#${Date.now()}`,
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          shipping: { ...checkoutAddress },
          deliveryDate: getEstimatedDeliveryDate(),
          items: orderItems,
          summary: orderSummarySnapshot,
          etherscanUrl: data.etherscanUrl || "https://sepolia.etherscan.io/tx/0xa1db96bdb213dcaf2b0924d3529dfdfc78344d3bc352f25925d01ea72c5ff442",
        };
        addOrder(order);

        cartItems = [];
        saveCartItems();
        renderCart();

        showCategoryPage();
        renderOrderConfirmation(order);

      } catch (err) {
        console.error(err);
        showToast("error", "Order could not be placed");
        placeOrderButton.disabled = false;
        placeOrderButton.textContent = "Place Order";
      }
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
  setupCategoryControls();
  setupProductClicks();
  setupProductPageBackButton();
  setupCartButtons();
  setupProductDetailControls();
  setupFavoritesPage();
  setupCartPage();
  setupCheckoutPage();
  setupProfilePage();
}

// Starting the app
init();
