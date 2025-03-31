// Background Service Worker
let walletState = {
  isUnlocked: false,
  isAuthenticated: false,
  accounts: [],
  currentUser: null,
  balance: '0.00'
};

let registeredUsers = {};

// Initialize from storage
chrome.storage.local.get(['walletState', 'registeredUsers'], (result) => {
  walletState = result.walletState || walletState;
  registeredUsers = result.registeredUsers || {};
});

// Save states to storage
function saveState() {
  chrome.storage.local.set({ walletState });
}

function saveUsers() {
  chrome.storage.local.set({ registeredUsers });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "register":
      handleRegistration(request, sendResponse);
      return true;

    case "authenticate":
      handleAuthentication(request, sendResponse);
      return true;

    case "checkUser":
      checkUserExists(request, sendResponse);
      return true;

    case "getAuthStatus":
      sendResponse({ 
        authenticated: walletState.isAuthenticated,
        email: walletState.currentUser
      });
      return true;

    case "connect":
      handleConnect(sendResponse);
      return true;

    case "disconnect":
      handleDisconnect(sendResponse);
      return true;

    case "lock":
      handleLock(sendResponse);
      return true;

    default:
      sendResponse({ error: "Unknown action" });
      return true;
  }
});

function handleRegistration(request, sendResponse) {
  const { email, password, confirm } = request; // Get confirm from request
  
  if (registeredUsers[email]) {
    sendResponse({ success: false, error: "User exists" });
    return;
  }

  if (password !== confirm) { // Compare directly from request
    sendResponse({ success: false, error: "Password mismatch" });
    return;
  }

  // Registration logic
  registeredUsers[email] = {
    email,
    password, // Remember to hash in production!
    createdAt: new Date().toISOString()
  };

  walletState.isAuthenticated = true;
  walletState.currentUser = email;
  
  saveUsers();
  saveState();
  sendResponse({ success: true });
}

function handleAuthentication(request, sendResponse) {
  const { email, password } = request;
  const user = registeredUsers[email];

  if (!user) {
    sendResponse({ success: false, error: "User not found" });
    return;
  }

  if (user.password !== password) {
    sendResponse({ success: false, error: "Invalid password" });
    return;
  }

  walletState.isAuthenticated = true;
  walletState.currentUser = email;
  saveState();
  sendResponse({ success: true });
}

function checkUserExists(request, sendResponse) {
  sendResponse({ exists: !!registeredUsers[request.email] });
}

function handleConnect(sendResponse) {
  if (!walletState.isAuthenticated) {
    sendResponse({ success: false, error: "Not authenticated" });
    return;
  }

  walletState.isUnlocked = true;
  walletState.accounts = ['0x123...abc']; // Replace with real wallet logic
  saveState();
  sendResponse({
    success: true,
    accounts: walletState.accounts,
    balance: walletState.balance
  });
}

function handleDisconnect(sendResponse) {
  walletState.isUnlocked = false;
  walletState.accounts = [];
  walletState.balance = '0.00';
  saveState();
  sendResponse({ success: true });
}

function handleLock(sendResponse) {
  walletState.isUnlocked = false;
  walletState.isAuthenticated = false;
  walletState.currentUser = null;
  walletState.accounts = [];
  walletState.balance = '0.00';
  saveState();
  sendResponse({ success: true });
}