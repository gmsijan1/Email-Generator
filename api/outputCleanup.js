/**
 * Clean model output: strip leaked prompt content and replace placeholders.
 */

import {
  PROMPT_LEAK_PATTERNS,
  PLACEHOLDER_REPLACEMENTS,
  INSTRUCTION_PHRASES,
} from "./outputCleanup.config.js";

/**
 * Strip prompt sections that leaked into model output.
 */
export function stripPromptLeakage(text) {
  if (!text || !text.trim()) return text;
  let cleaned = text.trim();
  for (const pattern of PROMPT_LEAK_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.trim();
}

/**
 * Clean a draft: replace placeholders with formData values, strip instruction phrases.
 */
export function cleanDraft(text, formData = null) {
  if (!text) return "";

  let result = text;

  if (formData) {
    for (const { pattern, formDataKey } of PLACEHOLDER_REPLACEMENTS) {
      const value = formData[formDataKey] ?? "";
      result = result.replace(pattern, value);
    }
  }

  for (const pattern of INSTRUCTION_PHRASES) {
    result = result.replace(pattern, "");
  }

  return result.trim();
}
