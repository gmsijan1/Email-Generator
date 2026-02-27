// Dashboard Page Component - Shows list of saved email drafts
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../contexts/useAuth";
import "./DashboardPage.css";
import CreditBalanceDisplay from "../components/CreditBalanceDisplay";

export default function DashboardPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userMenuRef = useRef(null);

  const { currentUser, logout, loading: authLoading } = useAuth();
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
        console.log(`Loaded ${draftsData.length} drafts`);
      },
      (error) => {
        console.error("Error fetching drafts:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Check if it's an index error
        if (
          error.code === "failed-precondition" ||
          error.message?.includes("index")
        ) {
          setError(
            "Database index required. Check the console for the link to create it.",
          );
          console.error(
            "You need to create a Firestore index. Click the link above or in the Firebase Console.",
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
   * Handle click outside user menu to close it
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowLogoutConfirm(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu]);

  /**
   * Handle logout
   */
  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out. Please try again.");
    }
  }

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
              position: "relative",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
            ref={userMenuRef}
          >
            <CreditBalanceDisplay />
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-icon-btn"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {currentUser?.email?.charAt(0).toUpperCase()}
            </button>
            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  padding: "16px",
                  minWidth: "200px",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    marginBottom: "12px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #e2e8f0",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#718096",
                      marginBottom: "4px",
                    }}
                  >
                    Signed in as
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#2d3748",
                    }}
                  >
                    {currentUser?.email}
                  </div>
                </div>
                {!showLogoutConfirm ? (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Log Out
                  </button>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#718096",
                        marginBottom: "8px",
                        textAlign: "center",
                      }}
                    >
                      Are you sure?
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          setShowUserMenu(false);
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: "8px", fontSize: "14px" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLogout}
                        className="btn btn-danger"
                        style={{ flex: 1, padding: "8px", fontSize: "14px" }}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
