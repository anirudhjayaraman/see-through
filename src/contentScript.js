// contentScript.js

/**
 * Extracts visible text from the page, avoiding noise like menus and footers.
 */
function extractPageContent() {
  const selection = window.getSelection().toString();
  if (selection && selection.trim().length > 0) {
    return {
      type: 'selection',
      content: selection.trim()
    };
  }

  const hostname = window.location.hostname;
  let text = '';
  let type = 'generic';

  if (hostname.includes('linkedin.com')) {
    type = 'linkedin_post';
    // Attempt to find LinkedIn post content
    const postElements = document.querySelectorAll('.feed-shared-update-v2__description, .feed-shared-text');
    if (postElements.length > 0) {
      text = Array.from(postElements).map(el => el.innerText).join('\n\n');
    }
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    type = 'x_post';
    // Attempt to find X/Twitter tweet content
    const tweetElements = document.querySelectorAll('[data-testid="tweetText"]');
    if (tweetElements.length > 0) {
      text = Array.from(tweetElements).map(el => el.innerText).join('\n\n');
    }
  }

  // Fallback to generic extraction if site-specific fails or isn't applicable
  if (!text) {
    // Basic heuristics: headlines, paragraphs, etc.
    const mainContent = document.querySelector('main, article, #content, .content');
    const root = mainContent || document.body;
    
    // Clean up unwanted elements before extracting
    const clones = root.cloneNode(true);
    const selectorsToRemove = 'nav, footer, script, style, .sidebar, .ads, .menu, .nav, footer, #footer, .cookie-banner';
    clones.querySelectorAll(selectorsToRemove).forEach(el => el.remove());
    
    text = clones.innerText;
  }

  // Limit text length to avoid token issues (truncating to ~10k chars)
  const maxLength = 10000;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '... [Content truncated]';
  }

  return {
    type: type,
    content: text.trim(),
    title: document.title,
    url: window.location.href
  };
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_content') {
    const data = extractPageContent();
    sendResponse(data);
  }
  return true;
});
