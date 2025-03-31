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

function handler() {
    document.getElementById("transfer_center").style.display = "flex";

    const amount = document.getElementById("amout").value
    const address = document.getElementById("address").value;

    const privateKey = "bbeb0c47211b1926302183ee90917c7b055d479035e08183c550ade280a87528";

    const testAccount = ""; // I'l take this from pratham metamask account.

    // Provider

    const provider = new ethers.providers.JsonRpcProvider(providerURL);

    let wallet = new ethers.Wallet(privateKey, provider);

    const tx = { to: address, value: ethers.utils.parseEther(amount) }; let a = document.getElementById("link");

    a.href = "somelink url";

    wallet.sendTransaction(tx).then((res) => {
        console.log("txHASH: ", txObj.hash);
        document.getElementById("transfer_center").style.display = "none";
        const a = document.getElementById("link");
        document.getElementById("link").href = "https://etherscan.io/tx/" + txObj.hash;

        document.getElementById("link").style.display = "block";
    })

};

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
            localStorage.setItem("userWallet", JSON.stringify(userWallet));
        }

        document.getElementById("login_form").style.display = "none";
        document.getElementById("center").style.display = "block";
        window.location.reload();
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


function addToken() {
    const address = document.getElementById("token_address").value;
    const name = document.getElementById("token_name").value;
    const symbol = document.getElementById("token_symbol").value;

    // API call 
    const url = "https://localhost:3000/api/v1/tokens/createToken";
    const data = {
        address: address,
        name: name,
        symbol: symbol
    }
    fetch(url, {
        method: "POST",
        handler: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
    }).then(response => response.json()).then((result) => {
        console.log(result);
        window.location.reload();
    }).catch(error => {
        console.error("Error:", error);
    });
};

function addAccount() {
    const privateKey = document.getElementById("private_key").value;
    const provider = new ethers.providers.JsonRpcProvider(providerURL);
    // const address = document.getElementById("address").value;
    // const mnemonic = document.getElementById("mnemonic").value;
    let wallet = new ethers.wallet(privateKey, provider);
    console.log(wallet);
    const url = "https://localhost:3000/api/v1/account/createAccount";
    const data = {
        privateKey: privateKey,
        address: wallet.address,

    }
    fetch(url, {
        method: "POST",
        handler: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
    }).then(response => response.json()).then((result) => {
        console.log(result);
        window.location.reload();
    }).catch(error => {
        console.error("Error:", error);
    });

};

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