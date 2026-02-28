// Draft Detail Page Component - View, edit, and delete saved drafts
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from "../contexts/useAuth";
import TemporaryNotification from "../components/TemporaryNotification";
import "./DraftDetailPage.css";

export default function DraftDetailPage() {
  const { id } = useParams();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  /**
   * Fetch draft from Firestore
   */
  useEffect(() => {
    async function fetchDraft() {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const docRef = doc(db, "users", currentUser.uid, "drafts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const draftData = { id: docSnap.id, ...docSnap.data() };

          setDraft(draftData);
          setEditedText(draftData.generatedText);
        } else {
          setError("Draft not found");
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } catch (error) {
        setError("Failed to load draft. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDraft();
  }, [id, currentUser, navigate]);

  /**
   * Handle saving edited draft
   */
  async function handleSaveEdit() {
    if (!editedText.trim()) {
      setNotification({ message: "Draft cannot be empty", type: "error" });
      return;
    }

    try {
      setError("");
      setNotification(null);

      const docRef = doc(db, "users", currentUser.uid, "drafts", id);
      await updateDoc(docRef, {
        generatedText: editedText,
        timestamp: new Date(),
      });

      setDraft({ ...draft, generatedText: editedText });
      setIsEditing(false);
      setNotification({ message: "Draft saved!", type: "success" });
    } catch (error) {
      setNotification({
        message: "Failed to update draft. Please try again.",
        type: "error",
      });
    }
  }

  /**
   * Handle draft deletion
   */
  async function handleDelete() {
    try {
      setError("");
      setNotification(null);
      const docRef = doc(db, "users", currentUser.uid, "drafts", id);
      await deleteDoc(docRef);

      setNotification({ message: "Draft deleted!", type: "error" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setNotification({
        message: "Failed to delete draft. Please try again.",
        type: "error",
      });
    }
  }

  /**
   * Copy draft to clipboard
   */
  function handleCopy() {
    navigator.clipboard.writeText(draft.generatedText);
    setNotification({ message: "Copied to clipboard!", type: "success" });
  }

  const hasChanges = draft && editedText !== draft.generatedText;

  /**
   * Format timestamp for display
   */
  function formatDate(timestamp) {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="draft-detail-container">
        <div className="loading-spinner">Loading draft...</div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="draft-detail-container">
        <div className="error-message">{error || "Draft not found"}</div>
      </div>
    );
  }

  return (
    <div className="draft-detail-container">
      {/* Header */}
      <header className="detail-header">
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
        <h1>Email Draft</h1>
      </header>

      <main className="detail-main">
        {/* Messages */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <TemporaryNotification
          message={notification?.message}
          type={notification?.type}
          onHide={() => setNotification(null)}
        />

        {/* Draft Info Card */}
        <div className="info-card">
          <div className="info-header">
            <h2>Draft Information</h2>
            <span className="timestamp">{formatDate(draft.timestamp)}</span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label>Prospect Name:</label>
              <p>{draft.prospectFirstName}</p>
            </div>
            <div className="info-item">
              <label>Prospect Company:</label>
              <p>{draft.prospectCompany}</p>
            </div>
            <div className="info-item">
              <label>Goal:</label>
              <p>{draft.ctaType}</p>
            </div>
          </div>

          {draft.context && (
            <div className="info-item full-width">
              <label>Context:</label>
              <p className="context-text">{draft.context}</p>
            </div>
          )}
        </div>

        {/* Draft Content Card */}
        <div className="content-card">
          <div className="content-header">
            <h2>Generated Email</h2>
            <button onClick={handleCopy} className="btn btn-primary">
              Copy
            </button>
          </div>

          <div className="edit-section">
            <textarea
              value={editedText}
              onChange={(e) => {
                if (!isEditing) setIsEditing(true);
                setEditedText(e.target.value);
              }}
              onFocus={() => setIsEditing(true)}
              rows="15"
              className="edit-textarea"
              readOnly={!isEditing}
            />
          </div>
        </div>

        <div className="detail-actions">
          <button
            onClick={handleSaveEdit}
            className="btn btn-primary"
            disabled={!hasChanges}
          >
            Save Changes
          </button>
        </div>

        {/* Delete Section */}
        <div className="danger-zone">
          <h3>Remove Draft</h3>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Draft
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Are you sure? This action cannot be undone.</p>
              <div className="delete-actions">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
