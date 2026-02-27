import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { recipientName, recipientEmail, context, goal, tone, config, model } = req.body;

  if (!recipientName || !recipientEmail || !context || !goal || !tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert sales email generator. Generate a concise, effective sales email draft.`,
        },
        {
          role: "user",
          content: `Recipient: ${recipientName} <${recipientEmail}>\nContext: ${context}\nGoal: ${goal}\nTone: ${tone}`,
        },
      ],
      temperature: config?.temperature || 0.7,
      max_tokens: config?.maxTokens || 600,
    });

    const draft = completion.choices[0]?.message?.content || "";
    res.status(200).json({ drafts: [draft] });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate email draft" });
  }
}
