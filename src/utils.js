// utils.js

/**
 * Saves analysis result to local history (max 5 items).
 */
export async function saveToHistory(analysis) {
  const { history = [] } = await chrome.storage.local.get('history');
  
  // Add new item at the beginning
  const newHistory = [
    {
      timestamp: new Date().toISOString(),
      ...analysis
    },
    ...history
  ].slice(0, 5); // Keep only last 5

  await chrome.storage.local.set({ history: newHistory });
}

/**
 * Downloads a JSON file.
 */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'analysis.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Copies text to clipboard.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

/**
 * Formats analysis for copy-pasting as a report.
 */
export function formatReport(analysis) {
  return `
SEE THROUGH THE HYPE - ANALYSIS REPORT
--------------------------------------
Page Title/Hook: ${analysis.title_or_post_hook}
Detected Type: ${analysis.page_type}
Verdict: ${analysis.verdict.toUpperCase()}
Credibility Score: ${analysis.credibility_score}/100

CORE CLAIM:
${analysis.core_claim}

EVIDENCE PRESENT:
${analysis.evidence_present.map(e => `- ${e}`).join('\n')}

MISSING EVIDENCE:
${analysis.missing_evidence.map(e => `- ${e}`).join('\n')}

BUZZWORDS DECODED:
${analysis.buzzwords_detected.map(b => `- ${b.term}: ${b.plain_english_meaning} (${b.why_it_is_vague})`).join('\n')}

SKEPTICAL QUESTIONS:
${analysis.skeptical_questions.map(q => `- ${q}`).join('\n')}

ONE-LINE TAKE:
${analysis.one_line_take}
--------------------------------------
This is an assistive critical-reading tool, not a factual verifier.
`.trim();
}
