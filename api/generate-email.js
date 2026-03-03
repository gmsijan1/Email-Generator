import { OpenAI } from "openai";
import { buildEmailPrompt } from "./emailPromptTemplate.js";
import {
  stripPromptLeakage,
  cleanDraft,
} from "./outputCleanup.js";

/**
 * Parse raw model output into Variant A and Variant B drafts.
 */
function parseEmailDrafts(rawContent) {
  if (!rawContent?.trim()) return ["", ""];

  const normalized = stripPromptLeakage(rawContent.trim());
  const variantBSplit = normalized.split(
    /\*{0,2}\s*VARIANT\s+B\s*:?\s*\*{0,2}/i,
  );
  const variantAPart = (variantBSplit[0] || "").trim();
  const variantBPart = (variantBSplit[1] || "").trim();

  function extractSubjectAndBody(block) {
    const subjectMatch = block.match(
      /\*{0,2}\s*SUBJECT\s+LINE\s*:?\s*\*{0,2}\s*\n?\s*([\s\S]*?)(?=\*{0,2}\s*EMAIL\s+BODY\s*:?\s*\*{0,2}|$)/i,
    );
    const bodyMatch = block.match(
      /\*{0,2}\s*EMAIL\s+BODY\s*:?\s*\*{0,2}\s*\n?\s*([\s\S]*?)(?=\*{0,2}\s*SUBJECT\s+LINE\s*:?\s*\*{0,2}|\*{0,2}\s*VARIANT\s+B\s*:?\s*\*{0,2}|\*{0,2}\s*ANALYSIS\s*:?\s*\*{0,2}|$)/i,
    );
    const subject = (subjectMatch?.[1] || "").trim();
    const body = (bodyMatch?.[1] || "").trim();
    if (subject || body) {
      return `Subject: ${subject}\n\n${body}`.trim();
    }
    return block.trim() || "";
  }

  const draftA = extractSubjectAndBody(variantAPart);
  const draftB = extractSubjectAndBody(variantBPart);

  if (!draftA && !draftB) return [rawContent, ""];
  if (!draftA) return [variantAPart || rawContent, draftB];
  if (!draftB) return [draftA, ""];

  return [draftA, draftB];
}

/** Append strict output rules to prompt */
const CRITICAL_OUTPUT_RULES = `

## CRITICAL - FOLLOW EXACTLY
1. Use the LITERAL values from CONTEXT above. If CONTEXT says "Prospect: John, VP at Acme" then write "Hi John" and "at Acme"—NEVER write [Prospect Name], [Prospect Company], [Sender Company], or any bracketed placeholder.
2. Output ONLY these 4 blocks in this exact format—nothing else, no rules, no analysis, no quality check:
**SUBJECT LINE:**
(your actual subject text)
**EMAIL BODY:**
(your actual email body)
**VARIANT B:**
**SUBJECT LINE:**
(different subject for variant B)
**EMAIL BODY:**
(different email body for variant B)`;

const SYSTEM_MESSAGE =
  "You are an expert sales email generator. Output ONLY SUBJECT LINE, EMAIL BODY, and VARIANT B (with its own SUBJECT + BODY). Use the exact prospect name and company from CONTEXT—never [Prospect Name] or [Prospect Company]. No analysis, no rules, no quality check in your response.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    recipientName,
    recipientEmail,
    context,
    goal,
    tone,
    config,
    model,
    formData,
  } = req.body;

  if (!recipientName || !recipientEmail || !goal || !tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    let promptContent;

    if (formData) {
      promptContent = buildEmailPrompt({
        companyName: formData.companyName,
        senderNameTitle: formData.senderNameTitle,
        productService: formData.productService,
        prospectFirstName: formData.prospectFirstName,
        prospectCompany: formData.prospectCompany,
        prospectTitle: formData.prospectTitle,
        ctaType: formData.ctaType || goal,
        tone: formData.tone || tone,
        line3Input: formData.line3Input || "",
        keyDifferentiator: formData.keyDifferentiator || "",
        socialProofClient: formData.socialProofClient || "",
        category: formData.category || "",
        socialProofResult: formData.socialProofResult || "",
        primaryPain: formData.primaryPain || "",
      });
      promptContent += CRITICAL_OUTPUT_RULES;
    } else if (context) {
      promptContent = `Recipient: ${recipientName} <${recipientEmail}>\nContext: ${context}\nGoal: ${goal}\nTone: ${tone}`;
    } else {
      return res.status(400).json({
        error: "Missing required fields: provide either formData or context",
      });
    }

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: promptContent },
      ],
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? 1200,
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    let [draftA, draftB] = parseEmailDrafts(rawContent);

    draftA = cleanDraft(draftA, formData);
    draftB = cleanDraft(draftB, formData);

    res.status(200).json({ drafts: [draftA, draftB] });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate email draft",
    });
  }
}
