// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'WALLET_DATA') {
        // Forward the wallet data to the React app
        window.postMessage({
            type: 'EXTENSION_WALLET_DATA',
            wallet: message.wallet
        }, '*');
    }
});

// Listen for messages from the React app
window.addEventListener('message', (event) => {
    if (event.data.type === 'GET_WALLET_DATA') {
        // Get wallet data from extension storage
        chrome.storage.local.get(['userWallet'], function(result) {
            if (result.userWallet) {
                // Send wallet data back to React app
                window.postMessage({
                    type: 'WALLET_DATA_RESPONSE',
                    wallet: result.userWallet
                }, '*');
            }
        });
    }
}); 