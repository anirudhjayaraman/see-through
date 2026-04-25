// tools.js

/**
 * Calculates a mathematical expression.
 */
function calculateMath(expression) {
  try {
    // Only allow basic math characters to prevent arbitrary code execution
    if (!/^[0-9\+\-\*\/\(\)\.\s]+$/.test(expression)) {
      return "Error: Invalid characters in math expression. Only numbers and basic operators (+, -, *, /, (), .) are allowed.";
    }
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${expression}`)();
    return `Result of ${expression} = ${result}`;
  } catch (err) {
    return `Error calculating math: ${err.message}`;
  }
}

/**
 * Performs stylometric analysis to detect AI generation via Sentence Variance and Burstiness.
 */
function detectAILanguage(text) {
  // 1. Break text into sentences (naively using punctuation)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  if (sentences.length < 3) {
    return {
      sentence_variance: 0,
      burstiness: 0,
      ai_probability_percent: 50,
      summary: "Text too short for reliable statistical analysis."
    };
  }

  // 2. Calculate word count for each sentence
  const counts = sentences.map(s => s.trim().split(/\s+/).length);
  
  // 3. Mean sentence length
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  
  // 4. Variance (Burstiness)
  const variance = counts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / counts.length;
  
  // Human text typically has high variance (burstiness). AI has low variance.
  // This is a simplified heuristic:
  // Variance < 10 -> Very AI-like (robotic uniform length)
  // Variance > 40 -> Very Human-like (high burstiness)
  let aiProb = 50;
  if (variance < 15) {
    aiProb = 85;
  } else if (variance < 25) {
    aiProb = 65;
  } else if (variance > 40) {
    aiProb = 15;
  } else {
    aiProb = 35;
  }

  return {
    sentence_variance: parseFloat(variance.toFixed(2)),
    burstiness: parseFloat(variance.toFixed(2)), // Burstiness in this heuristic is represented by variance
    ai_probability_percent: aiProb,
    summary: `Analyzed ${sentences.length} sentences. Variance is ${variance.toFixed(2)}. AI probability is ${aiProb}%.`
  };
}

export const toolsDefinition = [
  {
    name: "calculate_math",
    description: "Evaluate a mathematical expression to verify statistics, percentages, or numbers.",
    parameters: {
      type: "OBJECT",
      properties: {
        expression: {
          type: "STRING",
          description: "The mathematical expression to evaluate (e.g., '100 * (15/50)'). Only numbers and operators + - * / () are allowed."
        }
      },
      required: ["expression"]
    }
  },
  {
    name: "detect_ai_language",
    description: "Analyze a piece of text to detect AI-generated language using sentence variance and burstiness. Returns a JSON string with sentence_variance, burstiness, and ai_probability_percent metrics.",
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
  calculate_math: calculateMath,
  detect_ai_language: detectAILanguage
};
