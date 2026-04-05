/* Ollama Persona Agent - Service Worker (Background) */

// Open side panel when extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate-with-persona',
    title: 'Dịch với Persona Agent',
    contexts: ['selection']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'translate-with-persona' && info.selectionText) {
    // Store pending translation
    await chrome.storage.session.set({
      pendingTranslation: {
        selectedText: info.selectionText,
        contextText: '',
        pageUrl: tab.url || '',
        pageTitle: tab.title || '',
        autoTranslate: true
      }
    });

    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Relay messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEXT_SELECTED' && message.selectedText) {
    // Store for side panel to pick up
    chrome.storage.session.set({
      pendingTranslation: {
        selectedText: message.selectedText,
        contextText: message.contextText || '',
        pageUrl: message.pageUrl || '',
        pageTitle: message.pageTitle || '',
        autoTranslate: message.autoTranslate || false
      }
    });

    // Try to open side panel
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {});
    }
  }
  return false;
});
