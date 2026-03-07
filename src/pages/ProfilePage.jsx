import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/useAuth";
import { getProfile, updateProfile } from "../services/profileService";
import TemporaryNotification from "../components/TemporaryNotification";
import ProfileMenu from "../components/ProfileMenu";
import "./ProfilePage.css";

const LIMITS = {
  companyName: 50,
  keyDifferentiator: 150,
  senderNameTitle: 50,
  productService: 200,
  socialProofClient: 60,
  socialProofResult: 90,
  line3Input: 60,
};

export default function ProfilePage() {
  const [companyName, setCompanyName] = useState("");
  const [keyDifferentiator, setKeyDifferentiator] = useState("");
  const [senderNameTitle, setSenderNameTitle] = useState("");
  const [productService, setProductService] = useState("");
  const [socialProofClient, setSocialProofClient] = useState("");
  const [socialProofResult, setSocialProofResult] = useState("");
  const [line3Input, setLine3Input] = useState("");
  const [original, setOriginal] = useState({
    companyName: "",
    keyDifferentiator: "",
    senderNameTitle: "",
    productService: "",
    socialProofClient: "",
    socialProofResult: "",
    line3Input: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const hasChanges =
    companyName.trim() !== original.companyName ||
    keyDifferentiator.trim() !== original.keyDifferentiator ||
    senderNameTitle.trim() !== original.senderNameTitle ||
    productService.trim() !== original.productService ||
    socialProofClient.trim() !== original.socialProofClient ||
    socialProofResult.trim() !== original.socialProofResult ||
    line3Input.trim() !== original.line3Input;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [currentUser, navigate]);

  async function loadProfile() {
    try {
      const data = await getProfile(currentUser.uid);
      setCompanyName(data.companyName);
      setKeyDifferentiator(data.keyDifferentiator);
      setSenderNameTitle(data.senderNameTitle);
      setProductService(data.productService);
      setSocialProofClient(data.socialProofClient);
      setSocialProofResult(data.socialProofResult);
      setLine3Input(data.line3Input);
      setOriginal({
        companyName: data.companyName,
        keyDifferentiator: data.keyDifferentiator,
        senderNameTitle: data.senderNameTitle,
        productService: data.productService,
        socialProofClient: data.socialProofClient,
        socialProofResult: data.socialProofResult,
        line3Input: data.line3Input,
      });
    } catch (err) {
      setNotification({ message: "Failed to load profile", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser || !hasChanges) return;
    try {
      setSaving(true);
      setNotification(null);
      await updateProfile(currentUser.uid, {
        companyName: companyName.trim(),
        keyDifferentiator: keyDifferentiator.trim(),
        senderNameTitle: senderNameTitle.trim(),
        productService: productService.trim(),
        socialProofClient: socialProofClient.trim(),
        socialProofResult: socialProofResult.trim(),
        line3Input: line3Input.trim(),
      });
      setNotification({ message: "Profile saved", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setNotification({ message: "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
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
        <h1>Your Saved Info</h1>
        <div className="profile-header-menu">
          <ProfileMenu />
        </div>
      </header>

      <main className="profile-main">
        <TemporaryNotification
          message={notification?.message}
          type={notification?.type}
          onHide={() => setNotification(null)}
        />

        <form onSubmit={handleSubmit} className="profile-form">
          <p className="profile-note">
            Save your default info here. It will pre-fill the email form.
          </p>

          <div className="form-group">
            <label htmlFor="companyName">Your Company Name</label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) =>
                setCompanyName(e.target.value.replace(/[<>#]/g, ""))
              }
              placeholder="Fanthom"
              maxLength={LIMITS.companyName}
            />
            <span className="char-count">
              {companyName.length} / {LIMITS.companyName}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="senderNameTitle">Your Name & Title</label>
            <input
              type="text"
              id="senderNameTitle"
              value={senderNameTitle}
              onChange={(e) =>
                setSenderNameTitle(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="Jane Smith, VP of Sales"
              maxLength={LIMITS.senderNameTitle}
            />
            <span className="char-count">
              {senderNameTitle.length} / {LIMITS.senderNameTitle}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="productService">Product/Service (1 sentence)</label>
            <input
              type="text"
              id="productService"
              value={productService}
              onChange={(e) =>
                setProductService(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="AI-powered email automation platform for B2B sales teams"
              maxLength={LIMITS.productService}
            />
            <span className="char-count">
              {productService.length} / {LIMITS.productService}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="keyDifferentiator">Key Differentiator</label>
            <input
              type="text"
              id="keyDifferentiator"
              value={keyDifferentiator}
              onChange={(e) =>
                setKeyDifferentiator(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="e.g. Only platform with native CRM integration"
              maxLength={LIMITS.keyDifferentiator}
            />
            <span className="char-count">
              {keyDifferentiator.length} / {LIMITS.keyDifferentiator} (max 25
              words)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="socialProofClient">Social Proof Client</label>
            <input
              type="text"
              id="socialProofClient"
              value={socialProofClient}
              onChange={(e) =>
                setSocialProofClient(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="e.g. Salesforce, HubSpot, Outreach"
              maxLength={LIMITS.socialProofClient}
            />
            <span className="char-count">
              {socialProofClient.length} / {LIMITS.socialProofClient} (max 10
              words)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="socialProofResult">Social Proof Result</label>
            <input
              type="text"
              id="socialProofResult"
              value={socialProofResult}
              onChange={(e) =>
                setSocialProofResult(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="e.g. 34% reply rate increase, 2x pipeline growth"
              maxLength={LIMITS.socialProofResult}
            />
            <span className="char-count">
              {socialProofResult.length} / {LIMITS.socialProofResult} (max 15
              words)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="line3Input">Signature 3rd Line</label>
            <input
              type="text"
              id="line3Input"
              value={line3Input}
              onChange={(e) =>
                setLine3Input(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="e.g. B2B SaaS outbound specialist"
              maxLength={LIMITS.line3Input}
            />
            <span className="char-count">
              {line3Input.length} / {LIMITS.line3Input} (max 10 words)
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!hasChanges || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </main>
    </div>
  );
}
