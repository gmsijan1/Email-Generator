// OpenAI API configuration
// API key from environment variable
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Model configuration
export const OPENAI_MODEL = "gpt-4o";

// Mock mode - Set to true to use sample drafts instead of calling OpenAI API
// Useful for testing without API credits
export const USE_MOCK_MODE = false;

// Default configuration for API calls
export const OPENAI_CONFIG = {
  temperature: 0.7, // Controls creativity (0-1)
  maxTokens: 6000, // Maximum length of generated email (gpt-4o supports up to 128k context, but 12k is safe for most use cases)
};
