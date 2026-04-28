import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/useAuth";
import { getProfile, updateProfile } from "../services/profileService";
import TemporaryNotification from "../components/TemporaryNotification";
import ProfileMenu from "../components/ProfileMenu";
import "./ProfilePage.css";

const LIMITS = {
  senderNameTitle: 50,
  productService: 200,
  socialProofClient: 60,
  socialProofResult: 90,
};

export default function ProfilePage() {
  const [senderNameTitle, setSenderNameTitle] = useState("");
  const [productService, setProductService] = useState("");
  const [socialProofClient, setSocialProofClient] = useState("");
  const [socialProofResult, setSocialProofResult] = useState("");
  const [original, setOriginal] = useState({
    senderNameTitle: "",
    productService: "",
    socialProofClient: "",
    socialProofResult: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const hasChanges =
    senderNameTitle.trim() !== original.senderNameTitle ||
    productService.trim() !== original.productService ||
    socialProofClient.trim() !== original.socialProofClient ||
    socialProofResult.trim() !== original.socialProofResult;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getProfile(currentUser.uid);
        if (cancelled) return;
        setSenderNameTitle(data.senderNameTitle);
        setProductService(data.productService);
        setSocialProofClient(data.socialProofClient);
        setSocialProofResult(data.socialProofResult);
        setOriginal({
          senderNameTitle: data.senderNameTitle,
          productService: data.productService,
          socialProofClient: data.socialProofClient,
          socialProofResult: data.socialProofResult,
        });
      } catch {
        if (!cancelled) {
          setNotification({ message: "Failed to load profile", type: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser || !hasChanges) return;
    try {
      setSaving(true);
      setNotification(null);
      await updateProfile(currentUser.uid, {
        senderNameTitle: senderNameTitle.trim(),
        productService: productService.trim(),
        socialProofClient: socialProofClient.trim(),
        socialProofResult: socialProofResult.trim(),
      });
      setNotification({ message: "Profile saved", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch {
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
          <p className="profile-note">Information is used automatically.</p>

          <div className="form-group">
            <label htmlFor="senderNameTitle">Your name & title</label>
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
            <label htmlFor="productService">Your offer</label>
            <input
              type="text"
              id="productService"
              value={productService}
              onChange={(e) =>
                setProductService(e.target.value.replace(/[<>#{}]/g, ""))
              }
              placeholder="What you sell in one clear sentence (used in every draft unless you override on generate)"
              maxLength={LIMITS.productService}
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialProofClient">
              Social proof — clients or logos
            </label>
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
            <label htmlFor="socialProofResult">Social proof — result</label>
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
