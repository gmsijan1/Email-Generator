// Dashboard Page Component - Shows list of saved email drafts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../contexts/useAuth";
import "./DashboardPage.css";
import CreditBalanceDisplay from "../components/CreditBalanceDisplay";
import ProfileMenu from "../components/ProfileMenu";

export default function DashboardPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /**
   * Fetch user's drafts from Firestore in real-time
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Create query to get drafts for current user, ordered by timestamp
    const q = query(
      collection(db, "users", currentUser.uid, "drafts"),
      orderBy("timestamp", "desc"),
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const draftsData = [];
        querySnapshot.forEach((doc) => {
          draftsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setDrafts(draftsData);
        setLoading(false);
      },
      (error) => {
        // Check if it's an index error
        if (
          error.code === "failed-precondition" ||
          error.message?.includes("index")
        ) {
          setError(
            "Database index required. Check the console for the link to create it.",
          );
        } else {
          setError(`Failed to load drafts: ${error.message}`);
        }
        setLoading(false);
      },
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser, authLoading, navigate]);

  /**
   * Format timestamp for display
   */
  function formatDate(timestamp) {
    if (!timestamp) return "Unknown date";
    let date;
    // Firestore Timestamp object
    if (timestamp.toDate) {
      try {
        date = timestamp.toDate();
      } catch {
        return "Unknown date";
      }
    } else if (typeof timestamp === "string" || timestamp instanceof Date) {
      date = new Date(timestamp);
    } else {
      return "Unknown date";
    }
    if (isNaN(date.getTime())) return "Unknown date";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  /**
   * Truncate text for preview
   */
  function truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  if (authLoading || loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Fanthom: Email Drafts</h1>
          <div
            className="header-actions"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <CreditBalanceDisplay />
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Create New Draft Button */}
        <div className="action-section">
          <button
            onClick={() => navigate("/draft/new")}
            className="btn btn-primary btn-large"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Email Draft
          </button>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2>No drafts yet</h2>
            <p>Create your first AI-powered sales email to get started</p>
          </div>
        ) : (
          <div className="drafts-container">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="draft-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/draft/${draft.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/draft/${draft.id}`);
                  }
                }}
              >
                {/* Card Header: Prospect Name + Company (Bold) + CTA Badge */}
                <div className="card-header">
                  <div className="prospect-info">
                    <h3 className="prospect-name">
                      {draft.prospectFirstName || "Unknown"}{" "}
                      <span className="prospect-company">
                        @ {draft.prospectCompany || "Unknown Company"}
                      </span>
                    </h3>
                    <span className="cta-badge">{draft.ctaType}</span>
                  </div>
                  <span className="card-date">
                    {draft.timestamp
                      ? formatDate(draft.timestamp)
                      : "Pending..."}
                  </span>
                </div>

                {/* Card Body: Email preview and highlights */}
                <div className="card-body">
                  {/* Email preview */}
                  <p className="email-preview">
                    {truncateText(draft.generatedText, 120)}
                  </p>

                  {/* Key highlights */}
                  <div className="highlights">
                    {draft.primaryPain && (
                      <div className="highlight-item pain">
                        <span className="highlight-label">Pain Point:</span>
                        <span className="highlight-value">
                          {truncateText(draft.primaryPain, 60)}
                        </span>
                      </div>
                    )}
                    {draft.keyDifferentiator && (
                      <div className="highlight-item differentiator">
                        <span className="highlight-label">Differentiator:</span>
                        <span className="highlight-value">
                          {truncateText(draft.keyDifferentiator, 60)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
