/**
 * MINIMAL Cloud Function Example
 *
 * This component demonstrates:
 * - Form input for email prompt
 * - Calling Firebase Cloud Function using httpsCallable
 * - Handling async/await with error handling
 * - Displaying response below the form
 *
 * Uses the existing firebase.js and generateEmail Cloud Function
 */

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export default function MinimalEmailGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate input
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setError("");
      setGeneratedEmail("");
      setLoading(true);

      // ============================================
      // CALL CLOUD FUNCTION using httpsCallable
      // ============================================
      // Reference the "generateEmail" Cloud Function
      const generateEmail = httpsCallable(functions, "generateEmail");

      // Call the function with prompt data
      // This is an async operation that calls the Firebase backend
      const response = await generateEmail({ prompt });

      // ============================================
      // HANDLE RESPONSE from Cloud Function
      // ============================================
      // Response structure: { data: { success: bool, result: string } }
      if (response.data.success) {
        // Successfully generated email - display result
        setGeneratedEmail(response.data.result);
      } else {
        // Cloud Function returned error
        setError("Failed to generate email");
      }
    } catch (err) {
      // Network error, authentication error, or Cloud Function error
      console.error("Cloud Function Error:", err);

      // Set user-friendly error message
      if (err.code === "unauthenticated") {
        setError("You must be logged in to generate emails");
      } else if (err.code === "invalid-argument") {
        setError(err.message || "Invalid prompt provided");
      } else {
        setError(err.message || "Failed to generate email");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <h1>Email Generator</h1>
      <p style={{ color: "#666" }}>
        Enter a prompt below to generate an email using OpenAI (via Cloud
        Function)
      </p>

      {/* FORM INPUT */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="prompt"
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Email Prompt *
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Write a professional cold outreach email to a VP of Sales at a SaaS company offering email automation..."
            disabled={loading}
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "14px",
              resize: "vertical",
              backgroundColor: loading ? "#f5f5f5" : "white",
              cursor: loading ? "not-allowed" : "text",
            }}
          />
          <small style={{ color: "#999", display: "block", marginTop: "6px" }}>
            Be specific about the email purpose, recipient, and tone
          </small>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          style={{
            padding: "12px 24px",
            background: loading || !prompt.trim() ? "#ccc" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) =>
            !loading && prompt.trim() && (e.target.style.background = "#5568d3")
          }
          onMouseOut={(e) =>
            !loading && prompt.trim() && (e.target.style.background = "#667eea")
          }
        >
          {loading ? "⏳ Generating..." : "✨ Generate Email"}
        </button>
      </form>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fee8e8",
            border: "1px solid #f5c6c6",
            borderRadius: "6px",
            color: "#c33",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* RESPONSE DISPLAY */}
      {generatedEmail && (
        <div
          style={{
            padding: "16px",
            background: "#f0f7ff",
            border: "1px solid #cce7ff",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#333" }}>Generated Email</h3>

          {/* EMAIL CONTENT */}
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "4px",
              marginBottom: "12px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#333",
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #e0e0e0",
            }}
          >
            {generatedEmail}
          </div>

          {/* COPY TO CLIPBOARD BUTTON */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedEmail);
              alert("Email copied to clipboard!");
            }}
            style={{
              padding: "10px 16px",
              background: "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
            onMouseOver={(e) => (e.target.style.background = "#38a169")}
            onMouseOut={(e) => (e.target.style.background = "#48bb78")}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}

      {/* INFO BOX */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          background: "#f9f9f9",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#666",
          lineHeight: "1.6",
        }}
      >
        <h4 style={{ marginTop: 0 }}>How it works:</h4>
        <ol>
          <li>
            <strong>User logs in</strong> (Firebase Authentication)
          </li>
          <li>
            <strong>Form submission</strong> triggers <code>handleSubmit</code>
          </li>
          <li>
            <strong>httpsCallable</strong> calls the <code>generateEmail</code>{" "}
            Cloud Function on Firebase backend
          </li>
          <li>
            <strong>Cloud Function</strong> sends prompt to OpenAI GPT-4o-mini
            API (API key kept secure on backend)
          </li>
          <li>
            <strong>Response</strong> is returned and displayed in the component
          </li>
        </ol>

        <h4 style={{ marginTop: "16px" }}>Key Code Patterns:</h4>
        <pre
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "12px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {`// 1. Import httpsCallable and functions
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

// 2. Create callable function reference
const generateEmail = httpsCallable(functions, "generateEmail");

// 3. Call with async/await
const response = await generateEmail({ prompt });

// 4. Handle response
if (response.data.success) {
  setGeneratedEmail(response.data.result);
}`}
        </pre>
      </div>
    </div>
  );
}
