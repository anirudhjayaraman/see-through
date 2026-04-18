# See Through the Hype

A Chrome extension that uses Gemini AI to help users separate real substance from marketing hype on social media (LinkedIn, X) and landing pages.

## Features
- **Intelligent Extraction**: Specific extractors for LinkedIn posts and X/Twitter tweets.
- **Structured Analysis**: Detects core claims, evidence, missing proof, and hidden assumptions.
- **Buzzword Decoder**: Translates marketing jargon into plain English.
- **Credibility Scoring**: Quantifiable score from 0-100 based on falsifiability and evidence.
- **History View**: Remembers your last 5 analyses locally for quick comparison.
- **Selection Support**: Highlight text to focus the analysis on specific sections.
- **Export Options**: Copy a formatted report or download the raw JSON.

## Architecture Overview
- **Manifest V3**: Using modern extension standards.
- **Chrome Side Panel API**: Provides a persistent, non-intrusive UI.
- **Gemini REST API**: Direct integration with Gemini 1.5 Flash (or 2.0 Flash) for high-speed analysis.
- **No Dependencies**: Built with pure vanilla JavaScript (ESM) to ensure light weight and zero build-step complexity.

## Setup Instructions

### 1. Get a Gemini API Key
Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a free API key.

### 2. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select the `see-through` folder you created/cloned.

### 3. Initialize the Extension
1. Click the "See Through the Hype" icon in your toolbar (or pin it first).
2. The side panel will open.
3. Paste your Gemini API key and click **Save Key**.

## How to Demo

### Scenario: LinkedIn "Thought Leadership"
1. Go to any "marketing guru" LinkedIn post.
2. Open the side panel.
3. Click **Analyze This Page**.
4. Watch as it breaks down the "hooks" into "buzzwords" and checks for actual evidence.

### Scenario: AI Tool Landing Page
1. Visit a new AI tool startup page.
2. Highlight a particularly bold claim (e.g., "Revolutionizes your entire workflow with 0% error rate").
3. Click **Analyze This Page**.
4. The extension will focus on the selected text and likely flag the "0% error rate" as a high-hype claim.

## Future Improvements
- **Per-site Fine Tuning**: More specialized extraction for news articles and scientific papers.
- **Deep Proof Search**: Automatically search the web for sources to verify claims (requires Google Search tool).
- **Batch Analysis**: Analyze all posts in a feed at once and highlight high-substance items.

---
**Disclaimer**: This is an assistive critical-reading tool, not a factual verifier. It analyzes the *quality* and *structure* of content, but cannot confirm if a specific claim is 100% true without external source checking.
