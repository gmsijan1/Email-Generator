// Example React Component using Cloud Functions for Email Generation
import { useState } from "react";
import {
  generateEmailWithCloudFunction,
  generateMultipleEmailsWithCloudFunction,
} from "../services/cloudFunctionService";
import TemporaryNotification from "./TemporaryNotification";

export default function EmailGeneratorExample() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedDrafts, setGeneratedDrafts] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("single"); // "single" or "multiple"

  /**
   * Handle single email generation using Cloud Function
   */
  async function handleGenerateSingleEmail(e) {
    e.preventDefault();

    if (!prompt.trim()) {
      setNotification({ message: "Please enter a prompt", type: "error" });
      return;
    }

    try {
      setNotification(null);
      setLoading(true);

      // Call Cloud Function
      const result = await generateEmailWithCloudFunction(prompt);
      setGeneratedEmail(result);
      setNotification({ message: "Draft generated!", type: "success" });
    } catch (err) {
      console.error("Error generating email:", err);
      setNotification({
        message:
          err.message || "Failed to generate email. Check console for details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle multiple email drafts generation using Cloud Function
   */
  async function handleGenerateMultipleDrafts(e) {
    e.preventDefault();

    if (!prompt.trim()) {
      setNotification({ message: "Please enter a prompt", type: "error" });
      return;
    }

    try {
      setNotification(null);
      setLoading(true);

      // Call Cloud Function with count = 3
      const results = await generateMultipleEmailsWithCloudFunction(prompt, 3);
      setGeneratedDrafts(results);
      setNotification({ message: "Drafts generated!", type: "success" });
    } catch (err) {
      console.error("Error generating drafts:", err);
      setNotification({
        message:
          err.message ||
          "Failed to generate drafts. Check console for details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h1>Email Generator - Cloud Function Example</h1>
      <TemporaryNotification
        message={notification?.message}
        type={notification?.type}
        onHide={() => setNotification(null)}
      />

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("single")}
          style={{
            padding: "10px 20px",
            background: activeTab === "single" ? "#667eea" : "#e2e8f0",
            color: activeTab === "single" ? "white" : "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Single Email
        </button>
        <button
          onClick={() => setActiveTab("multiple")}
          style={{
            padding: "10px 20px",
            background: activeTab === "multiple" ? "#667eea" : "#e2e8f0",
            color: activeTab === "multiple" ? "white" : "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Multiple Drafts
        </button>
      </div>

      {/* Single Email Tab */}
      {activeTab === "single" && (
        <form onSubmit={handleGenerateSingleEmail}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Email Generation Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write a cold outreach email to a VP of Sales at a SaaS company..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                border: "1px solid #e2e8f0",
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
              padding: "12px 24px",
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

          {generatedEmail && (
            <div style={{ marginTop: "24px" }}>
              <h3>Generated Email</h3>
              <div
                style={{
                  background: "#f7fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "16px",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {generatedEmail}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedEmail);
                  setNotification({
                    message: "Copied to clipboard!",
                    type: "success",
                  });
                }}
                style={{
                  marginTop: "12px",
                  padding: "10px 16px",
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </form>
      )}

      {/* Multiple Drafts Tab */}
      {activeTab === "multiple" && (
        <form onSubmit={handleGenerateMultipleDrafts}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Email Generation Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write a cold outreach email to a VP of Sales at a SaaS company..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                border: "1px solid #e2e8f0",
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
              padding: "12px 24px",
              background: loading ? "#ccc" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "Generating..." : "Generate 3 Email Drafts"}
          </button>

          {generatedDrafts.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h3>Generated Email Drafts ({generatedDrafts.length})</h3>
              <div style={{ display: "grid", gap: "20px" }}>
                {generatedDrafts.map((draft, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f7fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "16px",
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>Draft {index + 1}</h4>
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {draft}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(draft);
                        setNotification({
                          message: `Draft ${index + 1} copied!`,
                          type: "success",
                        });
                      }}
                      style={{
                        marginTop: "12px",
                        padding: "8px 12px",
                        background: "#48bb78",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Usage Instructions */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#f7fafc",
          borderRadius: "6px",
        }}
      >
        <h3>How to Use Cloud Functions</h3>
        <p>
          <strong>Setup:</strong>
        </p>
        <ol>
          <li>
            Set OpenAI API key:{" "}
            <code>firebase functions:config:set openai.key="sk-..."</code>
          </li>
          <li>
            Deploy: <code>firebase deploy --only functions</code>
          </li>
          <li>
            Update <code>firebase.js</code> region if needed (currently:
            us-central1)
          </li>
        </ol>
        <p>
          <strong>Benefits of Cloud Functions:</strong>
        </p>
        <ul>
          <li>✅ OpenAI API key never exposed to frontend</li>
          <li>✅ Authentication enforced (only logged-in users)</li>
          <li>✅ Rate limiting and cost control</li>
          <li>✅ Server-side validation and error handling</li>
          <li>✅ Secure API call execution</li>
        </ul>
      </div>
    </div>
  );
}
