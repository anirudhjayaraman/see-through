// sidepanel.js
import { analyzeWithGemini } from './gemini.js';
import { SYSTEM_PROMPT, generateUserPrompt } from './prompts.js';
import { saveToHistory, downloadJSON, copyToClipboard, formatReport } from './utils.js';

const elements = {
  settingsSection: document.getElementById('settings-section'),
  controlsSection: document.getElementById('controls-section'),
  loadingSection: document.getElementById('loading-section'),
  errorSection: document.getElementById('error-section'),
  resultsSection: document.getElementById('results-section'),
  historySection: document.getElementById('history-section'),
  reasoningSection: document.getElementById('reasoning-section'),
  reasoningChain: document.getElementById('reasoning-chain'),
  
  aiPercentValue: document.getElementById('ai-percent-value'),
  varianceValue: document.getElementById('variance-value'),
  burstinessValue: document.getElementById('burstiness-value'),
  
  apiKeyInput: document.getElementById('api-key-input'),
  modelNameInput: document.getElementById('model-name-input'),
  saveSettingsBtn: document.getElementById('save-settings'),
  analyzeBtn: document.getElementById('analyze-btn'),
  retryBtn: document.getElementById('retry-btn'),
  reanalyzeBtn: document.getElementById('reanalyze-btn'),
  copyBtn: document.getElementById('copy-btn'),
  downloadBtn: document.getElementById('download-btn'),
  
  errorMessage: document.getElementById('error-message'),
  historyList: document.getElementById('history-list'),
  scoreRing: document.getElementById('score-ring'),
  scoreValue: document.getElementById('score-value'),
  verdictBanner: document.getElementById('verdict-banner'),
  verdictText: document.getElementById('verdict-text'),
  
  resultTitle: document.getElementById('result-title'),
  resultPageType: document.getElementById('result-page-type'),
  oneLineTake: document.getElementById('one-line-take'),
  
  contentCoreClaim: document.getElementById('content-core-claim'),
  contentEvidence: document.getElementById('content-evidence'),
  contentMissing: document.getElementById('content-missing'),
  contentBuzzwords: document.getElementById('content-buzzwords'),
  contentAssumptions: document.getElementById('content-assumptions'),
  contentQuestions: document.getElementById('content-questions')
};

let currentAnalysis = null;
let currentModel = "gemini-1.5-flash-latest"; 

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { apiKey, modelName } = await chrome.storage.local.get(['apiKey', 'modelName']);
    if (modelName) {
      currentModel = modelName;
      elements.modelNameInput.value = modelName;
    }
    if (apiKey) {
      elements.apiKeyInput.value = apiKey;
    }
    
    // If key is missing or suspiciously short, show settings
    // Reduced threshold to 4 to allow "DEMO" keyword
    if (!apiKey || apiKey.trim().length < 4) {
      showSection('settings');
    } else {
      showSection('controls');
      loadHistory();
    }
  } catch (err) {
    console.error('Initialization error:', err);
    showSection('settings'); 
  }
});

// Event Listeners
const settingsBtn = document.getElementById('open-settings-btn');
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    if (elements.settingsSection.classList.contains('hidden')) {
      showSection('settings');
    } else {
      showSection('controls');
      loadHistory();
    }
  });
}

const listModelsBtn = document.getElementById('list-models-btn');
const modelsListDisplay = document.getElementById('models-list-display');

if (listModelsBtn) {
  listModelsBtn.addEventListener('click', async () => {
    const key = elements.apiKeyInput.value.trim();
    if (!key || key.toUpperCase() === 'DEMO') {
      alert('Please enter a real API key to check models.');
      return;
    }
    
    listModelsBtn.textContent = 'Checking...';
    modelsListDisplay.classList.add('hidden');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await response.json();
      
      if (data.models) {
        const names = data.models
          .filter(m => m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
        
        modelsListDisplay.innerHTML = '<strong>Supports generation:</strong><br>' + names.join('<br>');
        modelsListDisplay.classList.remove('hidden');
      } else if (data.error) {
        modelsListDisplay.textContent = `Error: ${data.error.message}`;
        modelsListDisplay.classList.remove('hidden');
      }
    } catch (err) {
      modelsListDisplay.textContent = `Error: ${err.message}`;
      modelsListDisplay.classList.remove('hidden');
    } finally {
      listModelsBtn.textContent = 'Refresh Model List';
    }
  });
}

elements.saveSettingsBtn.addEventListener('click', async () => {
  const key = elements.apiKeyInput.value.trim();
  const model = elements.modelNameInput.value.trim();
  if (key && model) {
    await chrome.storage.local.set({ apiKey: key, modelName: model });
    currentModel = model;
    showSection('controls');
    loadHistory();
  } else {
    alert('Please enter a valid API key and model name.');
  }
});

elements.analyzeBtn.addEventListener('click', () => performAnalysis());
elements.retryBtn.addEventListener('click', () => performAnalysis());
elements.reanalyzeBtn.addEventListener('click', () => performAnalysis());

elements.copyBtn.addEventListener('click', () => {
  if (currentAnalysis) {
    const report = formatReport(currentAnalysis);
    copyToClipboard(report);
    elements.copyBtn.textContent = '✅ Copied';
    setTimeout(() => { elements.copyBtn.textContent = '📋 Copy'; }, 2000);
  }
});

elements.downloadBtn.addEventListener('click', () => {
  if (currentAnalysis) {
    downloadJSON(currentAnalysis, `analysis-${Date.now()}.json`);
  }
});

/**
 * Orchestrates the analysis process.
 */
async function performAnalysis() {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) {
    showSection('settings');
    return;
  }

  showSection('loading');

  try {
    // 1. Get content from current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) throw new Error('No active tab found.');

    // Inject content script manually if it's not a pre-declared site
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/contentScript.js']
      });
    } catch (e) {
      // Normal for pre-declared sites or sites where scripting isn't allowed
    }

    const pageData = await chrome.tabs.sendMessage(tab.id, { action: 'extract_content' });
    if (!pageData || !pageData.content) {
      throw new Error('Could not extract content. Try scrolling down or selecting text.');
    }

    let result;
    // Check for Demo Mode: Keyword "DEMO"
    if (apiKey.toUpperCase() === 'DEMO') {
      const { MOCK_RESPONSES } = await import('../test/mock_responses.js');
      result = MOCK_RESPONSES[pageData.type] || MOCK_RESPONSES.marketing_page;
      await new Promise(r => setTimeout(r, 1200));
    } else {
    // 2. Call Gemini
      const userPrompt = generateUserPrompt(pageData);
      
      // Setup reasoning UI
      elements.reasoningChain.innerHTML = '';
      showSection('reasoning'); // Show reasoning section during loading
      
      const onReasoningStep = (stepText) => {
        const stepEl = document.createElement('div');
        stepEl.className = 'reasoning-step';
        stepEl.textContent = stepText;
        elements.reasoningChain.appendChild(stepEl);
        elements.reasoningChain.scrollTop = elements.reasoningChain.scrollHeight;
      };

      result = await analyzeWithGemini(apiKey, currentModel, SYSTEM_PROMPT, userPrompt, onReasoningStep);
    }
    
    // 3. Display
    currentAnalysis = result;
    await saveToHistory(result);
    displayResults(result);
    loadHistory();
    showSection('results');
    
  } catch (err) {
    console.error('Analysis error:', err);
    let message = err.message;
    if (message.includes('Could not establish connection')) {
      message = 'Please refresh the webpage and try again to re-connect the detector.';
    }
    elements.errorMessage.textContent = message;
    showSection('error');
  }
}

/**
 * Renders the analysis results in the UI.
 */
function displayResults(data) {
  elements.resultTitle.textContent = data.title_or_post_hook || 'Page Analysis';
  elements.resultPageType.textContent = data.page_type.replace('_', ' ');
  elements.scoreValue.textContent = data.credibility_score;
  elements.verdictText.textContent = data.verdict;
  elements.oneLineTake.textContent = data.one_line_take;
  
  // Score styling
  elements.scoreRing.style.borderColor = getScoreColor(data.credibility_score);
  
  // Verdict styling
  elements.verdictBanner.className = `verdict-${data.verdict.replace(' ', '-')}`;
  
  // AI Metrics
  if (data.ai_detection_metrics) {
    elements.aiPercentValue.textContent = `${data.ai_detection_metrics.ai_probability_percent}%`;
    elements.varianceValue.textContent = data.ai_detection_metrics.sentence_variance;
    elements.burstinessValue.textContent = data.ai_detection_metrics.burstiness;
    
    // Color coding AI percent
    const aiProb = data.ai_detection_metrics.ai_probability_percent;
    if (aiProb >= 70) {
      elements.aiPercentValue.style.color = 'var(--error)';
    } else if (aiProb >= 40) {
      elements.aiPercentValue.style.color = 'var(--warning)';
    } else {
      elements.aiPercentValue.style.color = 'var(--success)';
    }
  } else {
    elements.aiPercentValue.textContent = 'N/A';
    elements.varianceValue.textContent = 'N/A';
    elements.burstinessValue.textContent = 'N/A';
  }
  
  // Content sections
  elements.contentCoreClaim.textContent = data.core_claim;
  
  renderList(elements.contentEvidence, data.evidence_present);
  renderList(elements.contentMissing, data.missing_evidence);
  renderList(elements.contentAssumptions, data.hidden_assumptions);
  renderList(elements.contentQuestions, data.skeptical_questions);
  
  // Buzzwords special rendering
  if (!data.buzzwords_detected || data.buzzwords_detected.length === 0) {
    elements.contentBuzzwords.innerHTML = '<ul><li>None detected.</li></ul>';
  } else {
    elements.contentBuzzwords.innerHTML = '<ul>' + data.buzzwords_detected.map(b => `
      <li class="buzzword-item" style="margin-bottom: 8px;">
        <strong>${b.term}</strong>: ${b.plain_english_meaning}
        <div style="font-size: 0.85em; color: var(--text-muted); margin-top: 2px;">${b.why_it_is_vague}</div>
      </li>
    `).join('') + '</ul>';
  }
}

/**
 * Navigates between different UI sections.
 */
function showSection(section) {
  elements.settingsSection.classList.add('hidden');
  elements.controlsSection.classList.add('hidden');
  elements.loadingSection.classList.add('hidden');
  elements.errorSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.reasoningSection.classList.add('hidden');
  
  if (section === 'settings') elements.settingsSection.classList.remove('hidden');
  if (section === 'controls') elements.controlsSection.classList.remove('hidden');
  if (section === 'loading') elements.loadingSection.classList.remove('hidden');
  if (section === 'reasoning') {
    elements.loadingSection.classList.remove('hidden');
    elements.reasoningSection.classList.remove('hidden');
  }
  if (section === 'error') {
    elements.errorSection.classList.remove('hidden');
    elements.reasoningSection.classList.remove('hidden');
  }
  if (section === 'results') {
    elements.resultsSection.classList.remove('hidden');
    elements.controlsSection.classList.remove('hidden'); // Keep re-analyze visible
    elements.reasoningSection.classList.remove('hidden'); // Keep reasoning visible for context
  }
}

function renderList(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = '<li>None detected.</li>';
    return;
  }
  container.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function getScoreColor(score) {
  if (score >= 70) return '#22c55e'; // Green
  if (score >= 40) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
}

async function loadHistory() {
  const { history = [] } = await chrome.storage.local.get('history');
  if (history.length === 0) {
    elements.historyList.innerHTML = '<li class="empty-msg">No history yet.</li>';
    return;
  }
  
  elements.historyList.innerHTML = history.map((item, index) => `
    <li class="history-item" data-index="${index}">
      <div class="history-title">${item.title_or_post_hook.substring(0, 40)}${item.title_or_post_hook.length > 40 ? '...' : ''}</div>
      <div class="history-meta">${new Date(item.timestamp).toLocaleDateString()} - Score: ${item.credibility_score}</div>
    </li>
  `).join('');
  
  // Add history click listeners
  document.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const index = el.dataset.index;
      currentAnalysis = history[index];
      displayResults(currentAnalysis);
      showSection('results');
    });
  });
}
