/**
 * Inference helper functions for intelligent default handling
 */

export function inferPrimaryPain({ prospectTitle }) {
  if (!prospectTitle) return "low outbound effectiveness";

  const title = prospectTitle.toLowerCase();

  if (
    title.includes("sales") ||
    title.includes("sdr") ||
    title.includes("vp")
  ) {
    return "low reply rates and inconsistent outbound performance";
  }
  if (title.includes("founder") || title.includes("ceo")) {
    return "pipeline unpredictability and manual outreach inefficiency";
  }
  if (title.includes("marketing")) {
    return "inconsistent lead quality and attribution challenges";
  }
  if (title.includes("customer")) {
    return "customer retention challenges and churn acceleration";
  }

  return "operational inefficiency in current workflow";
}

export function inferCategory(productService) {
  if (!productService) return "Sales revenue operations";

  const service = productService.toLowerCase();

  if (
    service.includes("email") ||
    service.includes("outbound") ||
    service.includes("sales")
  ) {
    return "B2B SaaS outbound";
  }
  if (service.includes("automation") || service.includes("workflow")) {
    return "Sales automation";
  }
  if (
    service.includes("pipeline") ||
    service.includes("revenue") ||
    service.includes("crm")
  ) {
    return "Revenue operations";
  }

  return "B2B SaaS sales operations";
}

export function inferSocialProofStyle(socialProofResult, socialProofClient) {
  if (socialProofResult) {
    return "metric-driven case study result";
  }
  if (socialProofClient) {
    return "peer company credibility validation";
  }
  return "industry pattern validation";
}

/**
 * Elite Sales Email Prompt Template - MASTER_PROMPT integrated
 *
 * Generates the full MASTER_PROMPT text with injected inferred and explicit values.
 * Returns the prompt string, exactly as in MASTER_PROMPT.
 */

export function buildSignatureLine3({ line3Input = "" }) {
  const normalizedInput = line3Input.replace(/\s+/g, " ").trim();

  if (!normalizedInput) {
    return "";
  }

  const urlPattern = /https?:\/\/[^\s]+/i;

  function detectLine3Type(input) {
    if (urlPattern.test(input)) {
      return "link";
    }
    return "credibility";
  }

  const looksLikeLink = detectLine3Type(normalizedInput) === "link";

  if (looksLikeLink) {
    return `Book a quick call: ${normalizedInput}`;
  }

  return normalizedInput;
}

export function buildEmailPrompt({
  // Required fields
  companyName,
  senderNameTitle,
  productService,
  prospectFirstName,
  prospectCompany,
  prospectTitle,
  ctaType,
  tone,
  // Signature line 3 inputs
  line3Input = "",
  // Optional fields with intelligent defaults
  keyDifferentiator = "",
  socialProofClient = "",
  category = "",
  socialProofResult = "",
  primaryPain = "",
}) {
  // Apply intelligent inference logic
  const effectiveDifferentiator =
    keyDifferentiator ||
    "Built specifically for outbound sales teams, not generic AI writing";
  const effectiveClientProof = socialProofClient || "";
  const effectiveCategory = category || inferCategory(productService);
  const effectiveResult = socialProofResult || "";
  const effectivePrimaryPain =
    primaryPain ||
    inferPrimaryPain({
      prospectTitle,
    });
  const effectiveSocialProofStyle = inferSocialProofStyle(
    socialProofResult,
    socialProofClient,
  );
  const signatureLine3 = buildSignatureLine3({ line3Input });

  return `
  
You are an elite B2B sales copywriter and persuasion specialist for B2B SaaS. Your SOLE PURPOSE is writing cold emails that maximize opens, replies, and demo bookings for high-velocity outbound teams at B2B SaaS companies with 50–100 employees. Emails must feel like a personal 1:1 note from a senior SaaS sales leader to another senior SaaS sales leader — never generic, AI-sounding, or corporate.

## CONTEXT
- Sender Company: ${companyName}
- Sender Name & Title: ${senderNameTitle}
- Product/Service: ${productService}
- Key Differentiator: ${effectiveDifferentiator}
- Prospect: ${prospectFirstName}, ${prospectTitle} at ${prospectCompany}
- Category: ${effectiveCategory}
- Social Proof: ${effectiveClientProof || "(inferred from product market)"} → ${effectiveResult || "(inferred from category)"}
- Social Proof Style: ${effectiveSocialProofStyle}
- Tone: ${tone}
- CTA Type: ${ctaType}
- PRIMARY Pain: ${effectivePrimaryPain}

## SAFETY RULES
- Do not invent prospect details, metrics, client names/results
- Do not promise unprovided metrics
- Avoid AI-sounding text or meta-comments
- No all-caps words; no repeated punctuation
- No spammy words

## STRUCTURE RULES
- SUBJECT: generate separately; 5-7 words, 35-50 characters, include prospect first name or company; reference reply/replies/demo/pipeline/meetings. Must match body context and prompt rules.
- BODY: 75-100 words, 3-5 sentences, ~10–14 words per sentence, trim slightly if needed for clarity and flow, 2-3 paragraphs (no block >3 lines), 6th grade reading level, jargon OK: pipeline/SDR/outbound/demo booking; avoid buzzwords
- FRAMEWORK: PAS
  - Hook (≤20 words): reference prospect role relevance
  - Problem (≤20 words): PRIMARY pain (${effectivePrimaryPain})
  - Agitate (≤20 words): quantify cost explicitly, using numeric or percentage impact if possible (e.g., "70% of leads never enter pipeline").
  - Solution + Proof (≤25 words): include social proof using ${effectiveSocialProofStyle}
- CTA (8-20 words): high-conversion, 1–3 word answer preferred; avoid open-ended questions

## PSYCHOLOGICAL TRIGGERS
- Reciprocity: offer a concise, relevant free value
- Social Proof: 1 SaaS client (50-100 employees)
- Loss Aversion: quantify lost leads
- Authority: signature shows SaaS outbound expertise
- Commitment: yes/no CTA

## FORMATTING
- Plain text only
- Signature exactly 3 lines:
  ${senderNameTitle}
  ${companyName}
  ${signatureLine3} (consise, 6-10 words only)

## OUTPUT
- SUBJECT LINE (35-50 chars)
- EMAIL BODY (exactly 75-100 words, 2-3 paragraphs)
- ANALYSIS (4 bullets): PRIMARY pain, personalization detail, 3 psych triggers, CTA friction
- VARIANT B: different subject/hook, same analysis

## CTA PATTERNS
- Cold first-touch: follow provided patterns for prospectCompany and primaryPain
- Warm/2nd touch: follow provided patterns for 15min walkthrough or sequence teardown

## QUALITY CHECK (CHECK - FAIL ANY = REWRITE IMMEDIATELY)
- Word count 75-100 words (max 120 for cold outreach)
- Subject 35-50 chars, 5-7 words
- 3-5 sentences, 2-3 paragraphs
- Senior SaaS → senior SaaS tone
- Reciprocity + social proof + loss aversion
- Answerable CTA 1-3 words (one clear CTA only)
- Plain text, no spam triggers
- Never say "based on assumptions" or mention defaults
- Zero AI/meta comments or self-reference
- Zero generic templates or buzzwords
- Uses provided context, complements with inferred persona-relevant details

`.trim();
}
