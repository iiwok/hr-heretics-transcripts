// Background service worker for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'capture-insight') {
        // Open popup when keyboard shortcut is pressed
        chrome.action.openPopup();
    }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('HR Insights Capture extension installed!');
});
