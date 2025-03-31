// DOM Elements
const authForms = document.getElementById("auth-forms");
const accountInfo = document.getElementById("account-info");
const lockBtn = document.getElementById("lock-btn");
const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");

// Initialize UI
function initUI() {
  chrome.runtime.sendMessage({ action: "getAuthStatus" }, (response) => {
    if (response.authenticated) {
      showWalletUI();
    } else {
      showAuthUI();
    }
  });
}

// Show authentication forms
function showAuthUI() {
  authForms.style.display = "block";
  accountInfo.style.display = "none";
  lockBtn.style.display = "none";
  signinForm.style.display = "block";
  signupForm.style.display = "none";
  clearAllStates();
}

// Show wallet dashboard
function showWalletUI() {
  authForms.style.display = "none";
  accountInfo.style.display = "block";
  lockBtn.style.display = "block";
  initializeWallet();
}

// Form toggle handlers
document.getElementById("show-signup").addEventListener("click", (e) => {
  e.preventDefault();
  signinForm.style.display = "none";
  signupForm.style.display = "block";
});

document.getElementById("show-signin").addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.style.display = "none";
  signinForm.style.display = "block";
});

// Auth handlers
document.getElementById("signin-btn").addEventListener("click", (e) => {
  e.preventDefault();
  handleAuth("authenticate");
});

document.getElementById("signup-btn").addEventListener("click", (e) => {
  e.preventDefault();
  handleAuth("register");
});

// Unified auth handler
// Update the handleAuth function's authentication callback
function handleAuth(action) {
  const email = document.getElementById(`${action === "register" ? "signup" : "signin"}-email`).value;
  const password = document.getElementById(`${action === "register" ? "signup" : "signin"}-password`).value;

  if (!validateEmail(email) || !validatePassword(password)) return;

  if (action === "register") {
    const confirm = document.getElementById("signup-confirm").value;
    if (password !== confirm) {
      alert("Passwords don't match!");
      return;
    }
  }

  chrome.runtime.sendMessage({ 
    action,
    email,
    password 
  }, (response) => {
    if (response.success) {
      showWalletUI();
    } else {
      // Handle specific error cases
      if (action === "authenticate") {
        if (response.error === "User not found") {
          alert("Account not found. Please sign up first.");
          // Switch to signup form
          signinForm.style.display = "none";
          signupForm.style.display = "block";
        } else if (response.error === "Invalid password") {
          alert("Incorrect password. Please try again.");
        }
      } else if (action === "register") {
        if (response.error === "User exists") {
          alert("Account already exists. Please sign in instead.");
          // Switch to signin form
          signupForm.style.display = "none";
          signinForm.style.display = "block";
        }
      }
    }
  });
}

// Add registration validation to prevent duplicate accounts
document.getElementById("signup-btn").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (!validateEmail(email) || !validatePassword(password)) return;
  
  if (password !== confirm) {
    alert("Passwords don't match!");
    return;
  }

  chrome.runtime.sendMessage({ 
    action: "register",
    email,
    password,
    confirm // Add confirm to the message
  }, (response) => {
    if (response.success) {
      showWalletUI();
    } else {
      if (response.error === "User exists") {
        alert("Account already exists. Please sign in.");
        signupForm.style.display = "none";
        signinForm.style.display = "block";
      }
    }
  });
});
// Lock button handler
lockBtn.addEventListener("click", () => {
  // First disconnect the wallet
  chrome.runtime.sendMessage({ action: "disconnect" }, () => {
    // Then lock the wallet
    chrome.runtime.sendMessage({ action: "lock" }, (response) => {
      if (response.success) {
        showAuthUI();
      }
    });
  });
});

// Initialize when DOM loads
document.addEventListener("DOMContentLoaded", initUI);

// Validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@gmail\.com$/;
  if (!re.test(email)) {
    alert("Please enter a valid Gmail address");
    return false;
  }
  return true;
}

function validatePassword(password) {
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!re.test(password)) {
    alert("Password must contain:\n- 8+ characters\n- Uppercase letter\n- Lowercase letter\n- Number");
    return false;
  }
  return true;
}

// Clear all states
function clearAllStates() {
  // Clear input fields
  document.getElementById("signin-email").value = "";
  document.getElementById("signin-password").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-password").value = "";
  document.getElementById("signup-confirm").value = "";
  
  // Clear any stored data
  chrome.storage.local.clear(() => {
    console.log("All states cleared");
  });
}

function initializeWallet() {
  chrome.runtime.sendMessage({ action: "connect" }, (connectResponse) => {
    if (connectResponse.success) {
      // Get the authenticated user's email
      chrome.runtime.sendMessage({ action: "getAuthStatus" }, (authResponse) => {
        const userEmail = authResponse.email;
        
        // Populate wallet data with user email
        document.getElementById("account-info").innerHTML = `
          <div class="user-info">
            <p>Logged in as: ${userEmail}</p>
            <p>Connected: ${connectResponse.accounts[0].slice(0, 6)}...${connectResponse.accounts[0].slice(-4)}</p>
          </div>
          <div class="wallet-header">
            <div class="network-indicator">Ethereum Mainnet</div>
            <div class="balance">0.00 ETH</div>
          </div>
          
          <div class="action-grid">
            <button class="action-btn">
              <svg class="action-icon" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              Send
            </button>
            <button class="action-btn">
              <svg class="action-icon" viewBox="0 0 24 24">
                <path d="M22 12l-4-4v3H3v2h15v3z"/>
              </svg>
              Receive
            </button>
            <button class="action-btn">
              <svg class="action-icon" viewBox="0 0 24 24">
                <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
              </svg>
              Swap
            </button>
            <button class="action-btn">
              <svg class="action-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
              Buy
            </button>
            <button class="action-btn">
              <svg class="action-icon" viewBox="0 0 24 24">
                <path d="M16 17V5H4v2h10v10h2zm2 2H12V9h6V5h2v14z"/>
              </svg>
              Sell
            </button>
          </div>
        `;
      });
    }
  });
}

