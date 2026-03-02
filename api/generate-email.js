import { OpenAI } from "openai";
import { buildEmailPrompt } from "./emailPromptTemplate.js";

/**
 * Parse raw model output into Variant A and Variant B drafts.
 * Each draft is formatted as "Subject: X\n\nBody" for clean display.
 */
function parseEmailDrafts(rawContent) {
  if (!rawContent || !rawContent.trim()) {
    return ["", ""];
  }

  const normalized = rawContent.trim();

  // Split by VARIANT B to separate the two variants
  const variantBSplit = normalized.split(/\*\*VARIANT B:\*\*/i);
  const variantAPart = (variantBSplit[0] || "").trim();
  const variantBPart = (variantBSplit[1] || "").trim();

  function extractSubjectAndBody(block) {
    const subjectMatch = block.match(
      /\*\*SUBJECT LINE:\*\*\s*\n?\s*([\s\S]*?)(?=\*\*EMAIL BODY:\*\*|$)/i,
    );
    const bodyMatch = block.match(
      /\*\*EMAIL BODY:\*\*\s*\n?\s*([\s\S]*?)(?=\*\*SUBJECT LINE:\*\*|\*\*VARIANT B:\*\*|\*\*ANALYSIS:\*\*|$)/i,
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

  // Fallback: if parsing fails, put full content in draft A
  if (!draftA && !draftB) {
    return [rawContent, ""];
  }
  if (!draftA) return [variantAPart || rawContent, draftB];
  if (!draftB) return [draftA, ""];

  return [draftA, draftB];
}

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
      // Build prompt on server from form data (hides template from browser)
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
    } else if (context) {
      // Fallback: accept pre-built context (legacy)
      promptContent = `Recipient: ${recipientName} <${recipientEmail}>\nContext: ${context}\nGoal: ${goal}\nTone: ${tone}`;
    } else {
      return res.status(400).json({
        error: "Missing required fields: provide either formData or context",
      });
    }

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert sales email generator. Output only the requested email format: SUBJECT LINE, EMAIL BODY, and VARIANT B. Do not add analysis, bullets, or explanations.`,
        },
        {
          role: "user",
          content: promptContent,
        },
      ],
      temperature: config?.temperature || 0.7,
      max_tokens: config?.maxTokens || 1200,
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const [draftA, draftB] = parseEmailDrafts(rawContent);
    res.status(200).json({ drafts: [draftA, draftB] });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate email draft",
    });
  }
}
