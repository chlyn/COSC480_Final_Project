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
}

// Starting the app
init();