// Create a unique identifier for this content script
const CONTENT_SCRIPT_ID = 'metamask-clone-content-script';

// Listen for messages from the page
window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) return;

  // Only accept messages that we know are ours
  if (event.data.type !== 'FROM_PAGE') return;

  // Add our identifier to the message
  const message = {
    ...event.data,
    source: CONTENT_SCRIPT_ID
  };

  // Forward the message to the extension
  chrome.runtime.sendMessage(message, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      return;
    }
    
    // Send the response back to the page
    window.postMessage({
      type: 'FROM_EXTENSION',
      source: CONTENT_SCRIPT_ID,
      ...response
    }, '*');
  });
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Only process messages from our extension
  if (message.source !== CONTENT_SCRIPT_ID) return;

  // Forward the message to the page
  window.postMessage({
    type: 'FROM_EXTENSION',
    source: CONTENT_SCRIPT_ID,
    ...message
  }, '*');
  
  // Send response back to extension
  sendResponse({ success: true });
  return true; // Keep the message channel open for async response
});

// Notify the page that the content script is loaded
window.postMessage({
  type: 'CONTENT_SCRIPT_LOADED',
  source: CONTENT_SCRIPT_ID
}, '*'); 