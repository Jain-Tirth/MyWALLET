// Listen for messages from the webpage
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  // Only accept messages that start with REACTCONNECT_
  if (!event.data.type?.startsWith('REACTCONNECT_')) return;

  // Forward the message to the background script
  chrome.runtime.sendMessage(
    {
      action: event.data.action.toLowerCase(),
      data: event.data.data
    },
    (response) => {
      if (chrome.runtime.lastError) {
        // Handle error case
        window.postMessage(
          {
            type: 'REACTCONNECT_RESPONSE',
            success: false,
            error: 'Extension not available'
          },
          '*'
        );
      } else {
        // Forward the response back to the webpage
        window.postMessage(
          {
            type: 'REACTCONNECT_RESPONSE',
            ...response
          },
          '*'
        );
      }
    }
  );
});