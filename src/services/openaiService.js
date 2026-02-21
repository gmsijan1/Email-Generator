// Service for interacting with OpenAI GPT API
import OpenAI from "openai";
import {
  OPENAI_API_KEY,
  OPENAI_MODEL,
  OPENAI_CONFIG,
  USE_MOCK_MODE,
} from "../config/openaiConfig";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, API calls should go through a backend server
});

/**
 * Generate sales email drafts using OpenAI GPT API
 * @param {Object} params - Email generation parameters
 * @param {string} params.recipientName - Name of the email recipient
 * @param {string} params.recipientEmail - Email address of recipient
 * @param {string} params.context - Context about the recipient or situation
 * @param {string} params.goal - Goal of the email (e.g., "Schedule Meeting", "Follow Up")
 * @param {string} params.tone - Desired tone (e.g., "Professional", "Casual", "Friendly")
 * @returns {Promise<Array<string>>} - Array of 1-3 generated email drafts
 */
export async function generateEmailDrafts({
  recipientName,
  recipientEmail,
  context,
  goal,
  tone,
}) {
  try {
    // Validate required fields
    if (!recipientName || !recipientEmail || !context || !goal || !tone) {
      throw new Error("All fields are required for email generation");
    }

    const prompt = `Generate 2 email drafts in plain text only. Do NOT include subject line, analysis, variants, markdown, or bold. Return only the full email body text.

  Recipient Name: ${recipientName}
  Recipient Email: ${recipientEmail}
  Context: ${context}
  Goal: ${goal}
  Tone: ${tone}

  Each draft should:
  - Address the recipient by name
  - Incorporate the provided context naturally
  - Align with the specified goal
  - Match the desired tone
  - Be professional and engaging
  - Include a clear call-to-action
  - Be concise (150-250 words each)

  Return only the email body for each draft, separated by the exact delimiter on its own line:
  <<<DRAFT_SPLIT>>>`;

    // Use mock mode if enabled (for testing without API credits)
    if (USE_MOCK_MODE) {
      console.warn(
        "🎭 MOCK MODE: Generating sample drafts instead of calling OpenAI API",
      );
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
      return generateMockDrafts({
        recipientName,
        recipientEmail,
        context,
        goal,
        tone,
      });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional sales email writer. Generate compelling, personalized sales emails based on the provided context.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: OPENAI_CONFIG.temperature,
      // Ensure we never exceed the model's max_tokens limit (gpt-4o: 16384)
      max_tokens: Math.min(OPENAI_CONFIG.maxTokens, 12000), // Cap at 12k for all drafts combined
    });

    // Extract the generated text
    const generatedText = response.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No response generated from OpenAI");
    }

    // Remove all '---' separators
    let cleanedText = generatedText.replace(/---+/g, "");

    // Split only by the explicit delimiter to avoid paragraph splitting
    let emailDrafts = cleanedText
      .split(/<<<DRAFT_SPLIT>>>/)
      .map((s) => s.trim())
      .filter((d) => d.length > 0);

    // For each draft, remove only lines that are SUBJECT, DRAFT, or markdown headings
    emailDrafts = emailDrafts.map((draft) =>
      draft
        .split(/\r?\n/)
        .filter(
          (line) =>
            !/DRAFT/i.test(line) &&
            !/SUBJECT:/i.test(line) &&
            !/^#+/.test(line) &&
            !/^\s*\*+/.test(line),
        )
        .join("\n")
        .trim(),
    );

    // If delimiter missing, treat entire output as a single draft
    if (emailDrafts.length === 0 && cleanedText.trim().length > 0) {
      return [cleanedText.trim()];
    }

    return emailDrafts.slice(0, 2);
  } catch (error) {
    console.error("Error generating email drafts:", error);

    // Handle specific error types
    if (error.message?.includes("API key")) {
      throw new Error(
        "Invalid OpenAI API key. Please check your configuration.",
      );
    }

    if (error.message?.includes("rate limit")) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }

    throw new Error(`Failed to generate email drafts: ${error.message}`);
  }
}

/**
 * Generate mock email drafts for testing without API
 */
function generateMockDrafts({ recipientName, context, goal }) {
  const drafts = [
    `Subject: ${goal} - Let's Connect

Hi ${recipientName},

I hope this email finds you well. ${context}

I wanted to reach out regarding ${goal.toLowerCase()}. Based on what I know about your work, I believe there could be a great opportunity for us to collaborate.

Would you be available for a brief conversation this week? I'd love to learn more about your current priorities and share some ideas that might be valuable.

Looking forward to connecting!

Best regards`,
    `Subject: Quick Question for ${recipientName}

Hello ${recipientName},

I came across your profile and was impressed by your work. ${context}

I'm reaching out about ${goal.toLowerCase()}. I have some insights that I think could be beneficial for you and your team.

Could we schedule a 15-minute call this week? I promise to be respectful of your time and keep it brief.

Thanks for considering!

Warm regards`,
  ];

  return drafts;
}

/**
 * Regenerate a single email draft with the same parameters
 * @param {Object} params - Same parameters as generateEmailDrafts
 * @returns {Promise<string>} - A single regenerated email draft
 */
export async function regenerateEmailDraft(params) {
  try {
    const drafts = await generateEmailDrafts(params);
    return drafts[0]; // Return just the first draft
  } catch (error) {
    console.error("Error regenerating email draft:", error);
    throw error;
  }
}
