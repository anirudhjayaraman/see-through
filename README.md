# See Through the Hype 🔍✨

A premium Chrome Extension that uses a **multi-turn AI agent** to help you separate real substance from marketing hype. Powered by Gemini AI, it analyzes LinkedIn posts, X threads, and web pages — running local statistical tools before forming its verdict.

## What's New in v1.2.1 — Agentic AI Detection

This release introduces a fully agentic analysis pipeline, where the AI calls local tools, inspects the results, and only then produces its final verdict.

### Agentic Tool-Calling Pipeline
The extension implements a **multi-turn conversational loop** (up to 10 turns) between Gemini and local custom tools. You can watch it work in real time via the **Agent Reasoning** panel.

### Custom Tool: `detect_ai_language`
A local statistical stylometric engine with **5-metric weighted ensemble** scoring:

| Metric | Weight | What it measures |
|---|---|---|
| Sentence Variance | 50% | Burstiness — AI writes in uniform, predictable lengths |
| Word Length Uniformity | 15% | AI uses more consistent word lengths (lower std dev) |
| Lexical Diversity (TTR) | 15% | Type-Token Ratio — AI repeats vocabulary more |
| Punctuation Patterns | 5% | AI overuses em-dashes and colons |
| Contextual Signals | 15% | Formal transitions, buzzwords, lack of contractions |

Returns: `ai_probability_percent`, `sentence_variance`, `burstiness`, `confidence` (low/medium/high), and `factors[]` (detected AI signals).

### Deterministic, Transparent Scoring
- **Score starts at 50** and adjusts via a strict rubric: `+8` per concrete claim, `−8` per vague claim, `±10` for source presence, `−15` for high AI probability.
- **Verdicts are derived deterministically from the score** — not from LLM opinion:
  - 🟢 **Mostly Substance**: Score 65–100
  - 🟡 **Mixed**: Score 35–64
  - 🔴 **Mostly Hype**: Score 0–34
- `temperature: 0` ensures the same post always gets the same score.

### AI Detection Dashboard
The results panel shows three live metrics cards directly below the verdict:
- **AI Prob. %** — color-coded green/amber/red
- **Variance** — raw sentence length variance
- **Burstiness** — Coefficient of Variation (relative rhythmic variation)

### Verdict Legend
Every result shows a full explanation of all three possible verdicts and the scoring formula — no black boxes.

---

## Testing Methodology
We built a multi-layered testing suite to ensure the stylometric engine and agentic loop are highly calibrated:

1. **Stylometric Test Harness (`test/test_detector.html`)**: A standalone web suite to run the 5-metric ensemble against known AI, bursty human, and buzzword-heavy texts directly in the browser.
2. **Python Engine Port (`test/test_detector.py`)**: A Python port of the stylometric math used to rapidly tune coefficient weights against larger batches of text in the terminal.
3. **End-to-End Extraction (`test/mock_pages.html`)**: Raw HTML dumps of real LinkedIn posts and X threads to verify DOM selectors correctly isolate post text from sidebar noise.
4. **Deterministic Calibration**: `temperature: 0` plus an explicit scoring rubric strictly prevents LLM hallucinations, ensuring final scores always correctly match the verdict label.

---

## Features
- **Agentic Loop**: Multi-turn tool-calling with real-time Agent Reasoning chain
- **AI Detection**: 5-metric ensemble stylometric analysis
- **Transparent Scoring**: Explicit point-based rubric visible in every result
- **Deterministic Verdicts**: Score always matches the verdict label
- **Modern Minimal UI**: Glassmorphism side panel with live reasoning updates
- **Deep Extraction**: Specialized selectors for LinkedIn and X
- **Privacy First**: Minimal permissions using `activeTab` only
- **Demo Mode**: Built-in test cases for presentations

---

## Installation
1. **Clone** this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the root folder of this project.

## Setup
1. Open the **Side Panel** by clicking the eye icon in your browser toolbar.
2. Go to **Settings** (gear icon).
3. Enter your **Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey)).
4. *Optional*: Enter `DEMO` in the API Key field to try without a real key.

## Testing with Demo Mode
1. Enter `DEMO` as your API key in Settings.
2. Open `test/mock_pages.html` in your browser.
3. Click **Analyze Page Content** on any sample section.

---
Built for skeptics, by skeptics. 🚀
