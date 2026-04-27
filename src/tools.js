// tools.js

/**
 * Improved sentence splitting that handles abbreviations and ellipses.
 */
function splitIntoSentences(text) {
  // Common abbreviations to avoid splitting on
  const abbrevPattern = /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|viz|inc|corp|ltd|co|no|Fig|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\./gi;
  
  // Replace abbreviations temporarily with placeholder
  let processedText = text.replace(abbrevPattern, (match) => match.replace('.', '▓'));
  
  // Handle ellipses - treat as single unit
  processedText = processedText.replace(/\.{3,}/g, '…');
  
  // Split on sentence-ending punctuation followed by space and capital
  const sentences = processedText.split(/(?<=[.!?])\s+(?=[A-Z])/);
  
  // Restore abbreviations
  return sentences.map(s => s.replace(/▓/g, '.')).filter(s => s.trim().length > 0);
}

/**
 * Calculate word length variance to detect AI uniformity.
 */
function detectWordLengthUniformity(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 10) return { score: 50, confidence: 'low' };
  
  const wordLengths = words.map(w => w.length);
  const mean = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length;
  const variance = wordLengths.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wordLengths.length;
  const stdDev = Math.sqrt(variance);
  
  // AI tends to have more uniform word lengths (lower stdDev)
  // Human text typically has stdDev between 2.5-4.0
  let aiScore = 50;
  if (stdDev < 2.0) aiScore = 80;
  else if (stdDev < 2.5) aiScore = 65;
  else if (stdDev > 3.5) aiScore = 20;
  else if (stdDev > 3.0) aiScore = 35;
  
  return { 
    score: aiScore, 
    stdDev: parseFloat(stdDev.toFixed(2)),
    confidence: words.length > 50 ? 'high' : 'medium'
  };
}

/**
 * Calculate lexical diversity (Type-Token Ratio).
 */
function calculateLexicalDiversity(text) {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0 && /^[a-z]+$/.test(w));
  if (words.length < 10) return { score: 50, confidence: 'low' };
  
  const uniqueWords = new Set(words);
  const ttr = uniqueWords.size / words.length;
  
  // AI often has higher TTR initially but repeats more in longer texts
  // Human has more varied vocabulary distribution
  let aiScore = 50;
  if (ttr > 0.7) aiScore = 25; // Very diverse = more human-like
  else if (ttr > 0.6) aiScore = 40;
  else if (ttr < 0.4) aiScore = 75; // Low diversity can indicate AI repetition
  else if (ttr < 0.5) aiScore = 60;
  
  return { 
    score: aiScore, 
    ttr: parseFloat(ttr.toFixed(2)),
    uniqueWords: uniqueWords.size,
    totalWords: words.length,
    confidence: words.length > 50 ? 'high' : 'medium'
  };
}

/**
 * Detect punctuation patterns characteristic of AI writing.
 */
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
  
  // AI tends to overuse em-dashes and colons
  let aiScore = 50;
  if (normalizedEmDash > 3) aiScore = 70;
  else if (normalizedEmDash > 1.5) aiScore = 60;
  else if (normalizedColon > 5) aiScore = 65;
  
  return {
    score: aiScore,
    signals,
    confidence: 'medium'
  };
}

/**
 * Detect contextual signals of AI generation.
 */
function detectContextualSignals(text) {
  const signals = {
    // AI overuses these transition words
    excessiveTransitions: /\b(Furthermore|Additionally|Moreover|Subsequently|Consequently|It is important to note|It is worth noting)\b/gi.test(text),
    
    // AI tends to avoid contractions (only meaningful signal for conversational/informal texts)
    lacksContractions: text.split(/\s+/).length > 80 && !/\b\w+'\w+\b/.test(text),
    
    // AI uses more formal language
    formalPhrases: /\b(is able to|has the ability to|in order to|it is possible that)\b/gi.test(text),
    
    // AI overuses certain buzzwords
    buzzwords: /\b(seamlessly|effortlessly|revolutionary|game-changing|unprecedented|cutting-edge)\b/gi.test(text),
    
    // AI tends to use bullet points excessively (threshold raised to reduce false positives)
    excessiveBullets: (text.match(/[•\-\*]\s/g) || []).length > 6,
  };
  
  let signalCount = Object.values(signals).filter(Boolean).length;
  // AI signals should INCREASE the AI probability
  let aiScore = 50 + (signalCount * 8);
  
  return {
    score: Math.max(10, Math.min(90, aiScore)),
    signals,
    signalCount,
    confidence: 'medium'
  };
}

/**
 * Performs stylometric analysis to detect AI generation via multiple metrics.
 */
function detectAILanguage(text) {
  // 1. Split into sentences with improved logic
  const sentences = splitIntoSentences(text);
  
  if (sentences.length < 3) {
    return {
      sentence_variance: 0,
      burstiness: 0,
      ai_probability_percent: 50,
      confidence: 'low',
      summary: "Text too short for reliable statistical analysis.",
      factors: ["insufficient_data"]
    };
  }

  // 2. Calculate word count for each sentence
  const counts = sentences.map(s => s.trim().split(/\s+/).length);
  
  // 3. Mean sentence length
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  
  // 4. Variance (Burstiness)
  const variance = counts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  const burstiness = mean > 0 ? (stdDev / mean) * 100 : 0;

  // Human text typically has high variance (burstiness). AI has low variance.
  // Tighter buckets in the 5-25 range where most AI text clusters.
  let varianceScore;
  if      (variance < 3)   varianceScore = 95; // Robotic uniformity
  else if (variance < 7)   varianceScore = 88;
  else if (variance < 12)  varianceScore = 80;
  else if (variance < 20)  varianceScore = 70;
  else if (variance < 30)  varianceScore = 55;
  else if (variance < 50)  varianceScore = 35; // Moderately human
  else if (variance < 100) varianceScore = 18; // Very human / bursty
  else                     varianceScore = 8;  // Extremely bursty — clearly human

  // 5. Run additional detection metrics
  const wordLengthResult = detectWordLengthUniformity(text);
  const lexicalResult = calculateLexicalDiversity(text);
  const punctuationResult = detectPunctuationPatterns(text);
  const contextualResult = detectContextualSignals(text);

  // 6. Weighted ensemble approach
  const weights = {
    variance: 0.40,
    wordLength: 0.10,
    lexical: 0.10,
    punctuation: 0.10,
    contextual: 0.30
  };

  let finalScore = Math.round(
    (varianceScore * weights.variance) +
    (wordLengthResult.score * weights.wordLength) +
    (lexicalResult.score * weights.lexical) +
    (punctuationResult.score * weights.punctuation) +
    (contextualResult.score * weights.contextual)
  );

  // 7. Correlation bonus: when multiple strong indicators agree, boost confidence
  const strongAISignals = [
    varianceScore >= 70,
    wordLengthResult.score >= 65,
    contextualResult.signalCount >= 2,
    lexicalResult.ttr < 0.5,
  ].filter(Boolean).length;

  if (strongAISignals >= 3) finalScore = Math.min(99, finalScore + 10);
  else if (strongAISignals >= 2) finalScore = Math.min(99, finalScore + 5);

  // 8. Extreme uniformity override: near-zero variance is virtually impossible for human writing
  if (varianceScore >= 88) finalScore = Math.max(finalScore, 72);

  // Determine confidence based on sample size
  let confidence = 'low';
  if (sentences.length >= 20 && text.split(/\s+/).length >= 100) {
    confidence = 'high';
  } else if (sentences.length >= 10 && text.split(/\s+/).length >= 50) {
    confidence = 'medium';
  }

  // Collect contributing factors
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
    confidence: confidence,
    factors: factors,
    summary: `Analyzed ${sentences.length} sentences. Variance: ${variance.toFixed(2)}. Ensemble AI score: ${finalScore}%.`
  };
}

export const toolsDefinition = [
  {
    name: "detect_ai_language",
    description: "Analyze a piece of text to detect AI-generated language using sentence variance and burstiness. Returns sentence_variance, burstiness, ai_probability_percent, confidence, and factors.",
    parameters: {
      type: "OBJECT",
      properties: {
        text: {
          type: "STRING",
          description: "The text segment to analyze for AI patterns."
        }
      },
      required: ["text"]
    }
  }
];

export const toolsImplementations = {
  detect_ai_language: detectAILanguage
};
