import { OpenAI } from "openai";
import { buildEmailPrompt } from "./emailPromptTemplate.js";

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
          content: `You are an expert sales email generator. Generate a concise, effective sales email draft.`,
        },
        {
          role: "user",
          content: promptContent,
        },
      ],
      temperature: config?.temperature || 0.7,
      max_tokens: config?.maxTokens || 600,
    });

    const draft = completion.choices[0]?.message?.content || "";
    res.status(200).json({ drafts: [draft] });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate email draft",
    });
  }
}
