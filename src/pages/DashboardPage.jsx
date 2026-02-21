// Dashboard Page Component - Shows list of saved email drafts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    try {
      // Create query to get drafts for current user, ordered by timestamp
      // Requires Firestore composite index: userId (asc) + timestamp (desc)
      const q = query(
        collection(db, "drafts"),
        where("userId", "==", currentUser.uid),
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
    } catch (error) {
      console.error("Error setting up drafts listener:", error);
      setError(`Failed to load drafts: ${error.message}`);
      setLoading(false);
    }
  }, [currentUser, authLoading, navigate]);

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

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
          <h1>Email Drafts</h1>
          <div className="header-actions">
            <span className="user-email">{currentUser?.email}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Log Out
            </button>
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
          <div className="drafts-grid">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="draft-card"
                onClick={() => navigate(`/draft/${draft.id}`)}
              >
                <div className="draft-header">
                  <h3>{draft.recipientName || "Unnamed Recipient"}</h3>
                  <span className="draft-date">
                    {formatDate(draft.timestamp)}
                  </span>
                </div>

                <div className="draft-meta">
                  <span className="meta-item">
                    <svg
                      className="meta-icon"
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
                    {draft.recipientEmail}
                  </span>
                  <span className="meta-item">
                    <svg
                      className="meta-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {draft.tone || "Professional"}
                  </span>
                </div>

                <p className="draft-preview">
                  {truncateText(draft.generatedText)}
                </p>

                <div className="draft-footer">
                  <span className="goal-badge">{draft.goal || "General"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
