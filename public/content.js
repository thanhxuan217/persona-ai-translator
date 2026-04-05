/* Ollama Persona Agent - Content Script */

(() => {
  let lastSelection = '';
  let debounceTimer = null;

  document.addEventListener('mouseup', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || '';

      // Only send if meaningful selection (> 2 chars) and different from last
      if (selectedText.length > 2 && selectedText !== lastSelection) {
        lastSelection = selectedText;

        // Get context from parent element
        let contextText = '';
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const ancestor = range.commonAncestorContainer;
          const parentEl = ancestor.nodeType === Node.TEXT_NODE
            ? ancestor.parentElement
            : ancestor;

          if (parentEl) {
            // Walk up to find a substantial parent
            let ctx = parentEl;
            while (ctx && ctx.innerText && ctx.innerText.length < 50 && ctx.parentElement) {
              ctx = ctx.parentElement;
            }
            contextText = (ctx?.innerText || '').substring(0, 500);
          }
        }

        // Send to background / side panel
        chrome.runtime.sendMessage({
          type: 'TEXT_SELECTED',
          selectedText,
          contextText,
          pageUrl: window.location.href,
          pageTitle: document.title,
          autoTranslate: false
        }).catch(() => {
          // Extension context may be invalidated, ignore
        });
      }
    }, 200);
  });

  // Clear last selection when user clicks without selecting
  document.addEventListener('mousedown', () => {
    // Reset after a short delay to allow new selections
    setTimeout(() => {
      const current = window.getSelection()?.toString().trim() || '';
      if (current.length === 0) {
        lastSelection = '';
      }
    }, 50);
  });
})();
