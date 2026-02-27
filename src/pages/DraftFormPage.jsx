// Draft Form Page Component - Fanthom MVP with 2-step onboarding flow
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/useAuth";
import { generateEmailDrafts } from "../services/openaiService";
import {
  buildEmailPrompt,
  inferPrimaryPain,
  inferCategory,
} from "../config/emailPromptTemplate";
import TemporaryNotification from "../components/TemporaryNotification";
import "./DraftFormPage.css";
// import CreditBalanceDisplay from "../components/CreditBalanceDisplay";

const REQUIRED_LIMITS = {
  companyName: 50,
  prospectFirstName: 30,
  prospectCompany: 50,
  prospectTitle: 70,
  senderNameTitle: 50,
  productService: 200,
};

const OPTIONAL_LIMITS = {
  keyDifferentiator: 150,
  primaryPain: 120,
  socialProofClient: 60,
  socialProofResult: 90,
  line3Input: 60,
};

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, "");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeName(value) {
  return normalizeWhitespace(stripHtml(value)).replace(/[^a-zA-Z\s'-]/g, "");
}

function sanitizeCompany(value) {
  return normalizeWhitespace(stripHtml(value)).replace(/[<>#]/g, "");
}

function sanitizePlainText(value) {
  return normalizeWhitespace(stripHtml(value)).replace(/[<>#{}]/g, "");
}

function hasMultipleSentences(value) {
  const matches = value.match(/[.!?]/g) || [];
  return matches.length > 1;
}

export default function DraftFormPage() {
  // Step 1: Must-Have Required Fields
  // Credit balance display
  // ...existing code...
  const [companyName, setCompanyName] = useState("");
  const [prospectFirstName, setProspectFirstName] = useState("");
  const [prospectCompany, setProspectCompany] = useState("");
  const [prospectTitle, setProspectTitle] = useState("");
  const [senderNameTitle, setSenderNameTitle] = useState("");
  const [productService, setProductService] = useState("");
  const [ctaType, setCtaType] = useState("Cold Outreach");

  // Step 2: Strongly Recommended Fields
  const [keyDifferentiator, setKeyDifferentiator] = useState("");
  const [primaryPain, setPrimaryPain] = useState("");
  const [socialProofClient, setSocialProofClient] = useState("");

  // Optional fields (stored but used with inference)
  const [socialProofResult, setSocialProofResult] = useState("");

  // Signature line 3 input
  const [line3Input, setLine3Input] = useState("");
  const [line3WordCount, setLine3WordCount] = useState(0);

  // Word counts for other fields
  const [differentiatorWordCount, setDifferentiatorWordCount] = useState(0);
  const [painWordCount, setPainWordCount] = useState(0);
  const [socialProofClientWordCount, setSocialProofClientWordCount] =
    useState(0);
  const [socialProofResultWordCount, setSocialProofResultWordCount] =
    useState(0);

  // Character counts for optional fields
  const [keyDifferentiatorCharCount, setKeyDifferentiatorCharCount] =
    useState(0);
  const [primaryPainCharCount, setPrimaryPainCharCount] = useState(0);
  const [socialProofClientCharCount, setSocialProofClientCharCount] =
    useState(0);
  const [socialProofResultCharCount, setSocialProofResultCharCount] =
    useState(0);
  const [line3CharCount, setLine3CharCount] = useState(0);

  // Character counts for required fields
  const [companyNameCharCount, setCompanyNameCharCount] = useState(0);
  const [prospectFirstNameCharCount, setProspectFirstNameCharCount] =
    useState(0);
  const [prospectCompanyCharCount, setProspectCompanyCharCount] = useState(0);
  const [prospectTitleCharCount, setProspectTitleCharCount] = useState(0);
  const [senderNameTitleCharCount, setSenderNameTitleCharCount] = useState(0);
  const [productServiceCharCount, setProductServiceCharCount] = useState(0);

  // UI states
  const [step, setStep] = useState(1); // Step 1: Must-Have | Step 2: Recommended | Step 3: Generating | Step 4: Results
  const [generatedDrafts, setGeneratedDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [savedDraftIndexes, setSavedDraftIndexes] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // CTA Type options for dropdown
  const ctaTypeOptions = [
    "Cold Outreach",
    "Follow-Up",
    "Demo Request",
    "Deal Closing",
  ];

  /**
   * Step 1 → Step 2: Proceed to optional fields after validating must-have
   */
  function handleProceedToStep2() {
    const missingFields = [];
    const lengthErrors = [];

    const sanitizedCompanyName = sanitizeCompany(companyName);
    const sanitizedProspectFirstName = sanitizeName(prospectFirstName);
    const sanitizedProspectCompany = sanitizeCompany(prospectCompany);
    const sanitizedProspectTitle = sanitizePlainText(prospectTitle);
    const sanitizedSenderNameTitle = sanitizePlainText(senderNameTitle);
    const sanitizedProductService = sanitizePlainText(productService);
    const sanitizedKeyDifferentiator = sanitizePlainText(keyDifferentiator);

    setCompanyName(sanitizedCompanyName);
    setProspectFirstName(sanitizedProspectFirstName);
    setProspectCompany(sanitizedProspectCompany);
    setProspectTitle(sanitizedProspectTitle);
    setSenderNameTitle(sanitizedSenderNameTitle);
    setProductService(sanitizedProductService);
    setKeyDifferentiator(sanitizedKeyDifferentiator);
    setCompanyNameCharCount(sanitizedCompanyName.length);
    setProspectFirstNameCharCount(sanitizedProspectFirstName.length);
    setProspectCompanyCharCount(sanitizedProspectCompany.length);
    setProspectTitleCharCount(sanitizedProspectTitle.length);
    setSenderNameTitleCharCount(sanitizedSenderNameTitle.length);
    setProductServiceCharCount(sanitizedProductService.length);
    setKeyDifferentiatorCharCount(sanitizedKeyDifferentiator.length);

    if (!sanitizedCompanyName) missingFields.push("Your Company Name");
    if (!sanitizedProspectFirstName) missingFields.push("Prospect First Name");
    if (!sanitizedProspectCompany) missingFields.push("Prospect Company");
    if (!sanitizedSenderNameTitle) missingFields.push("Your Name & Title");
    if (!sanitizedProductService) missingFields.push("Product/Service");
    if (!sanitizedKeyDifferentiator) missingFields.push("Key Differentiator");

    if (sanitizedCompanyName.length > REQUIRED_LIMITS.companyName)
      lengthErrors.push("Your Company Name must be 50 characters or less");
    if (sanitizedProspectFirstName.length > REQUIRED_LIMITS.prospectFirstName)
      lengthErrors.push("Prospect First Name must be 30 characters or less");
    if (sanitizedProspectCompany.length > REQUIRED_LIMITS.prospectCompany)
      lengthErrors.push("Prospect Company must be 50 characters or less");
    if (sanitizedProspectTitle.length > REQUIRED_LIMITS.prospectTitle)
      lengthErrors.push("Prospect Title must be 70 characters or less");
    if (sanitizedSenderNameTitle.length > REQUIRED_LIMITS.senderNameTitle)
      lengthErrors.push("Your Name & Title must be 50 characters or less");
    if (sanitizedProductService.length > REQUIRED_LIMITS.productService)
      lengthErrors.push("Product/Service must be 200 characters or less");
    if (hasMultipleSentences(sanitizedProductService))
      lengthErrors.push("Product/Service should be a single sentence");
    if (sanitizedKeyDifferentiator.length > OPTIONAL_LIMITS.keyDifferentiator)
      lengthErrors.push("Key Differentiator must be 150 characters or less");
    if (differentiatorWordCount > 25)
      lengthErrors.push("Key Differentiator must be 25 words or less");

    if (missingFields.length > 0) {
      setNotification({
        message: `Please fill in: ${missingFields.join(", ")}`,
        type: "error",
      });
      return;
    }

    if (lengthErrors.length > 0) {
      setNotification({
        message: `Please fix the following: ${lengthErrors.join(", ")}`,
        type: "error",
      });
      return;
    }

    setNotification(null);
    setStep(2);
  }

  /**
   * Step 2 → Step 3 → Step 4: Generate 2 drafts with inferred values
   */
  async function handleGenerate(e) {
    e.preventDefault();

    // Validate word counts before generating
    const errors = [];

    if (line3WordCount > 10) {
      errors.push("Signature 3rd Line must be 10 words or less");
    }

    if (differentiatorWordCount > 25) {
      errors.push("Key Differentiator must be 25 words or less");
    }

    if (keyDifferentiatorCharCount > OPTIONAL_LIMITS.keyDifferentiator) {
      errors.push("Key Differentiator must be 150 characters or less");
    }

    if (painWordCount > 20) {
      errors.push("Primary Pain Point must be 20 words or less");
    }

    if (primaryPainCharCount > OPTIONAL_LIMITS.primaryPain) {
      errors.push("Primary Pain Point must be 120 characters or less");
    }

    if (socialProofClientWordCount > 10) {
      errors.push("Social Proof Client must be 10 words or less");
    }

    if (socialProofClientCharCount > OPTIONAL_LIMITS.socialProofClient) {
      errors.push("Social Proof Client must be 60 characters or less");
    }

    if (socialProofResultWordCount > 15) {
      errors.push("Social Proof Result must be 15 words or less");
    }

    if (socialProofResultCharCount > OPTIONAL_LIMITS.socialProofResult) {
      errors.push("Social Proof Result must be 90 characters or less");
    }

    if (line3CharCount > OPTIONAL_LIMITS.line3Input) {
      errors.push("Signature 3rd Line must be 60 characters or less");
    }

    if (errors.length > 0) {
      setNotification({
        message: `Please fix the following: ${errors.join(", ")}`,
        type: "error",
      });
      return;
    }

    // Deduct credits before generating (always, even in mock mode)
    try {
      setNotification(null);
      setLoading(true);

      const { deductCredits, getCreditBalance } =
        await import("../services/creditService");
      // Check balance first
      const balance = await getCreditBalance(currentUser.uid);
      if (balance < 2) {
        setNotification({
          message: "Insufficient credits. Please purchase more.",
          type: "error",
        });
        setLoading(false);
        return;
      }
      try {
        await deductCredits(currentUser.uid, 2, "email_generation");
      } catch (creditError) {
        setNotification({
          message:
            creditError.message ||
            "Insufficient credits. Please purchase more.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setStep(3); // Show spinner

      // ...existing code...
      const sanitizedCompanyName = sanitizeCompany(companyName);
      const sanitizedProspectFirstName = sanitizeName(prospectFirstName);
      const sanitizedProspectCompany = sanitizeCompany(prospectCompany);
      const sanitizedProspectTitle = sanitizePlainText(prospectTitle);
      const sanitizedSenderNameTitle = sanitizePlainText(senderNameTitle);
      const sanitizedProductService = sanitizePlainText(productService);
      const sanitizedLine3Input = sanitizePlainText(line3Input);
      const sanitizedKeyDifferentiator = sanitizePlainText(keyDifferentiator);
      const sanitizedPrimaryPain = sanitizePlainText(primaryPain);
      const sanitizedSocialProofClient = sanitizePlainText(socialProofClient);
      const sanitizedSocialProofResult = sanitizePlainText(socialProofResult);

      const effectiveCategory = inferCategory(sanitizedProductService);
      const effectivePrimaryPain =
        sanitizedPrimaryPain ||
        inferPrimaryPain({
          prospectTitle: sanitizedProspectTitle,
        });

      // Build comprehensive context using imported prompt template
      const prompt = buildEmailPrompt({
        companyName: sanitizedCompanyName,
        senderNameTitle: sanitizedSenderNameTitle,
        productService: sanitizedProductService,
        prospectFirstName: sanitizedProspectFirstName,
        prospectCompany: sanitizedProspectCompany,
        prospectTitle: sanitizedProspectTitle,
        ctaType,
        tone: "Confident and professional",
        line3Input: sanitizedLine3Input,
        keyDifferentiator: sanitizedKeyDifferentiator,
        socialProofClient: sanitizedSocialProofClient,
        category: effectiveCategory,
        socialProofResult: sanitizedSocialProofResult,
        primaryPain: effectivePrimaryPain,
      });

      // Generate 2 drafts (modified from 3)
      const drafts = await generateEmailDrafts({
        recipientName: sanitizedProspectFirstName,
        recipientEmail: `${sanitizedProspectFirstName.toLowerCase()}@${sanitizedProspectCompany.toLowerCase().replace(/\s+/g, "")}.com`,
        context: prompt,
        goal: ctaType,
        tone: "Confident but conversational",
      });

      // Take only first 2 drafts
      const twoLatestDrafts = drafts.slice(0, 2);
      setGeneratedDrafts(twoLatestDrafts);
      setNotification({
        message: `Drafts generated for ${companyName}. Choose your favorite and save.`,
        type: "success",
      });
      setStep(4); // Show results
    } catch (error) {
      console.error("Error generating drafts:", error);
      setNotification({
        message:
          error.message || "Failed to generate email drafts. Please try again.",
        type: "error",
      });
      setStep(2); // Go back to Step 2 on error
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save a specific draft to Firestore
   */
  async function handleSaveDraft(draftText, index) {
    if (savedDraftIndexes.includes(index)) {
      return;
    }

    try {
      setNotification(null);

      // Add draft to Firestore with all fields for regeneration capability
      await addDoc(collection(db, "users", currentUser.uid, "drafts"), {
        userId: currentUser.uid,
        // Required fields
        prospectFirstName,
        prospectCompany,
        prospectTitle,
        companyName,
        senderNameTitle,
        productService,
        ctaType,
        tone: "Confident but conversational",
        // Strongly recommended fields
        keyDifferentiator: keyDifferentiator || null,
        primaryPain: primaryPain || null,
        socialProofClient: socialProofClient || null,
        // Optional fields
        socialProofResult: socialProofResult || null,
        // Generated output
        generatedText: draftText,
        timestamp: serverTimestamp(),
      });

      setNotification({
        message: `Draft ${index + 1} saved!`,
        type: "success",
      });
      setSavedDraftIndexes((prev) => [...prev, index]);
    } catch (error) {
      console.error("Error saving draft:", error);
      setNotification({
        message: "Failed to save draft. Please try again.",
        type: "error",
      });
    }
  }

  /**
   * Go back to previous step
   */
  function handleBackStep() {
    if (step === 2) {
      setStep(1);
      setNotification(null);
    } else if (step === 4) {
      setStep(2);
      setGeneratedDrafts([]);
      setSavedDraftIndexes([]);
      setNotification(null);
    }
  }

  return (
    <div className="draft-form-container">
      {/* Credit Balance Display */}
      <div style={{ marginBottom: 16 }}>{/* <CreditBalanceDisplay /> */}</div>
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
        <h1>Fanthom: AI Email Generator </h1>
      </header>

      <main className="form-main">
        <TemporaryNotification
          message={notification?.message}
          type={notification?.type}
          onHide={() => setNotification(null)}
        />

        {/* STEP 1: Must-Have Input */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProceedToStep2();
            }}
            className="draft-form"
          >
            <div className="form-section">
              <h2>Step 1: Must-Have Input</h2>
              <p className="section-note">
                Fill in the required fields to get started
              </p>

              <div className="form-group">
                <label htmlFor="companyName">
                  Your Company Name *{" "}
                  <span className="field-note">(Sender credibility)</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#]/g, "");
                    setCompanyName(value);
                    setCompanyNameCharCount(value.length);
                  }}
                  placeholder="Fanthom"
                  required
                />
                {companyNameCharCount > REQUIRED_LIMITS.companyName && (
                  <span className="char-count char-count-error">
                    {companyNameCharCount} / {REQUIRED_LIMITS.companyName}{" "}
                    characters
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="keyDifferentiator">
                  Key Differentiator *{" "}
                  <span className="field-note">
                    (What makes you different, max 25 words)
                  </span>
                </label>
                <input
                  type="text"
                  id="keyDifferentiator"
                  value={keyDifferentiator}
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#{}]/g, "");
                    setKeyDifferentiator(value);
                    setKeyDifferentiatorCharCount(value.length);
                    const wordCount = value.trim()
                      ? value.trim().split(/\s+/).length
                      : 0;
                    setDifferentiatorWordCount(wordCount);
                  }}
                  placeholder="e.g. Only platform with native CRM integration"
                  required
                />
                {keyDifferentiatorCharCount >
                  OPTIONAL_LIMITS.keyDifferentiator && (
                  <span className="char-count char-count-error">
                    {keyDifferentiatorCharCount} /{" "}
                    {OPTIONAL_LIMITS.keyDifferentiator} characters
                  </span>
                )}
                {differentiatorWordCount > 25 && (
                  <span className="word-count word-count-error">
                    {differentiatorWordCount} / 25 words
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prospectFirstName">
                    Prospect First Name *{" "}
                    <span className="field-note">(Used in subject line)</span>
                  </label>
                  <input
                    type="text"
                    id="prospectFirstName"
                    value={prospectFirstName}
                    onChange={(e) => {
                      // Allow spaces, only remove unwanted chars
                      const value = e.target.value.replace(
                        /[^a-zA-Z\s'-]/g,
                        "",
                      );
                      setProspectFirstName(value);
                      setProspectFirstNameCharCount(value.length);
                    }}
                    placeholder="John"
                    required
                  />
                  {prospectFirstNameCharCount >
                    REQUIRED_LIMITS.prospectFirstName && (
                    <span className="char-count char-count-error">
                      {prospectFirstNameCharCount} /{" "}
                      {REQUIRED_LIMITS.prospectFirstName} characters
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="prospectCompany">
                    Prospect Company *{" "}
                    <span className="field-note">
                      (Required for personalization)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="prospectCompany"
                    value={prospectCompany}
                    onChange={(e) => {
                      // Allow spaces, only remove unwanted chars
                      const value = e.target.value.replace(/[<>#]/g, "");
                      setProspectCompany(value);
                      setProspectCompanyCharCount(value.length);
                    }}
                    placeholder="Acme Corp"
                    required
                  />
                  {prospectCompanyCharCount >
                    REQUIRED_LIMITS.prospectCompany && (
                    <span className="char-count char-count-error">
                      {prospectCompanyCharCount} /{" "}
                      {REQUIRED_LIMITS.prospectCompany} characters
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prospectTitle">
                    Prospect Title{" "}
                    <span className="field-note">(Optional buyer persona)</span>
                  </label>
                  <input
                    type="text"
                    id="prospectTitle"
                    value={prospectTitle}
                    onChange={(e) => {
                      // Allow spaces, only remove unwanted chars
                      const value = e.target.value.replace(/[<>#{}]/g, "");
                      setProspectTitle(value);
                      setProspectTitleCharCount(value.length);
                    }}
                    placeholder="Head of Sales / VP / Founder"
                  />
                  {prospectTitleCharCount > REQUIRED_LIMITS.prospectTitle && (
                    <span className="char-count char-count-error">
                      {prospectTitleCharCount} / {REQUIRED_LIMITS.prospectTitle}{" "}
                      characters
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="senderNameTitle">
                    Your Name & Title *{" "}
                    <span className="field-note">(Your signature)</span>
                  </label>
                  <input
                    type="text"
                    id="senderNameTitle"
                    value={senderNameTitle}
                    onChange={(e) => {
                      // Allow spaces, only remove unwanted chars
                      const value = e.target.value.replace(/[<>#{}]/g, "");
                      setSenderNameTitle(value);
                      setSenderNameTitleCharCount(value.length);
                    }}
                    placeholder="Jane Smith, VP of Sales"
                    required
                  />
                  {senderNameTitleCharCount >
                    REQUIRED_LIMITS.senderNameTitle && (
                    <span className="char-count char-count-error">
                      {senderNameTitleCharCount} /{" "}
                      {REQUIRED_LIMITS.senderNameTitle} characters
                    </span>
                  )}
                </div>
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
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#{}]/g, "");
                    setProductService(value);
                    setProductServiceCharCount(value.length);
                  }}
                  placeholder="AI-powered email automation platform for B2B sales teams"
                  required
                />
                {productServiceCharCount > REQUIRED_LIMITS.productService && (
                  <span className="char-count char-count-error">
                    {productServiceCharCount} / {REQUIRED_LIMITS.productService}{" "}
                    characters
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ctaType">
                  Call-to-Action Type *{" "}
                  <span className="field-note">(Email structure & intent)</span>
                </label>
                <select
                  id="ctaType"
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  required
                >
                  {ctaTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-large">
                Continue to Optional Fields →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Strongly Recommended Fields */}
        {step === 2 && (
          <form onSubmit={handleGenerate} className="draft-form">
            <div className="form-section">
              <h2>Step 2: Enhance Your Email (Optional)</h2>
              <p className="section-note">
                Fill in any of these to increase email relevance. Skip if you
                want Fanthom to infer.
              </p>

              <div className="form-group">
                <label htmlFor="primaryPain">
                  Primary Pain Point{" "}
                  <span className="field-note">
                    (Leave blank for auto-inference, max 20 words)
                  </span>
                </label>
                <input
                  type="text"
                  id="primaryPain"
                  value={primaryPain}
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#{}]/g, "");
                    setPrimaryPain(value);
                    setPrimaryPainCharCount(value.length);
                    const wordCount = value.trim()
                      ? value.trim().split(/\s+/).length
                      : 0;
                    setPainWordCount(wordCount);
                  }}
                  placeholder="e.g. low reply rates and weak pipeline"
                  disabled={loading}
                />
                {primaryPainCharCount > OPTIONAL_LIMITS.primaryPain && (
                  <span className="char-count char-count-error">
                    {primaryPainCharCount} / {OPTIONAL_LIMITS.primaryPain}{" "}
                    characters
                  </span>
                )}
                {painWordCount > 20 && (
                  <span className="word-count word-count-error">
                    {painWordCount} / 20 words
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="socialProofClient">
                  Social Proof Client{" "}
                  <span className="field-note">
                    (Company names for credibility, max 10 words)
                  </span>
                </label>
                <input
                  type="text"
                  id="socialProofClient"
                  value={socialProofClient}
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#{}]/g, "");
                    setSocialProofClient(value);
                    setSocialProofClientCharCount(value.length);
                    const wordCount = value.trim()
                      ? value.trim().split(/\s+/).length
                      : 0;
                    setSocialProofClientWordCount(wordCount);
                  }}
                  placeholder="e.g. Salesforce, HubSpot, Outreach"
                  disabled={loading}
                />
                {socialProofClientCharCount >
                  OPTIONAL_LIMITS.socialProofClient && (
                  <span className="char-count char-count-error">
                    {socialProofClientCharCount} /{" "}
                    {OPTIONAL_LIMITS.socialProofClient} characters
                  </span>
                )}
                {socialProofClientWordCount > 10 && (
                  <span className="word-count word-count-error">
                    {socialProofClientWordCount} / 10 words
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="socialProofResult">
                  Social Proof Result{" "}
                  <span className="field-note">
                    (Metrics for proof credibility, max 15 words)
                  </span>
                </label>
                <input
                  type="text"
                  id="socialProofResult"
                  value={socialProofResult}
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#{}]/g, "");
                    setSocialProofResult(value);
                    setSocialProofResultCharCount(value.length);
                    const wordCount = value.trim()
                      ? value.trim().split(/\s+/).length
                      : 0;
                    setSocialProofResultWordCount(wordCount);
                  }}
                  placeholder="e.g. 34% reply rate increase, 2x pipeline growth"
                  disabled={loading}
                />
                {socialProofResultCharCount >
                  OPTIONAL_LIMITS.socialProofResult && (
                  <span className="char-count char-count-error">
                    {socialProofResultCharCount} /{" "}
                    {OPTIONAL_LIMITS.socialProofResult} characters
                  </span>
                )}
                {socialProofResultWordCount > 15 && (
                  <span className="word-count word-count-error">
                    {socialProofResultWordCount} / 15 words
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="line3Input">
                  Signature 3rd Line{" "}
                  <span className="field-note">
                    (Positioning text or booking link, max 10 words)
                  </span>
                </label>
                <input
                  type="text"
                  id="line3Input"
                  value={line3Input}
                  onChange={(e) => {
                    // Allow spaces, only remove unwanted chars
                    const value = e.target.value.replace(/[<>#{}]/g, "");
                    setLine3Input(value);
                    setLine3CharCount(value.length);
                    const wordCount = value.trim()
                      ? value.trim().split(/\s+/).length
                      : 0;
                    setLine3WordCount(wordCount);
                  }}
                  placeholder="e.g. B2B SaaS outbound specialist"
                  disabled={loading}
                />
                {line3CharCount > OPTIONAL_LIMITS.line3Input && (
                  <span className="char-count char-count-error">
                    {line3CharCount} / {OPTIONAL_LIMITS.line3Input} characters
                  </span>
                )}
                {line3Input.trim() && line3WordCount > 10 && (
                  <span className="word-count word-count-error">
                    {line3WordCount} / 10 words
                  </span>
                )}
              </div>

              <div className="button-group">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  ← Back to Step 1
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-large btn-generate"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Fanthom is crafting emails for {companyName}...
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
                      Generate 2 Email Drafts
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: Generating (Spinner) */}
        {step === 3 && (
          <div className="generating-section">
            <div className="spinner-large"></div>
            <h2>Fanthom is crafting emails for {companyName}...</h2>
            <p>This takes 10-15 seconds. Please wait.</p>
          </div>
        )}

        {/* STEP 4: Generated Drafts Display */}
        {step === 4 && generatedDrafts.length > 0 && (
          <div className="drafts-section">
            <h2>2 Email Drafts for {companyName}</h2>
            <p className="drafts-subtitle">
              Ready to send. Pick your favorite and save to dashboard.
            </p>

            <div className="drafts-list">
              {generatedDrafts.map((draft, index) => (
                <div key={index} className="draft-preview">
                  <div className="draft-preview-header">
                    <h3>Draft {index + 1}</h3>
                    <span className="draft-char-count">
                      {draft.length} characters
                    </span>
                    <button
                      onClick={() => handleSaveDraft(draft, index)}
                      className="btn btn-save"
                      type="button"
                      disabled={savedDraftIndexes.includes(index)}
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
                      {savedDraftIndexes.includes(index)
                        ? "Saved"
                        : "Save Draft"}
                    </button>
                  </div>
                  <div className="draft-preview-content">
                    <pre>{draft}</pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="button-group button-group-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn btn-secondary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
