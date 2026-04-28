import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/useAuth";
import { generateEmailDrafts } from "../services/openaiService";
import { getProfile } from "../services/profileService";
import TemporaryNotification from "../components/TemporaryNotification";
import ProfileMenu from "../components/ProfileMenu";
import { deriveProspectCompanyLabel } from "../utils/prospectUrl";
import "./DraftFormPage.css";

const PROSPECT_URL_MAX = 2048;
const OFFER_OVERRIDE_MAX = 200;

const DEFAULT_CTA = "Cold Outreach";

function sanitizeUrl(value) {
  const t = value.trim();
  if (!t) return "";
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.href.length > PROSPECT_URL_MAX
      ? u.href.slice(0, PROSPECT_URL_MAX)
      : u.href;
  } catch {
    return "";
  }
}

function sanitizeOffer(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/[<>#{}]/g, "")
    .trim();
}

export default function DraftFormPage() {
  const [prospectSourceUrl, setProspectSourceUrl] = useState("");
  const [offerOverride, setOfferOverride] = useState("");

  const [profileSenderNameTitle, setProfileSenderNameTitle] = useState("");
  const [profileOffer, setProfileOffer] = useState("");
  const [profileSocialProofClient, setProfileSocialProofClient] = useState("");
  const [profileSocialProofResult, setProfileSocialProofResult] = useState("");

  const [step, setStep] = useState(1);
  const [generatedDrafts, setGeneratedDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [savedDraftIndexes, setSavedDraftIndexes] = useState([]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    getProfile(currentUser.uid).then((p) => {
      if (p.senderNameTitle) setProfileSenderNameTitle(p.senderNameTitle);
      if (p.productService) setProfileOffer(p.productService);
      if (p.socialProofClient) setProfileSocialProofClient(p.socialProofClient);
      if (p.socialProofResult) setProfileSocialProofResult(p.socialProofResult);
    });
  }, [currentUser]);

  async function handleGenerate(e) {
    e.preventDefault();
    setNotification(null);

    const sanitizedUrl = sanitizeUrl(prospectSourceUrl);
    if (!sanitizedUrl) {
      setNotification({
        message:
          "Enter a valid prospect link (https company website or LinkedIn profile).",
        type: "error",
      });
      return;
    }

    const effectiveOffer =
      sanitizeOffer(offerOverride) || sanitizeOffer(profileOffer);
    if (!profileSenderNameTitle.trim()) {
      setNotification({
        message: "Add your name and title under Your Saved Info first.",
        type: "error",
      });
      return;
    }
    if (!effectiveOffer) {
      setNotification({
        message:
          "Add your default offer under Your Saved Info, or enter an optional offer for this run.",
        type: "error",
      });
      return;
    }

    const overrideSan = sanitizeOffer(offerOverride);
    if (overrideSan.length > OFFER_OVERRIDE_MAX) {
      setNotification({
        message: `Optional offer must be ${OFFER_OVERRIDE_MAX} characters or less.`,
        type: "error",
      });
      return;
    }

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setProspectSourceUrl(sanitizedUrl);
    setStep(2);
    setLoading(true);

    try {
      const { deductCredits, getCreditBalance } =
        await import("../services/creditService");
      const balance = await getCreditBalance(currentUser.uid);
      if (balance < 2) {
        setStep(1);
        setLoading(false);
        setNotification({
          message: "Insufficient credits. Please purchase more.",
          type: "error",
        });
        return;
      }
      try {
        await deductCredits(currentUser.uid, 2, "email_generation");
      } catch (creditError) {
        setStep(1);
        setLoading(false);
        setNotification({
          message:
            creditError.message ||
            "Insufficient credits. Please purchase more.",
          type: "error",
        });
        return;
      }

      const label = deriveProspectCompanyLabel(sanitizedUrl);

      const drafts = await generateEmailDrafts({
        recipientName: "there",
        recipientEmail: "prospect@placeholder.local",
        formData: {
          companyName: "",
          senderNameTitle: profileSenderNameTitle.trim(),
          productService: effectiveOffer,
          prospectFirstName: "",
          prospectCompany: label,
          prospectTitle: "",
          ctaType: DEFAULT_CTA,
          tone: "Confident and professional",
          socialProofClient: profileSocialProofClient.trim(),
          socialProofResult: profileSocialProofResult.trim(),
          prospectSourceUrl: sanitizedUrl,
        },
        goal: DEFAULT_CTA,
        tone: "Confident but conversational",
      });

      const twoLatestDrafts = drafts.slice(0, 2);
      setGeneratedDrafts(twoLatestDrafts);
      const who = label || "your prospect";
      setNotification({
        message: `Drafts generated for ${who}. Choose your favorite and save.`,
        type: "success",
      });
      setStep(3);
    } catch (error) {
      setStep(1);
      setNotification({
        message:
          error.message || "Failed to generate email drafts. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft(draftText, index) {
    if (savedDraftIndexes.includes(index)) return;

    try {
      setNotification(null);
      const sanitizedUrl = sanitizeUrl(prospectSourceUrl);
      const effectiveOffer =
        sanitizeOffer(offerOverride) || sanitizeOffer(profileOffer);
      const label = deriveProspectCompanyLabel(sanitizedUrl);

      await addDoc(collection(db, "users", currentUser.uid, "drafts"), {
        userId: currentUser.uid,
        prospectSourceUrl: sanitizedUrl,
        prospectCompany: label || null,
        senderNameTitle: profileSenderNameTitle.trim(),
        productService: effectiveOffer,
        ctaType: DEFAULT_CTA,
        tone: "Confident but conversational",
        socialProofClient: profileSocialProofClient.trim() || null,
        socialProofResult: profileSocialProofResult.trim() || null,
        offerOverrideUsed: Boolean(sanitizeOffer(offerOverride)),
        generatedText: draftText,
        timestamp: serverTimestamp(),
      });

      setNotification({
        message: `Draft ${index + 1} saved!`,
        type: "success",
      });
      setSavedDraftIndexes((prev) => [...prev, index]);
    } catch {
      setNotification({
        message: "Failed to save draft. Please try again.",
        type: "error",
      });
    }
  }

  function handleBackStep() {
    if (step === 3) {
      setStep(1);
      setGeneratedDrafts([]);
      setSavedDraftIndexes([]);
      setNotification(null);
    }
  }

  const prospectLabel = deriveProspectCompanyLabel(
    sanitizeUrl(prospectSourceUrl) || prospectSourceUrl.trim(),
  );

  return (
    <div className="draft-form-container">
      <header className="form-header">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="back-button"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>
        <h1>Fanthom: AI Email Generator</h1>
        <div className="form-header-profile">
          <ProfileMenu />
        </div>
      </header>

      <main className="form-main">
        <TemporaryNotification
          message={notification?.message}
          type={notification?.type}
          onHide={() => setNotification(null)}
        />

        {step === 1 && (
          <form onSubmit={handleGenerate} className="draft-form">
            <div className="form-section">
              <h2>Generate from a link</h2>

              <div className="form-group">
                <label htmlFor="prospectSourceUrl">
                  Prospect source <span className="field-note">(required)</span>
                </label>
                <input
                  type="url"
                  id="prospectSourceUrl"
                  inputMode="url"
                  autoComplete="url"
                  value={prospectSourceUrl}
                  onChange={(e) => setProspectSourceUrl(e.target.value)}
                  placeholder="https://company.com or https://linkedin.com/in/…"
                  disabled={loading}
                  maxLength={PROSPECT_URL_MAX}
                  required
                />
                {prospectSourceUrl.trim() && (
                  <span className="char-count">
                    {prospectLabel
                      ? `Preview: ${prospectLabel}`
                      : "Paste a valid URL"}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="offerOverride">
                  Your offer{" "}
                  <span className="field-note">(optional override)</span>
                </label>
                <input
                  type="text"
                  id="offerOverride"
                  value={offerOverride}
                  onChange={(e) => setOfferOverride(e.target.value)}
                  placeholder="Leave blank to use the offer from Your Saved Info"
                  disabled={loading}
                  maxLength={OFFER_OVERRIDE_MAX}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large btn-generate"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generating…
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
                    Generate 2 email drafts
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="generating-section">
            <div className="spinner-large"></div>
            <h2>Crafting your drafts…</h2>
            <p>This usually takes 10–20 seconds.</p>
          </div>
        )}

        {step === 3 && generatedDrafts.length > 0 && (
          <div className="drafts-section">
            <h2>
              2 email drafts
              {prospectLabel ? ` for ${prospectLabel}` : ""}
            </h2>
            <p className="drafts-subtitle">
              Pick your favorite and save to the dashboard.
            </p>

            <div className="drafts-list">
              {generatedDrafts.map((draft, index) => (
                <div key={index} className="draft-preview">
                  <div className="draft-preview-header">
                    <h3>{index === 0 ? "Variant A" : "Variant B"}</h3>
                    <span className="draft-char-count">
                      {draft.length} characters
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveDraft(draft, index)}
                      className="btn btn-save"
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
                        : "Save draft"}
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
                onClick={handleBackStep}
                className="btn btn-secondary"
              >
                ← Generate again
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn btn-secondary"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
