// Service for interacting with OpenAI GPT API
import {
  OPENAI_MODEL,
  OPENAI_CONFIG,
  USE_MOCK_MODE,
} from "../config/openaiConfig";

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

    // Use mock mode if enabled (for testing without API credits)
    if (USE_MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
      return generateMockDrafts({
        recipientName,
        recipientEmail,
        context,
        goal,
        tone,
      });
    }

    // Call serverless API route for OpenAI
    const response = await fetch("/api/generate-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientName,
        recipientEmail,
        context,
        goal,
        tone,
        config: OPENAI_CONFIG,
        model: OPENAI_MODEL,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate email drafts");
    }
    const data = await response.json();
    return data.drafts;
  } catch (error) {
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
function generateMockDrafts({ recipientName, goal }) {
  const drafts = [
    `Hi ${recipientName},

I noticed you're leading growth at your company. Most SaaS teams your size lose over half of outbound replies before they ever reach pipeline.

Teams using our outbound framework consistently convert more replies into booked demos without increasing volume.

Happy to share a 3-step teardown we use for SaaS teams running 30–50 demos a month. Worth a quick look?

Best,
Sales Team

Book time here: https://cal.com/demo`,

    `Hey ${recipientName},

Saw you're running outbound at scale. Quick question: how many of your replies actually turn into pipeline?

We help B2B SaaS teams turn 60%+ of replies into qualified demos with a simple framework. No extra volume needed.

Want to see the exact playbook? 12-minute walkthrough available this week.

Cheers,
Sales Team

Schedule: https://cal.com/demo`,
  ];

  return drafts;
}
