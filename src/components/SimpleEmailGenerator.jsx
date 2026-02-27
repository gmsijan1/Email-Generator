/**
 * Simple Firebase + Cloud Function Integration Example
 *
 * Shows:
 * 1. Using useCloudFunction hook for cleaner code
 * 2. Handling loading and error states
 * 3. Calling generateEmail Cloud Function
 * 4. Displaying results
 */

import { useState } from "react";
import { useCloudFunction } from "../hooks/useCloudFunction";
import TemporaryNotification from "./TemporaryNotification";

export default function SimpleEmailGenerator() {
  const [prompt, setPrompt] = useState("");
  const {
    execute: generateEmail,
    loading,
    result,
  } = useCloudFunction("generateEmail");
  const [notification, setNotification] = useState(null);

  async function handleGenerateEmail(e) {
    e.preventDefault();

    if (!prompt.trim()) {
      setNotification({
        message: "Please enter a prompt",
        type: "error",
      });
      return;
    }

    try {
      // Call Cloud Function with just the prompt
      await generateEmail({ prompt });
      setNotification({ message: "Draft generated!", type: "success" });
    } catch (err) {
      // Error is already set in hook, just need to catch for form handling
      console.error("Generation failed:", err);
      setNotification({
        message: err?.message || "Failed to generate email.",
        type: "error",
      });
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Email Generator (Cloud Function)</h2>

      <TemporaryNotification
        message={notification?.message}
        type={notification?.type}
        onHide={() => setNotification(null)}
      />

      {/* Form */}
      <form onSubmit={handleGenerateEmail}>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="prompt"
            style={{ display: "block", marginBottom: "8px" }}
          >
            Email Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a cold outreach email to a VP of Sales..."
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              fontFamily: "inherit",
            }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: loading ? "#ccc" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          {loading ? "Generating..." : "Generate Email"}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Email</h3>
          <div
            style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "16px",
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            {result.result || result}
          </div>

          {/* Copy Button */}
          <button
            onClick={() => {
              const text = result.result || result;
              navigator.clipboard.writeText(text);
              setNotification({
                message: "Copied to clipboard!",
                type: "success",
              });
            }}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              background: "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Info */}
      <div
        style={{
          marginTop: "40px",
          padding: "16px",
          background: "#f0f7ff",
          borderRadius: "6px",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <h4 style={{ marginTop: 0 }}>How this works:</h4>
        <ol>
          <li>
            <strong>Firebase Auth:</strong> User must be logged in (handled by
            PrivateRoute)
          </li>
          <li>
            <strong>Cloud Function:</strong> Calls <code>generateEmail</code>{" "}
            function
          </li>
          <li>
            <strong>OpenAI:</strong> GPT-4o-mini generates the email (API key
            secure on backend)
          </li>
          <li>
            <strong>Response:</strong> Generated email returned to React
            component
          </li>
        </ol>

        <h4>Integration Pattern:</h4>
        <pre
          style={{
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "12px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {`import { useCloudFunction } from "../hooks/useCloudFunction";

// In your component:
const { execute, loading, error, result } = 
  useCloudFunction("generateEmail");

// Call it:
await execute({ prompt: "Your prompt here" });

// Handle result.result or result`}
        </pre>
      </div>
    </div>
  );
}
