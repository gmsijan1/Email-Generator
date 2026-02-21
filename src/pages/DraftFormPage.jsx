// Draft Form Page Component - Form to create new email drafts with AI
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { generateEmailDrafts } from "../services/openaiService";
import { buildEmailPrompt } from "../config/emailPromptTemplate";
import "./DraftFormPage.css";

export default function DraftFormPage() {
  // Required Fields (Must Have)
  const [prospectFirstName, setProspectFirstName] = useState("");
  const [prospectCompany, setProspectCompany] = useState("");
  const [prospectTitle, setProspectTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [senderNameTitle, setSenderNameTitle] = useState("");
  const [productService, setProductService] = useState("");
  const [ctaType, setCtaType] = useState("Cold Outreach");
  const [tone, setTone] = useState("Confident but conversational");

  // Strongly Recommended Fields (90% scenarios work with defaults)
  const [keyDifferentiator, setKeyDifferentiator] = useState("");
  const [contextTrigger, setContextTrigger] = useState("");
  const [freeValueOffer, setFreeValueOffer] = useState("");
  const [socialProofClient, setSocialProofClient] = useState("");

  // Optional Fields (Enhance quality)
  const [category, setCategory] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [currentWorkflow, setCurrentWorkflow] = useState("");
  const [scarcity, setScarcity] = useState("");
  const [socialProofResult, setSocialProofResult] = useState("");

  // New fields for full prompt standard
  const [primaryPain, setPrimaryPain] = useState("");
  const [socialProofStyle, setSocialProofStyle] = useState("");
  const [authorityLine, setAuthorityLine] = useState("");
  const [extraPersonalization, setExtraPersonalization] = useState("");

  // UI states
  const [generatedDrafts, setGeneratedDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Goal options for dropdown - Sales and deal focused
  const ctaTypeOptions = [
    "Cold Outreach",
    "Follow-Up",
    "Demo Request",
    "Deal Closing",
    "Post-Meeting Thank You",
  ];

  // Tone options for dropdown
  const toneOptions = [
    "Confident but conversational",
    "Direct and data-driven",
    "Warm and consultative",
    "Professional",
    "Casual",
    "Enthusiastic",
  ];

  const ctaOptions = [
    "Interest-based (for cold outreach)",
    "Specific date-time (for warm leads)",
  ];

  /**
   * Handle form submission to generate drafts
   */
  async function handleGenerate(e) {
    e.preventDefault();

    // Validation - Check all required fields
    const missingFields = [];

    if (!prospectFirstName.trim()) missingFields.push("prospect_first_name");
    if (!prospectCompany.trim()) missingFields.push("prospect_company");
    if (!prospectTitle.trim()) missingFields.push("prospect_title");
    if (!companyName.trim()) missingFields.push("company_name");
    if (!senderNameTitle.trim()) missingFields.push("sender_name_title");
    if (!productService.trim()) missingFields.push("product_service");

    if (missingFields.length > 0) {
      return setError(
        `Missing required context fields: ${missingFields.join(", ")}`,
      );
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      // Build comprehensive context using imported prompt template
      const prompt = buildEmailPrompt({
        companyName,
        senderNameTitle,
        productService,
        prospectFirstName,
        prospectCompany,
        prospectTitle,
        ctaType,
        tone,
        keyDifferentiator,
        contextTrigger,
        freeValueOffer,
        socialProofClient,
        category,
        targetDepartment,
        currentWorkflow,
        socialProofResult,
        scarcity,
        primaryPain,
        socialProofStyle,
        authorityLine,
        extraPersonalization,
      });

      // Only pass prompt to OpenAI, never display it directly
      const drafts = await generateEmailDrafts({
        recipientName: prospectFirstName,
        recipientEmail: `${prospectFirstName.toLowerCase()}@${prospectCompany.toLowerCase().replace(/\s+/g, "")}.com`,
        context: prompt, // Only used as OpenAI user message
        goal: ctaType,
        tone,
      });

      // Only display the OpenAI output (never the prompt)
      setGeneratedDrafts(drafts);
      setSuccess(
        `Generated ${drafts.length} email draft${drafts.length > 1 ? "s" : ""} with A/B variants`,
      );
    } catch (error) {
      console.error("Error generating drafts:", error);
      setError(
        error.message || "Failed to generate email drafts. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save a specific draft to Firestore
   */
  async function handleSaveDraft(draftText, index) {
    if (!currentUser) {
      setError("You must be logged in to save drafts");
      return;
    }

    try {
      setError("");
      setSuccess("");

      // Add draft to Firestore with all fields for regeneration capability
      await addDoc(collection(db, "drafts"), {
        userId: currentUser.uid,
        // Required fields
        prospectFirstName,
        prospectCompany,
        prospectTitle,
        companyName,
        senderNameTitle,
        productService,
        ctaType,
        tone,
        // Strongly recommended fields
        keyDifferentiator: keyDifferentiator || null,
        contextTrigger: contextTrigger || null,
        freeValueOffer: freeValueOffer || null,
        socialProofClient: socialProofClient || null,
        // Optional fields
        category: category || null,
        targetDepartment: targetDepartment || null,
        currentWorkflow: currentWorkflow || null,
        scarcity: scarcity || null,
        socialProofResult: socialProofResult || null,
        // Generated output
        generatedText: draftText,
        timestamp: serverTimestamp(),
      });

      setSuccess(`Draft ${index + 1} saved successfully!`);

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error saving draft:", error);
      setError("Failed to save draft. Please try again.");
    }
  }

  return (
    <div className="draft-form-container">
      {/* Header */}
      <header className="form-header">
        <button onClick={() => navigate("/dashboard")} className="back-button">
          <svg
            className="icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>
        <h1>Create Email Draft</h1>
      </header>

      <main className="form-main">
        {/* Messages */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="alert">
            {success}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="draft-form">
          {/* Required Fields Section */}
          <div className="form-section">
            <h2>Must Have Input</h2>
            <p className="section-note">
              All 7 fields required for AI generation
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prospectFirstName">
                  Prospect First Name *{" "}
                  <span className="field-note">(30%+ reply rate lift)</span>
                </label>
                <input
                  type="text"
                  id="prospectFirstName"
                  value={prospectFirstName}
                  onChange={(e) => setProspectFirstName(e.target.value)}
                  placeholder="John"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prospectCompany">
                  Prospect Company *{" "}
                  <span className="field-note">
                    (Required for subject line)
                  </span>
                </label>
                <input
                  type="text"
                  id="prospectCompany"
                  value={prospectCompany}
                  onChange={(e) => setProspectCompany(e.target.value)}
                  placeholder="Acme Corp"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prospectTitle">
                  Prospect Title *{" "}
                  <span className="field-note">(Confirms decision maker)</span>
                </label>
                <input
                  type="text"
                  id="prospectTitle"
                  value={prospectTitle}
                  onChange={(e) => setProspectTitle(e.target.value)}
                  placeholder="Head of Sales / VP / Founder"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">
                  Your Company Name *{" "}
                  <span className="field-note">(Sender credibility)</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company Inc."
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="senderNameTitle">
                Your Name & Title *{" "}
                <span className="field-note">(Real person signature)</span>
              </label>
              <input
                type="text"
                id="senderNameTitle"
                value={senderNameTitle}
                onChange={(e) => setSenderNameTitle(e.target.value)}
                placeholder="Jane Smith, Head of Sales"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="productService">
                Product/Service (1 sentence) *{" "}
                <span className="field-note">(What you're selling)</span>
              </label>
              <input
                type="text"
                id="productService"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                placeholder="AI-powered email automation platform for B2B sales teams"
                disabled={loading}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ctaType">
                  CTA Type *{" "}
                  <span className="field-note">
                    (Determines email structure)
                  </span>
                </label>
                <select
                  id="ctaType"
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  disabled={loading}
                  required
                >
                  {ctaTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tone">Tone *</label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={loading}
                  required
                >
                  {toneOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Strongly Recommended Fields Section */}
          <div className="form-section">
            <h2>Strongly Recommended Input</h2>
            <p className="section-note">
              90% of scenarios work without these - AI uses smart defaults if
              empty
            </p>

            <div className="form-group">
              <label htmlFor="keyDifferentiator">
                Key Differentiator{" "}
                <span className="field-note default-text">
                  (Default: "built specifically for SaaS outbound")
                </span>
              </label>
              <input
                type="text"
                id="keyDifferentiator"
                value={keyDifferentiator}
                onChange={(e) => setKeyDifferentiator(e.target.value)}
                placeholder="Only platform with native CRM integration and predictive send-time optimization"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contextTrigger">
                Context/Trigger Event{" "}
                <span className="field-note default-text">
                  (Default: "hiring SDRs or pipeline growth focus")
                </span>
              </label>
              <input
                type="text"
                id="contextTrigger"
                value={contextTrigger}
                onChange={(e) => setContextTrigger(e.target.value)}
                placeholder="Just raised Series B, launched new product line, posted about hiring challenges"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="freeValueOffer">
                  Free Value Offer{" "}
                  <span className="field-note default-text">
                    (Default: "free 3-email sequence teardown")
                  </span>
                </label>
                <input
                  type="text"
                  id="freeValueOffer"
                  value={freeValueOffer}
                  onChange={(e) => setFreeValueOffer(e.target.value)}
                  placeholder="Free audit, custom benchmark report"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="socialProofClient">
                  Social Proof Client{" "}
                  <span className="field-note default-text">
                    (Default: "similar SaaS companies")
                  </span>
                </label>
                <input
                  type="text"
                  id="socialProofClient"
                  value={socialProofClient}
                  onChange={(e) => setSocialProofClient(e.target.value)}
                  placeholder="Salesforce, HubSpot"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="form-section">
            <h2>Optional Input (Enhance Quality)</h2>
            <p className="section-note">
              Leave blank for generic approach - fill for hyper-personalization
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  Category{" "}
                  <span className="field-note default-text">
                    (Default: "SaaS outbound optimization")
                  </span>
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="E-commerce automation, Healthcare compliance"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetDepartment">
                  Target Department{" "}
                  <span className="field-note default-text">
                    (Default: "Sales/SDR")
                  </span>
                </label>
                <input
                  type="text"
                  id="targetDepartment"
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  placeholder="Marketing, Customer Success"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="currentWorkflow">
                Current Workflow{" "}
                <span className="field-note default-text">
                  (Default: "HubSpot + manual emails")
                </span>
              </label>
              <input
                type="text"
                id="currentWorkflow"
                value={currentWorkflow}
                onChange={(e) => setCurrentWorkflow(e.target.value)}
                placeholder="Outreach + Salesforce, manual prospecting"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="socialProofResult">
                  Social Proof Result{" "}
                  <span className="field-note default-text">
                    (Default: "higher demo rates")
                  </span>
                </label>
                <input
                  type="text"
                  id="socialProofResult"
                  value={socialProofResult}
                  onChange={(e) => setSocialProofResult(e.target.value)}
                  placeholder="34% cut in churn, 2x pipeline growth"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="scarcity">
                  Scarcity Element{" "}
                  <span className="field-note default-text">
                    (Default: none)
                  </span>
                </label>
                <input
                  type="text"
                  id="scarcity"
                  value={scarcity}
                  onChange={(e) => setScarcity(e.target.value)}
                  placeholder="Only onboarding 5 new clients this quarter"
                  disabled={loading}
                />
              </div>
            </div>

            {/* New fields for full prompt standard */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="primaryPain">
                  Primary Pain Point
                  <span className="field-note default-text">
                    (PAS structure, required for best results)
                  </span>
                </label>
                <input
                  type="text"
                  id="primaryPain"
                  value={primaryPain}
                  onChange={(e) => setPrimaryPain(e.target.value)}
                  placeholder="e.g. replies stuck under 5%"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="socialProofStyle">
                  Social Proof Style
                  <span className="field-note default-text">
                    (e.g. testimonial, demo improvement, case study)
                  </span>
                </label>
                <input
                  type="text"
                  id="socialProofStyle"
                  value={socialProofStyle}
                  onChange={(e) => setSocialProofStyle(e.target.value)}
                  placeholder="case study + metrics"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="authorityLine">
                  Authority Line
                  <span className="field-note default-text">
                    (Optional, for signature line)
                  </span>
                </label>
                <input
                  type="text"
                  id="authorityLine"
                  value={authorityLine}
                  onChange={(e) => setAuthorityLine(e.target.value)}
                  placeholder="B2B SaaS outbound expert"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="extraPersonalization">
                  Extra Personalization
                  <span className="field-note default-text">
                    (Optional, for subject/personalization triggers)
                  </span>
                </label>
                <input
                  type="text"
                  id="extraPersonalization"
                  value={extraPersonalization}
                  onChange={(e) => setExtraPersonalization(e.target.value)}
                  placeholder="e.g. recent LinkedIn post, mutual connection"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating Elite Sales Emails...
              </>
            ) : (
              <>
                <svg
                  className="icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate 3 A/B Variants
              </>
            )}
          </button>
        </form>

        {/* Generated Drafts Display */}
        {generatedDrafts.length > 0 && (
          <div className="drafts-section">
            <h2>Generated Email Drafts</h2>
            <p className="drafts-subtitle">
              Choose the draft that best fits your needs and save it
            </p>

            <div className="drafts-list">
              {generatedDrafts.map((draft, index) => (
                <div key={index} className="draft-preview">
                  <div className="draft-preview-header">
                    <h3>Draft {index + 1}</h3>
                    <button
                      onClick={() => handleSaveDraft(draft, index)}
                      className="btn btn-save"
                      type="button"
                    >
                      <svg
                        className="icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save Draft
                    </button>
                  </div>
                  <div className="draft-preview-content">
                    <pre>{draft}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
