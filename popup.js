const ethers = require("ethers");
const { Client, Account, Databases, ID } = require('appwrite');
const appwriteConfig = require('./config');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

const account = new Account(client);
const databases = new Databases(client);

document.addEventListener("DOMContentLoaded", function () {
    // Here we are going to target the elements.
    document.getElementById("accountList")
        .addEventListener("click", changeAccount);

    document.getElementById("userAddress")
        .addEventListener("click", copyAddress);

    document.getElementById("transferFund")
        .addEventListener("click", handler);

    document.getElementById("header_network")
        .addEventListener("click", getOpenNetwork);

    document.getElementById("network_item")
        .addEventListener("click", getSelectedNetwork);

    document.getElementById("loginAccount").addEventListener("click", loginUser);

    document.getElementById("accountCreate").addEventListener("click", loginUser);

    document.getElementById("openCreate").
        addEventListener("click", "openCreate");

    document.getElementById("sing_up").
        addEventListener("click", signUp);

    document.getElementById("login_up").addEventListener("click", login);

    document.getElementById("logout")
        .addEventListener("click", logOut);

    document.getElementById("open_transfer")
        .addEventListener("click", openTransfer);

    document.getElementById("goBack")
        .addEventListener("click", goBack);


    document.getElementById("openImport")
        .addEventListener("click", openImport);

    document.getElementById("open_assets")
        .addEventListener("click", openAssets);

    document.getElementById("open_activity")
        .addEventListener("click", openActivity);

    document.getElementById("goHomePage")
        .addEventListener("click", goHomePage);

    document.getElementById("signIn")
        .addEventListener("click", signIn);

    document.getElementById("openAccountImport")
        .addEventListener("click", openAccountImport);

    document.getElementById("closeImportModel")
        .addEventListener("click", closeImportModel);

    document.getElementById("addToken")
        .addEventListener("click", addToken);

    document.getElementById("add_new_account")
        .addEventListener("click", addAccount);

})

// STATE variable
let providerURL = 'https://polygon-mainnet.g.alchemy.com/v2/Ehy7CTcYB56jUEqQRp9hbfG8rI4Z5xJk';

let provider;
let privateKey;
let address;

async function handler() {
    try {
        const amount = document.getElementById("amout").value;
        const address = document.getElementById("address").value;
        const privateKey = "bbeb0c47211b1926302183ee90917c7b055d479035e08183c550ade280a87528";

        // Store transaction data in Appwrite
        await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_TRANSACTIONS_COLLECTION_ID',
            ID.unique(),
            {
                type: 'send',
                from: address,
                to: address,
                amount: amount,
                network: 'polygon',
                status: 'pending',
                timestamp: new Date().toISOString()
            }
        );

        // Navigate to React app for transaction
        chrome.tabs.create({
            url: 'http://localhost:3000?action=send&amount=' + amount + '&address=' + address
        });

        window.close();
    } catch (error) {
        console.error("Error in handler:", error);
        alert("Error processing transaction");
    }
}

function checkBalanace(address) {
    const provider = new ethers.providers.JsonRpcProvider(providerURL);

    provider.getBalance(address).then((balance) => {
        const balanceInEth = ethers.utils.formatEther(balance);
        document.getElementById("accountBalance").innerHTML = `${balanceInEth} MATIC`;

        document.getElementById("userAddress").innerHTML = `${address.slice(0, 15)}`;
        // console.log("Balance: ", ethers.utils.formatEther(balance));
    })
}

function getOpenNetwork() {
    document.getElementById("network").style.display = "block";

};

function getSelectedNetwork(e) {
    const element = document.getElementById("selected_network").element.innerHTML = e.target.innerHTML;

    if (e.target.innerHTML === "Etherium Mainnet") {
        providerURL = "https://eth-mainnet.g.alchemy.com/v2/Ehy7CTcYB56jUEqQRp9hbfG8rI4Z5xJk";
        document.getElementById("network").style.display = "none";
    }
    else if (e.target.innerHTML === "Polygon Mainnet") {
        providerURL = "https://polygon-mainnet.g.alchemy.com/v2/Ehy7CTcYB56jUEqQRp9hbfG8rI4Z5xJk";
        document.getElementById("network").style.display = "none";
    }

    else if (e.target.innerHTML === "Arbitrum Mainnet") {
        providerURL = "https://arb-mainnet.g.alchemy.com/v2/Ehy7CTcYB56jUEqQRp9hbfG8rI4Z5xJk";
        document.getElementById("network").style.display = "none";
    }
    else if (e.target.innerHTML === "Solana Mainnet") {
        providerURL = "https://solana-mainnet.g.alchemy.com/v2/Ehy7CTcYB56jUEqQRp9hbfG8rI4Z5xJk";
        document.getElementById("network").style.display = "none";
    }
    console.log(providerURL);
};

function setNetwork() {
    document.getElementById("network").style.display = "none";
};

function loginUser() {
    document.getElementById("LoginUser").style.display = "none";
    document.getElementById("createAccount").style.display = "none";
};

function createUser() {
    document.getElementById("LoginUser").style.display = "block";
    document.getElementById("createAccount").style.display = "block";
};

function openCreate() {
    document.getElementById("createAccount").style.display = "none";
    document.getElementById("create_popup").style.display = "block";
};

async function signUp() {
    try {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        document.getElementById("field").style.display = "none";
        document.getElementById("center").style.display = "none";

        const wallet = ethers.Wallet.createRandom();
        
        // Create user account in Appwrite
        const userAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        // Store user data in Appwrite database
        await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_USERS_COLLECTION_ID',
            ID.unique(),
            {
                name: name,
                email: email,
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase
            }
        );

        // Display wallet information
        document.getElementById("createAddress").innerHTML = wallet.address;
        document.getElementById("createPrivateKey").innerHTML = wallet.privateKey;
        document.getElementById("createMnemonic").innerHTML = wallet.mnemonic.phrase;

        document.getElementById("center").style.display = "none";
        document.getElementById("accountData").style.display = "block";

        // Store wallet info in localStorage
        const userWallet = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic.phrase
        };
        localStorage.setItem("userWallet", JSON.stringify(userWallet));

        document.getElementById("goHomePage").style.display = "block";
        window.location.reload();
    } catch (error) {
        console.error("Error during signup:", error);
        alert("Error during signup. Please try again.");
    }
}

async function login() {
    try {
        const email = document.getElementById("login_email").value;
        const password = document.getElementById("login_password").value;

        // Create session with Appwrite
        const session = await account.createEmailSession(email, password);
        
        // Get user data from Appwrite database
        const userDoc = await databases.listDocuments(
            'YOUR_DATABASE_ID',
            'YOUR_USERS_COLLECTION_ID',
            [databases.queries.equal('email', email)]
        );

        if (userDoc.documents.length > 0) {
            const userData = userDoc.documents[0];
            const userWallet = {
                address: userData.address,
                privateKey: userData.privateKey,
                mnemonic: userData.mnemonic
            };
            
            // Store wallet data in extension storage
            chrome.storage.local.set({ userWallet: userWallet }, function() {
                console.log('Wallet data saved to extension storage');
            });

            // Send message to React app
            chrome.tabs.query({url: 'http://localhost:3000/*'}, function(tabs) {
                if (tabs.length > 0) {
                    // If React app is open, send message to it
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'WALLET_DATA',
                        wallet: userWallet
                    });
                } else {
                    // If React app is not open, open it in a new tab
                    chrome.tabs.create({
                        url: 'http://localhost:3000'
                    });
                }
            });

            // Close the popup
            window.close();
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("Invalid email or password");
    }
}

async function logOut() {
    try {
        await account.deleteSession('current');
        localStorage.removeItem("userWallet");
        window.location.reload();
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

function openTransfer() {
    document.getElementById("transfer_from").style.display = "block";
    document.getElementById("home").style.display = "none";
};

function goBack() {
    document.getElementById("transfer_from").style.display = "none";
    document.getElementById("home").style.display = "block";
};

function openImport() {
    document.getElementById("import_token").style.display = "block";
    document.getElementById("home").style.display = "none";
};

function importGoBack() {
    document.getElementById("import_token").style.display = "none";
    document.getElementById("home").style.display = "block";
};

function openActivity() {
    document.getElementById("activity").style.display = "block";
    document.getElementById("assets").style.display = "none";
};


function openAssets() {
    document.getElementById("activity").style.display = "none";
    document.getElementById("assets").style.display = "block";
};

function goHomePage() {
    document.getElementById("home").style.display = "block";
    document.getElementById("create_popup").style.display = "none";
};

function openImportModel() {
    document.getElementById("import_assets").style.display = "block";
    document.getElementById("home").style.display = "none";
};

function closeImportModel() {
    document.getElementById("import_assets").style.display = "none";
    document.getElementById("home").style.display = "block";
};


async function addToken() {
    try {
        const address = document.getElementById("token_address").value;
        const name = document.getElementById("token_name").value;
        const symbol = document.getElementById("token_symbol").value;

        // Store token data in Appwrite
        await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_TOKENS_COLLECTION_ID',
            ID.unique(),
            {
                address: address,
                name: name,
                symbol: symbol,
                timestamp: new Date().toISOString()
            }
        );

        // Navigate to React app for token management
        chrome.tabs.create({
            url: 'http://localhost:3000?action=tokens'
        });

        window.close();
    } catch (error) {
        console.error("Error adding token:", error);
        alert("Error adding token");
    }
}

async function addAccount() {
    try {
        const privateKey = document.getElementById("private_key").value;
        const provider = new ethers.providers.JsonRpcProvider(providerURL);
        let wallet = new ethers.Wallet(privateKey, provider);

        // Store account data in Appwrite
        await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_ACCOUNTS_COLLECTION_ID',
            ID.unique(),
            {
                address: wallet.address,
                privateKey: privateKey,
                network: 'polygon',
                timestamp: new Date().toISOString()
            }
        );

        // Navigate to React app for account management
        chrome.tabs.create({
            url: 'http://localhost:3000?action=accounts'
        });

        window.close();
    } catch (error) {
        console.error("Error adding account:", error);
        alert("Error adding account");
    }
}

function myFunction() {
    const str = localStorage.getItem("userWallet");
    const parsedObj = JSON.parse(str);

    if (parsedObj.address) {
        document.getElementById("LoginUser").style.display = "none";
        document.getElementById("home").style.display = "block";
    }
    privateKey = parsedObj.privateKey;
    address = parsedObj.address;
    checkBalanace(parsedObj.address);
    const tokenRender = document.querySelector(".assets");
    const accountRender = document.querySelector(".accountList");
    const url = "https://localhost:3000/api/v1/tokens/allToken";
    fetch(url).then(response => response.json()).then((result) => {
        let elements = "";
        result.data.token.map((token) => {
            elements += `
                <div class="assets_item">
                    <img src="./assets/theblockchaincoders.png" class="assets_item_img"
                     alt="${token.name}">
                    <span>${token.address.slice(0, 15)}...</span>
                    <span>${token.symbol}</span>
                </div>
            `;
            tokenRender.innerHTML = elements;
        });
    }).catch(error => {
        console.error("Error:", error);
    });

    fetch("https://localhost:3000/api/v1/account/allAccount").then(response => response.json()).then((data) => {
        let accounts = "";
        data.data.account.map((account, i) => {
            accounts += `
                <div class="lists">
                    <p> ${i + 1} </p>
                    <p class="accountValue" data-address="${account.address}" data-privateKey="${account.privateKey}">${account.address.slice(0, 25)}...</p>
                </div>
            `;
            accountRender.innerHTML = accounts;
        });
    }).catch(error => {
        console.error("Error:", error);
    });
}

function copyAddress() { 
    navigator.clipboard.writeText(address);
};

function changeAccount() {
    const data = document.querySelector(".accountValue");
    const address = data.getAttribute("data-address");
    const privateKey = data.getAttribute("data-privateKey");
    const userWallet = {
        address: address,
        private_key: privateKey,
        mnemonic: "Changed",
    }
    const jsonObj = JSON.stringify(userWallet);
    localStorage.setItem("userWallet", jsonObj);
    window.location.reload();
 };

window.onload = myFunction;

// Add new function for handling swap
async function handleSwap() {
    try {
        // Store swap data in Appwrite
        await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_SWAPS_COLLECTION_ID',
            ID.unique(),
            {
                type: 'swap',
                status: 'pending',
                timestamp: new Date().toISOString()
            }
        );

        // Navigate to React app for swap
        chrome.tabs.create({
            url: 'http://localhost:3000?action=swap'
        });

        window.close();
    } catch (error) {
        console.error("Error in swap:", error);
        alert("Error processing swap");
    }
}

// Add new function for handling buy/sell
async function handleTrade(action) {
    try {
        // Store trade data in Appwrite
        await databases.createDocument(
            'YOUR_DATABASE_ID',
            'YOUR_TRADES_COLLECTION_ID',
            ID.unique(),
            {
                type: action,
                status: 'pending',
                timestamp: new Date().toISOString()
            }
        );

        // Navigate to React app for trading
        chrome.tabs.create({
            url: `http://localhost:3000?action=${action}`
        });

        window.close();
    } catch (error) {
        console.error("Error in trade:", error);
        alert("Error processing trade");
    }
}

(() => {
    // Get DOM elements
    const authForms = document.getElementById("auth-forms");
    const accountInfo = document.getElementById("account-info");
    const lockBtn = document.getElementById("lock-btn");
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");

    // Function to reset the UI to initial state
    function resetUI() {
        authForms.style.display = "block";
        accountInfo.style.display = "none";
        lockBtn.style.display = "none";
        signinForm.style.display = "block";
        signupForm.style.display = "none";

        // Clear form inputs
        document.getElementById("signin-email").value = "";
        document.getElementById("signin-password").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-password").value = "";
        document.getElementById("signup-confirm").value = "";

        // Clear extension storage
        chrome.storage.local.clear(() => {
            console.log("All states cleared");
        });
    }

    // Function to display account information and wallet interface
    function displayAccountInfo() {
        authForms.style.display = "none";
        accountInfo.style.display = "block";
        lockBtn.style.display = "block";

        // Connect to wallet
        chrome.runtime.sendMessage({ action: "connect" }, (response) => {
            if (response.success) {
                // Get authentication status
                chrome.runtime.sendMessage({ action: "getAuthStatus" }, (authStatus) => {
                    const userEmail = authStatus.email;
                    
                    // Update account info HTML
                    document.getElementById("account-info").innerHTML = `
                        <div class="user-info">
                            <p>Logged in as: ${userEmail}</p>
                            <p>Connected: ${response.accounts[0].slice(0,6)}...${response.accounts[0].slice(-4)}</p>
                        </div>
                        <div class="wallet-header">
                            <div class="network-indicator">Ethereum Mainnet</div>
                            <div class="balance">0.00 ETH</div>
                        </div>
                        
                        <div class="action-grid">
                            <button class="action-btn" id="send-btn">
                                <svg class="action-icon" viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                                Send
                            </button>
                            <button class="action-btn" id="receive-btn">
                                <svg class="action-icon" viewBox="0 0 24 24">
                                    <path d="M22 12l-4-4v3H3v2h15v3z"/>
                                </svg>
                                Receive
                            </button>
                            <button class="action-btn" id="swap-btn">
                                <svg class="action-icon" viewBox="0 0 24 24">
                                    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
                                </svg>
                                Swap
                            </button>
                            <button class="action-btn" id="buy-btn">
                                <svg class="action-icon" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                                </svg>
                                Buy
                            </button>
                            <button class="action-btn" id="sell-btn">
                                <svg class="action-icon" viewBox="0 0 24 24">
                                    <path d="M16 17V5H4v2h10v10h2zm2 2H12V9h6V5h2v14z"/>
                                </svg>
                                Sell
                            </button>
                        </div>
                    `;

                    // Add event listeners for action buttons
                    setupActionButtons(response.accounts[0]);
                });
            }
        });
    }

    // Function to handle authentication (sign in/register)
    function handleAuth(action) {
        const emailInput = document.getElementById(`${action === "register" ? "signup" : "signin"}-email`);
        const passwordInput = document.getElementById(`${action === "register" ? "signup" : "signin"}-password`);
        const email = emailInput.value;
        const password = passwordInput.value;

        if (validateEmail(email) && validatePassword(password)) {
            if (action === "register" && password !== document.getElementById("signup-confirm").value) {
                alert("Passwords don't match!");
                return;
            }

            chrome.runtime.sendMessage({ action, email, password }, (response) => {
                if (response.success) {
                    displayAccountInfo();
                } else if (action === "authenticate") {
                    if (response.error === "User not found") {
                        alert("Account not found. Please sign up first.");
                        signinForm.style.display = "none";
                        signupForm.style.display = "block";
                    } else if (response.error === "Invalid password") {
                        alert("Incorrect password. Please try again.");
                    }
                } else if (action === "register" && response.error === "User exists") {
                    alert("Account already exists. Please sign in instead.");
                    signupForm.style.display = "none";
                    signinForm.style.display = "block";
                }
            });
        }
    }

    // Email validation function
    function validateEmail(email) {
        const isValid = /^[^\s@]+@gmail\.com$/.test(email);
        if (!isValid) {
            alert("Please enter a valid Gmail address");
        }
        return isValid;
    }

    // Password validation function
    function validatePassword(password) {
        const isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
        if (!isValid) {
            alert("Password must contain:\n- 8+ characters\n- Uppercase letter\n- Lowercase letter\n- Number");
        }
        return isValid;
    }

    // Event Listeners
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

    document.getElementById("signin-btn").addEventListener("click", (e) => {
        e.preventDefault();
        handleAuth("authenticate");
    });

    document.getElementById("signup-btn").addEventListener("click", (e) => {
        e.preventDefault();
        handleAuth("register");
    });

    // Lock button event listener
    lockBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "disconnect" }, () => {
            chrome.runtime.sendMessage({ action: "lock" }, (response) => {
                if (response.success) {
                    resetUI();
                }
            });
        });
    });

    // Check authentication status on page load
    document.addEventListener("DOMContentLoaded", () => {
        chrome.runtime.sendMessage({ action: "getAuthStatus" }, (response) => {
            if (response.authenticated) {
                displayAccountInfo();
            } else {
                resetUI();
            }
        });
    });
})();