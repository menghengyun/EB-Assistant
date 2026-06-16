// Notion Content Script
const performSearch = async (sku: string) => {
  console.log(`[Typhon] Attempting to search for: ${sku}`);

  // 1. Wait for Notion's core to load
  let attempts = 0;
  while (attempts < 10) {
    const databaseContainer = document.querySelector('.notion-scroller');
    if (databaseContainer) break;
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
  }

  // 2. Look for the search button/input
  // Notion's search in databases is often a button with an svg icon
  const tryTriggerSearch = async () => {
    // Try to find an input first
    let searchInput = document.querySelector('input[placeholder*="Search"], .notion-record-search-input input') as HTMLInputElement;

    if (!searchInput) {
      // Look for the "Search" button in the database header
      const searchButton = Array.from(document.querySelectorAll('div[role="button"]'))
        .find(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text === 'search' || el.querySelector('svg.search');
        }) as HTMLElement;
      
      if (searchButton) {
        searchButton.click();
        await new Promise(r => setTimeout(r, 500));
        searchInput = document.querySelector('input[placeholder*="Search"], .notion-record-search-input input') as HTMLInputElement;
      }
    }

    if (searchInput) {
      searchInput.focus();
      // Use execCommand for better compatibility with React-based inputs
      document.execCommand('insertText', false, sku);
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return true;
    }
    return false;
  };

  const searchSuccess = await tryTriggerSearch();
  if (searchSuccess) {
    console.log(`[Typhon] Search initiated for ${sku}`);
    setupHighlightObserver(sku);
  } else {
    // Fallback: If we can't search, at least try to highlight what's visible
    console.warn('[Typhon] Could not trigger search, attempting direct highlight');
    highlightResults(sku);
    setupHighlightObserver(sku);
  }
};

const setupHighlightObserver = (sku: string) => {
  const observer = new MutationObserver((mutations) => {
    highlightResults(sku);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Stop observing after 10 seconds to save performance
  setTimeout(() => observer.disconnect(), 10000);
};

const highlightResults = (sku: string) => {
  // Broad search for SKU text in common Notion cell containers
  const possibleElements = Array.from(document.querySelectorAll('.notion-table-view-cell, .notion-list-item, [data-block-id] span, div[contenteditable="false"]')) as HTMLElement[];
  
  possibleElements.forEach((el: HTMLElement) => {
    if (el.textContent?.trim() === sku && !el.dataset.typhonHighlighted) {
      console.log(`[Typhon] Found SKU match: ${sku}`);
      
      // Mark as highlighted to avoid repeat logic
      el.dataset.typhonHighlighted = 'true';

      // Find the row or parent container to highlight
      const row = el.closest('.notion-selectable, tr, .notion-list-item') as HTMLElement || el;
      
      row.style.outline = '4px solid #3b82f6';
      row.style.outlineOffset = '-2px';
      row.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
      row.style.transition = 'all 0.3s ease-in-out';
      row.style.zIndex = '10';
      row.style.position = 'relative';
      
      // Scroll into view
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash effect
      let count = 0;
      const interval = setInterval(() => {
        row.style.outlineColor = count % 2 === 0 ? 'transparent' : '#3b82f6';
        count++;
        if (count > 6) {
          clearInterval(interval);
          row.style.outlineColor = '#3b82f6';
        }
      }, 250);
    }
  });
};

// Start logic
chrome.storage.local.get(['pendingSearch'], (result) => {
  if (result.pendingSearch) {
    performSearch(result.pendingSearch);
    // Keep SKU in storage for a few seconds to handle both split windows
    setTimeout(() => {
      chrome.storage.local.remove('pendingSearch');
    }, 8000);
  }
});
