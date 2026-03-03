/**
 * Config for cleaning model output.
 * Add new patterns here—no changes needed in cleanup logic.
 */

/** Regexes to strip prompt sections that leak at end of output */
export const PROMPT_LEAK_PATTERNS = [
  /\n##\s*QUALITY CHECK[\s\S]*$/i,
  /\n##\s*STRUCTURE RULES[\s\S]*$/i,
  /\n##\s*SAFETY RULES[\s\S]*$/i,
  /\n##\s*CTA PATTERNS[\s\S]*$/i,
  /\nNever say "based on assumptions"[\s\S]*$/i,
  /\nUses provided context, complements with[\s\S]*$/i,
];

/** Placeholder patterns + formData key for replacement */
export const PLACEHOLDER_REPLACEMENTS = [
  { pattern: /\[Prospect\s+Name\]/gi, formDataKey: "prospectFirstName" },
  { pattern: /\[Prospect\s+Company\]/gi, formDataKey: "prospectCompany" },
  { pattern: /\[Prospect\s+FirstName\]/gi, formDataKey: "prospectFirstName" },
  { pattern: /\[Sender\s+Company\]/gi, formDataKey: "companyName" },
  { pattern: /\[Company\s+Name\]/gi, formDataKey: "companyName" },
];

/** Instruction phrases that leak from prompt into output */
export const INSTRUCTION_PHRASES = [
  /\s*\(concise,?\s*6-10\s+words\s+only\)/gi,
  /\s*\(consise,?\s*6-10\s+words\s+only\)/gi,
];
