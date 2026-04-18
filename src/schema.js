// schema.js
export const analysisSchema = {
  type: "object",
  properties: {
    page_type: { 
      type: "string", 
      enum: ["linkedin_post", "x_post", "marketing_page", "product_page", "article", "other"] 
    },
    title_or_post_hook: { type: "string" },
    core_claim: { type: "string" },
    target_audience: { type: "string" },
    evidence_present: { type: "array", items: { type: "string" } },
    missing_evidence: { type: "array", items: { type: "string" } },
    hidden_assumptions: { type: "array", items: { type: "string" } },
    buzzwords_detected: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          why_it_is_vague: { type: "string" },
          plain_english_meaning: { type: "string" }
        },
        required: ["term", "why_it_is_vague", "plain_english_meaning"]
      }
    },
    skeptical_questions: { type: "array", items: { type: "string" } },
    credibility_score: { type: "number", minimum: 0, maximum: 100 },
    verdict: { 
      type: "string", 
      enum: ["mostly substance", "mixed", "mostly hype"] 
    },
    one_line_take: { type: "string" }
  },
  required: [
    "page_type", "title_or_post_hook", "core_claim", "target_audience", 
    "evidence_present", "missing_evidence", "hidden_assumptions", 
    "buzzwords_detected", "skeptical_questions", "credibility_score", 
    "verdict", "one_line_take"
  ]
};
