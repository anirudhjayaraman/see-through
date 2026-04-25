// contentScript.js - Improved Extraction for Demo Quality

/**
 * Extracts visible text from the page, prioritizing content and avoiding UI noise.
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
    // Capture only the first prominent post description to avoid overwhelming the AI
    const posts = document.querySelectorAll('.feed-shared-update-v2__description-wrapper, .feed-shared-text, .update-components-text');
    if (posts.length > 0) {
      // Prioritize the first one clearly visible
      text = posts[0].innerText.trim();
    }
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    type = 'x_post';
    // Capture only the primary tweet
    const tweets = document.querySelectorAll('[data-testid="tweetText"]');
    if (tweets.length > 0) {
      text = tweets[0].innerText.trim();
    }
  }

  // Fallback / Generic marketing page extraction
  if (!text) {
    // Focus on main content area if available
    const mainArea = document.querySelector('main, article, [role="main"], .main-content, #main-content');
    const root = mainArea || document.body;

    const clone = root.cloneNode(true);
    
    // Scour common UI junk
    const noiseSelectors = [
      'nav', 'footer', 'header', 'aside', '.sidebar', '.menu', '.nav', '.footer',
      'script', 'style', 'iframe', 'noscript', 
      '.ads', '.ad-unit', '.social-share', '.cookie-banner', '.promo',
      '.related-posts', '.comments-section', '#comments'
    ];
    
    noiseSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Heuristically find blocks of text (paragraphs, headings)
    const blocks = clone.querySelectorAll('p, h1, h2, h3, h4, li');
    text = Array.from(blocks)
      .map(b => b.innerText.trim())
      .filter(t => t.length > 20) // Filter out tiny snippets (buttons, dates, etc)
      .join('\n\n');
  }

  // Final fallback to just innerText if everything else failed
  if (!text.trim()) {
    text = document.body.innerText;
  }

  // Smart truncation: keep the first 12k characters
  const maxLength = 12000;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '\n\n[...Content truncated for analysis performance...]';
  }

  return {
    type: type,
    content: text.trim(),
    title: document.title,
    url: window.location.href
  };
}

// Ensure the listener is only added once
if (!window.hypeDetectorBound) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extract_content') {
      const data = extractPageContent();
      sendResponse(data);
    }
    return true;
  });
  window.hypeDetectorBound = true;
}
