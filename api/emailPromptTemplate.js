/**
 * Inference helper functions and prompt builder.
 * SERVER-ONLY: Prompt content comes from EMAIL_PROMPT_TEMPLATE env var (not in code).
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

/**
 * Build the email prompt by replacing placeholders in EMAIL_PROMPT_TEMPLATE.
 * Placeholders: {{COMPANY_NAME}}, {{SENDER_NAME_TITLE}}, {{PRODUCT_SERVICE}},
 * {{EFFECTIVE_DIFFERENTIATOR}}, {{PROSPECT_FIRST_NAME}}, {{PROSPECT_TITLE}},
 * {{PROSPECT_COMPANY}}, {{EFFECTIVE_CATEGORY}}, {{SOCIAL_PROOF_DISPLAY}},
 * {{EFFECTIVE_SOCIAL_PROOF_STYLE}}, {{TONE}}, {{CTA_TYPE}}, {{EFFECTIVE_PRIMARY_PAIN}},
 * {{SIGNATURE_LINE_3}}
 */
export function buildEmailPrompt({
  companyName,
  senderNameTitle,
  productService,
  prospectFirstName,
  prospectCompany,
  prospectTitle,
  ctaType,
  tone,
  line3Input = "",
  keyDifferentiator = "",
  socialProofClient = "",
  category = "",
  socialProofResult = "",
  primaryPain = "",
}) {
  const effectiveDifferentiator =
    keyDifferentiator ||
    "Built specifically for outbound sales teams, not generic AI writing";
  const effectiveClientProof = socialProofClient || "";
  const effectiveCategory = category || inferCategory(productService);
  const effectiveResult = socialProofResult || "";
  const effectivePrimaryPain =
    primaryPain || inferPrimaryPain({ prospectTitle });
  const effectiveSocialProofStyle = inferSocialProofStyle(
    socialProofResult,
    socialProofClient,
  );
  const signatureLine3 = buildSignatureLine3({ line3Input });

  const socialProofDisplay =
    effectiveClientProof || "(inferred from product market)";
  const resultDisplay = effectiveResult || "(inferred from category)";

  const template = process.env.EMAIL_PROMPT_TEMPLATE || getFallbackTemplate();

  return template
    .replace(/\{\{COMPANY_NAME\}\}/g, companyName || "")
    .replace(/\{\{SENDER_NAME_TITLE\}\}/g, senderNameTitle || "")
    .replace(/\{\{PRODUCT_SERVICE\}\}/g, productService || "")
    .replace(/\{\{EFFECTIVE_DIFFERENTIATOR\}\}/g, effectiveDifferentiator)
    .replace(/\{\{PROSPECT_FIRST_NAME\}\}/g, prospectFirstName || "")
    .replace(/\{\{PROSPECT_TITLE\}\}/g, prospectTitle || "")
    .replace(/\{\{PROSPECT_COMPANY\}\}/g, prospectCompany || "")
    .replace(/\{\{EFFECTIVE_CATEGORY\}\}/g, effectiveCategory)
    .replace(/\{\{SOCIAL_PROOF_DISPLAY\}\}/g, socialProofDisplay)
    .replace(/\{\{RESULT_DISPLAY\}\}/g, resultDisplay)
    .replace(/\{\{EFFECTIVE_SOCIAL_PROOF_STYLE\}\}/g, effectiveSocialProofStyle)
    .replace(/\{\{TONE\}\}/g, tone || "")
    .replace(/\{\{CTA_TYPE\}\}/g, ctaType || "")
    .replace(/\{\{EFFECTIVE_PRIMARY_PAIN\}\}/g, effectivePrimaryPain)
    .replace(/\{\{SIGNATURE_LINE_3\}\}/g, signatureLine3)
    .trim();
}

/** Minimal fallback when EMAIL_PROMPT_TEMPLATE is not set (dev only) */
function getFallbackTemplate() {
  return `You are a sales email writer. Use the context below.

## CONTEXT
- Sender Company: {{COMPANY_NAME}}
- Sender Name & Title: {{SENDER_NAME_TITLE}}
- Product/Service: {{PRODUCT_SERVICE}}
- Prospect: {{PROSPECT_FIRST_NAME}}, {{PROSPECT_TITLE}} at {{PROSPECT_COMPANY}}
- Tone: {{TONE}}
- CTA Type: {{CTA_TYPE}}

## OUTPUT
- SUBJECT LINE (35-50 chars)
- EMAIL BODY (75-100 words)
- VARIANT B: different subject/hook

Use the exact values above—never placeholders`;
}
