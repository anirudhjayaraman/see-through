// test/mock_responses.js

export const MOCK_RESPONSES = {
  linkedin_post: {
    page_type: "linkedin_post",
    title_or_post_hook: "SECRET to 10,000% growth",
    core_claim: "Quantum AI-Powered Synergy™ is the secret to 10,000% growth and trading souls for pennies is no longer necessary.",
    target_audience: "9-5 workers seeking financial freedom and influencers.",
    evidence_present: [
      "Waitlist of 500,000+ influencers mentioned.",
      "Claims of proprietary algorithms."
    ],
    missing_evidence: [
      "Zero revenue data ('pre-revenue').",
      "No explanation of how 'Quantum Synergy' actually works.",
      "No case studies of the 10,000% growth.",
      "Vague terminology like 'destiny architects' lacks any technical backing."
    ],
    hidden_assumptions: [
      "Assumes 9-5 jobs are inherently negative.",
      "Assumes waitlist size equals product viability.",
      "Assumes 'destiny' can be modeled by algorithms."
    ],
    buzzwords_detected: [
      {
        term: "Quantum AI-Powered Synergy™",
        why_it_is_vague: "Combines three high-value buzzwords without technical context.",
        plain_english_meaning: "A software feature that likely uses standard data processing."
      },
      {
        term: "The Matrix",
        why_it_is_vague: "Emotional metaphor used to create an 'us vs. them' narrative.",
        plain_english_meaning: "Standard employment."
      },
      {
        term: "Destiny Mapping",
        why_it_is_vague: "Completely unfalsifiable and mystical.",
        plain_english_meaning: "Predictive planning (or just a guess)."
      }
    ],
    skeptical_questions: [
      "What is the mathematical definition of 'Quantum Synergy' in this context?",
      "How many of the 500k influencers are paying customers?",
      "Can we see a technical whitepaper for the blockchain-neural-algorithms?"
    ],
    credibility_score: 12,
    verdict: "mostly hype",
    one_line_take: "This post is a masterclass in using emotional hooks and meaningless jargon to mask a total lack of product substance."
  },
  x_post: {
    page_type: "x_post",
    title_or_post_hook: "Decentralized liquidity clusters thread",
    core_claim: "The era of traditional finance is over and decentralized liquidity clusters are the only path to wealth.",
    target_audience: "Retail crypto investors and skeptics of traditional banking.",
    evidence_present: [
      "Reference to unnamed 'alpha drop' data.",
      "Reference to 'candles' (chart patterns)."
    ],
    missing_evidence: [
      "No specific data provided to support the 99.9% probability.",
      "No definition of 'decentralized liquidity clusters'.",
      "No source for the big banks' 'terror'."
    ],
    hidden_assumptions: [
      "Assumes past chart patterns (candles) guarantee future shift.",
      "Assumes traditional finance has no resilience.",
      "Assumes technical jargon equals technical expertise."
    ],
    buzzwords_detected: [
      {
        term: "Decentralized liquidity clusters",
        why_it_is_vague: "Sounds technical but doesn't map to a specific, unique protocol.",
        plain_english_meaning: "Generic crypto trading pools."
      },
      {
        term: "Paradigm shift",
        why_it_is_vague: "Overused term for any change in market direction.",
        plain_english_meaning: "Market movement."
      }
    ],
    skeptical_questions: [
      "Which specific protocols are these 'clusters' located on?",
      "What is the statistical model used to calculate 99.9% probability?",
      "Why is 'data the new proof' a reason to not provide specific data?"
    ],
    credibility_score: 28,
    verdict: "mostly hype",
    one_line_take: "High on jargon and urgency, extremely low on peer-reviewable data or technical clarity."
  },
  marketing_page: {
    page_type: "product_page",
    title_or_post_hook: "FluxFlow Productivity Engine",
    core_claim: "FluxFlow increases productivity by 4x using Next-Gen Cloud Processing.",
    target_audience: "Business professionals and companies looking for efficiency gains.",
    evidence_present: [
      "Pricing tiers provided (Free vs Visionary).",
      "Mention of cloud processing as the driver."
    ],
    missing_evidence: [
      "The '4x' claim is asterisked with a disclaimer saying results are not typical.",
      "No user testimonials or independent performance reviews.",
      "No explanation of what 'Quantum Flux Control' actually does differently from a task list."
    ],
    hidden_assumptions: [
      "Assumes destiny can be mapped for a monthly fee.",
      "Assumes 'premium' pricing correlates to 'quantum' better results."
    ],
    buzzwords_detected: [
      {
        term: "Destiny Mapping",
        why_it_is_vague: "Pure marketing fluff with no measurable basis.",
        plain_english_meaning: "Scheduling."
      },
      {
        term: "Next-Gen Cloud Processing",
        why_it_is_voter: "Everything cloud-based is technically 'processing'.",
        plain_english_meaning: "Running on a web server."
      }
    ],
    skeptical_questions: [
      "What productivity metrics were used to determine the 4x increase?",
      "Can we see the case study for the 0.1% of Fortune 500 companies mentioned?",
      "Is FluxFlow just a wrapper for a standard project management database?"
    ],
    credibility_score: 42,
    verdict: "mixed",
    one_line_take: "A polished product page that uses hyperbole to sell common productivity features, though it at least defines a pricing structure."
  }
};
