// test_ai_detection.js — matches TUNED production algorithm from src/tools.js
// Run with: node test/test_ai_detection.js

function splitIntoSentences(text) {
  const abbrevPattern = /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|viz|inc|corp|ltd|co|no|Fig|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\./gi;
  let processedText = text.replace(abbrevPattern, (match) => match.replace('.', '▓'));
  processedText = processedText.replace(/\.{3,}/g, '…');
  const sentences = processedText.split(/(?<=[.!?])\s+(?=[A-Z])/);
  return sentences.map(s => s.replace(/▓/g, '.')).filter(s => s.trim().length > 0);
}

function detectWordLengthUniformity(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 10) return { score: 50, confidence: 'low' };
  const wordLengths = words.map(w => w.length);
  const mean = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length;
  const variance = wordLengths.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wordLengths.length;
  const stdDev = Math.sqrt(variance);
  let aiScore = 50;
  if (stdDev < 2.0) aiScore = 80;
  else if (stdDev < 2.5) aiScore = 65;
  else if (stdDev > 3.5) aiScore = 20;
  else if (stdDev > 3.0) aiScore = 35;
  return { score: aiScore, stdDev: parseFloat(stdDev.toFixed(2)), confidence: words.length > 50 ? 'high' : 'medium' };
}

function calculateLexicalDiversity(text) {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0 && /^[a-z]+$/.test(w));
  if (words.length < 10) return { score: 50, confidence: 'low' };
  const uniqueWords = new Set(words);
  const ttr = uniqueWords.size / words.length;
  let aiScore = 50;
  if (ttr > 0.7) aiScore = 25;
  else if (ttr > 0.6) aiScore = 40;
  else if (ttr < 0.4) aiScore = 75;
  else if (ttr < 0.5) aiScore = 60;
  return { score: aiScore, ttr: parseFloat(ttr.toFixed(2)), uniqueWords: uniqueWords.size, totalWords: words.length, confidence: words.length > 50 ? 'high' : 'medium' };
}

function detectPunctuationPatterns(text) {
  const signals = {
    emDash: (text.match(/—/g) || []).length,
    colon: (text.match(/:/g) || []).length,
    semicolon: (text.match(/;/g) || []).length,
    parentheses: (text.match(/\([^)]+\)/g) || []).length,
  };
  const wordCount = text.split(/\s+/).length;
  const normalizedEmDash = signals.emDash / wordCount * 1000;
  const normalizedColon = signals.colon / wordCount * 1000;
  let aiScore = 50;
  if (normalizedEmDash > 3) aiScore = 70;
  else if (normalizedEmDash > 1.5) aiScore = 60;
  else if (normalizedColon > 5) aiScore = 65;
  return { score: aiScore, signals, confidence: 'medium' };
}

function detectContextualSignals(text) {
  const signals = {
    excessiveTransitions: /\b(Furthermore|Additionally|Moreover|Subsequently|Consequently|It is important to note|It is worth noting)\b/gi.test(text),
    lacksContractions: text.split(/\s+/).length > 80 && !/\b\w+'\w+\b/.test(text),
    formalPhrases: /\b(is able to|has the ability to|in order to|it is possible that)\b/gi.test(text),
    buzzwords: /\b(seamlessly|effortlessly|revolutionary|game-changing|unprecedented|cutting-edge)\b/gi.test(text),
    excessiveBullets: (text.match(/[•\-\*]\s/g) || []).length > 6,
  };
  let signalCount = Object.values(signals).filter(Boolean).length;
  let aiScore = 50 + (signalCount * 8);
  return { score: Math.max(10, Math.min(90, aiScore)), signals, signalCount, confidence: 'medium' };
}

function detectAILanguage(text) {
  const sentences = splitIntoSentences(text);
  if (sentences.length < 3) {
    return { sentence_variance: 0, burstiness: 0, ai_probability_percent: 50, confidence: 'low', factors: ["insufficient_data"] };
  }
  const counts = sentences.map(s => s.trim().split(/\s+/).length);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  const burstiness = mean > 0 ? (stdDev / mean) * 100 : 0;

  let varianceScore;
  if      (variance < 3)   varianceScore = 95;
  else if (variance < 7)   varianceScore = 88;
  else if (variance < 12)  varianceScore = 80;
  else if (variance < 20)  varianceScore = 70;
  else if (variance < 30)  varianceScore = 55;
  else if (variance < 50)  varianceScore = 35;
  else if (variance < 100) varianceScore = 18;
  else                     varianceScore = 8;

  const wordLengthResult = detectWordLengthUniformity(text);
  const lexicalResult = calculateLexicalDiversity(text);
  const punctuationResult = detectPunctuationPatterns(text);
  const contextualResult = detectContextualSignals(text);

  const weights = { variance: 0.40, wordLength: 0.10, lexical: 0.10, punctuation: 0.10, contextual: 0.30 };

  let finalScore = Math.round(
    (varianceScore * weights.variance) +
    (wordLengthResult.score * weights.wordLength) +
    (lexicalResult.score * weights.lexical) +
    (punctuationResult.score * weights.punctuation) +
    (contextualResult.score * weights.contextual)
  );

  const strongAISignals = [
    varianceScore >= 70,
    wordLengthResult.score >= 65,
    contextualResult.signalCount >= 2,
    lexicalResult.ttr < 0.5,
  ].filter(Boolean).length;

  if (strongAISignals >= 3) finalScore = Math.min(99, finalScore + 10);
  else if (strongAISignals >= 2) finalScore = Math.min(99, finalScore + 5);

  // Extreme uniformity override
  if (varianceScore >= 88) finalScore = Math.max(finalScore, 72);

  let confidence = 'low';
  if (sentences.length >= 20 && text.split(/\s+/).length >= 100) confidence = 'high';
  else if (sentences.length >= 10 && text.split(/\s+/).length >= 50) confidence = 'medium';

  const factors = [];
  if (variance < 15) factors.push('low_sentence_variance');
  if (wordLengthResult.stdDev < 2.5) factors.push('uniform_word_lengths');
  if (lexicalResult.ttr < 0.5) factors.push('low_lexical_diversity');
  if (contextualResult.signals.lacksContractions) factors.push('no_contractions');
  if (contextualResult.signals.excessiveTransitions) factors.push('excessive_transitions');
  if (contextualResult.signals.buzzwords) factors.push('ai_buzzwords_detected');

  return {
    sentence_variance: parseFloat(variance.toFixed(2)),
    burstiness: parseFloat(burstiness.toFixed(2)),
    ai_probability_percent: finalScore,
    confidence, factors,
    _breakdown: { varianceScore, wordLength: wordLengthResult.score, lexical: lexicalResult.score,
      punctuation: punctuationResult.score, contextual: contextualResult.score,
      sentenceLengths: counts, wordLengthStdDev: wordLengthResult.stdDev, ttr: lexicalResult.ttr,
      contextualSignals: contextualResult.signals, strongAISignals }
  };
}

// ── TEST CASES ──

const tests = [
  { name: "AI: ChatGPT essay", expectedAI: true,
    text: `Artificial intelligence is transforming the way organizations approach complex challenges. Furthermore, the integration of machine learning algorithms has enabled unprecedented levels of automation across various industries. Additionally, natural language processing has revolutionized the manner in which humans interact with digital systems. Moreover, the deployment of neural networks has facilitated significant advancements in pattern recognition and predictive analytics. It is important to note that these technological developments are not without their challenges. Subsequently, organizations must carefully consider the ethical implications of deploying autonomous systems. Consequently, the establishment of robust governance frameworks is essential in order to ensure responsible innovation. The continued evolution of artificial intelligence represents a fundamental shift in the technological landscape. Furthermore, the convergence of multiple disciplines is creating new opportunities for interdisciplinary collaboration and knowledge exchange.` },
  { name: "AI: LinkedIn post", expectedAI: true,
    text: `The future of work is here — and it is nothing like what we expected. Organizations that embrace cutting-edge technology will find themselves at the forefront of innovation. Additionally, the integration of revolutionary AI-powered solutions is enabling seamless collaboration across distributed teams. Furthermore, the adoption of cloud-native architectures has fundamentally transformed how enterprises approach scalability and resilience. It is worth noting that the most successful companies are those that invest in their people as much as their technology. Moreover, the intersection of data science and business strategy is creating unprecedented opportunities for growth and differentiation. The organizations that fail to adapt will inevitably fall behind their more agile competitors. Subsequently, forward-thinking leaders are prioritizing digital transformation as a core strategic imperative. The landscape of modern business demands nothing less than a complete reimagining of traditional operational paradigms.` },
  { name: "AI: Product description", expectedAI: true,
    text: `Our platform provides comprehensive solutions for modern enterprises. The system enables organizations to streamline their operations efficiently. The technology leverages advanced algorithms to deliver actionable insights. The platform offers seamless integration with existing enterprise workflows. The solution provides robust security features to protect sensitive data. The system delivers consistent performance across all deployment environments. The platform supports scalable architecture for growing organizations. The technology ensures reliable uptime through redundant infrastructure. The solution enables teams to collaborate effectively across geographical boundaries. The platform provides intuitive dashboards for real-time monitoring and analytics. The system offers flexible configuration options to meet diverse requirements. The technology delivers measurable improvements in operational efficiency.` },
  { name: "AI: Blog paragraph", expectedAI: true,
    text: `In the rapidly evolving landscape of digital transformation, it is essential for organizations to understand the implications of emerging technologies. The proliferation of artificial intelligence has created new paradigms for business operations and customer engagement. Furthermore, the integration of machine learning capabilities into existing systems has enabled organizations to derive meaningful insights from vast datasets. Additionally, the advancement of natural language processing technologies has facilitated more intuitive and accessible user experiences. It is important to note that the successful implementation of these technologies requires careful planning and strategic alignment with organizational objectives. Moreover, the ethical considerations surrounding artificial intelligence deployment demand thoughtful deliberation and transparent governance frameworks. Subsequently, organizations that prioritize responsible innovation are better positioned to achieve sustainable competitive advantages in an increasingly complex marketplace.` },
  { name: "AI: Workplace transformation", expectedAI: true,
    text: `The modern workplace is undergoing a revolutionary transformation — one that demands a complete rethinking of traditional approaches. Organizations must consider the following critical factors when navigating this transition. The first consideration is the seamless integration of digital tools across all operational layers. The second consideration is the cultivation of a culture that embraces continuous learning and adaptation. The third consideration is the establishment of robust data governance frameworks. Furthermore, the successful execution of digital transformation initiatives requires strong leadership commitment and organizational alignment. Additionally, the deployment of cutting-edge analytical capabilities enables data-driven decision-making at unprecedented scales. It is worth noting that organizations which fail to embrace these changes risk becoming obsolete in an increasingly competitive landscape. The path forward requires a balanced approach that harmonizes technological innovation with human-centered design principles.` },
  { name: "Human: Casual rant", expectedAI: false,
    text: `Man, I can't believe how terrible that meeting was today. Like, seriously? Two hours of pure garbage. Nobody knew what they were talking about. The CEO just kept rambling about "synergy" or whatever. I zoned out after ten minutes. Then Sarah — bless her heart — tried to steer things back on track but it was hopeless. We didn't accomplish a single thing. Not one. I'm honestly thinking about updating my resume. Maybe I'll grab coffee first though. Oh wait, the machine's broken again. Of course it is. This whole place is falling apart and nobody seems to care. At least it's Friday tomorrow. Small mercies, right?` },
  { name: "Human: Technical writing", expectedAI: false,
    text: `So I've been debugging this memory leak for three days now and I think I finally found it. Turns out the event listener wasn't getting cleaned up on unmount. Classic React mistake, honestly — I should've caught it sooner. The heap snapshot showed 47MB of detached DOM nodes just sitting there. Forty-seven! Once I added the cleanup function in useEffect, memory usage dropped to like 12MB. Night and day difference. Still need to figure out why the WebSocket reconnection logic is flaky though. Sometimes it works, sometimes it just... doesn't. My coworker thinks it's a race condition but I'm not so sure.` }
];

// ── RUN ──

console.log("\n" + "═".repeat(70));
console.log("  AI Detection Test Suite — Tuned Production Algorithm");
console.log("═".repeat(70));

let passed = 0, failed = 0;

tests.forEach(tc => {
  const r = detectAILanguage(tc.text);
  const isAI = r.ai_probability_percent >= 70;
  const ok = isAI === tc.expectedAI;
  if (ok) passed++; else failed++;
  const icon = ok ? "✅" : "❌";
  const label = r.ai_probability_percent >= 70 ? '🤖 AI' : r.ai_probability_percent >= 40 ? '🤷 Mixed' : '👤 Human';
  console.log(`\n${icon} ${tc.name}`);
  console.log(`   AI: ${r.ai_probability_percent}% ${label} | Variance: ${r.sentence_variance} | Confidence: ${r.confidence}`);
  console.log(`   Factors: ${r.factors.join(', ') || 'none'}`);
  console.log(`   Breakdown: V=${r._breakdown.varianceScore} WL=${r._breakdown.wordLength} Lex=${r._breakdown.lexical} P=${r._breakdown.punctuation} Ctx=${r._breakdown.contextual} Signals=${r._breakdown.strongAISignals}/4`);
});

console.log("\n" + "═".repeat(70));
console.log(`  ${passed}/${tests.length} passed, ${failed} failed`);
console.log("═".repeat(70) + "\n");
