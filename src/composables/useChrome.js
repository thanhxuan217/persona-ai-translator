import { ref, onMounted, onUnmounted } from 'vue'

/**
 * useChrome - Listens for text selection messages from content script / background
 */
export function useChrome() {
  const pendingTranslation = ref(null)

  let messageListener = null
  let storageListener = null

  function handleIncoming(data) {
    if (data && data.selectedText) {
      pendingTranslation.value = {
        selectedText: data.selectedText,
        contextText: data.contextText || '',
        pageUrl: data.pageUrl || '',
        pageTitle: data.pageTitle || '',
        autoTranslate: data.autoTranslate || false,
        timestamp: Date.now()
      }
    }
  }

  onMounted(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) return

    // Listen for direct messages
    messageListener = (message) => {
      if (message.type === 'TEXT_SELECTED') {
        handleIncoming(message)
      }
    }
    chrome.runtime.onMessage.addListener(messageListener)

    // Listen for storage changes (from background)
    storageListener = (changes, area) => {
      if (area === 'session' && changes.pendingTranslation?.newValue) {
        handleIncoming(changes.pendingTranslation.newValue)
        // Clear after reading
        chrome.storage.session.remove('pendingTranslation')
      }
    }
    chrome.storage.onChanged.addListener(storageListener)

    // Check for existing pending translation on mount
    chrome.storage.session?.get('pendingTranslation', (result) => {
      if (result?.pendingTranslation) {
        handleIncoming(result.pendingTranslation)
        chrome.storage.session.remove('pendingTranslation')
      }
    })
  })

  onUnmounted(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) return
    if (messageListener) chrome.runtime.onMessage.removeListener(messageListener)
    if (storageListener) chrome.storage.onChanged.removeListener(storageListener)
  })

  function clearPending() {
    pendingTranslation.value = null
  }

  return {
    pendingTranslation,
    clearPending
  }
}
