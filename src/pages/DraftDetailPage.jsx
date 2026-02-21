// Draft Detail Page Component - View, edit, regenerate, and delete saved drafts
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { regenerateEmailDraft } from "../services/openaiService";
import "./DraftDetailPage.css";

export default function DraftDetailPage() {
  const { id } = useParams();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
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
        const docRef = doc(db, "drafts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const draftData = { id: docSnap.id, ...docSnap.data() };

          // Check if draft belongs to current user
          if (draftData.userId !== currentUser.uid) {
            setError("You do not have permission to view this draft");
            setTimeout(() => navigate("/dashboard"), 2000);
            return;
          }

          setDraft(draftData);
          setEditedText(draftData.generatedText);
        } else {
          setError("Draft not found");
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } catch (error) {
        console.error("Error fetching draft:", error);
        setError("Failed to load draft. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDraft();
  }, [id, currentUser, navigate]);

  /**
   * Handle draft regeneration
   */
  async function handleRegenerate() {
    try {
      setError("");
      setSuccess("");
      setIsRegenerating(true);

      const newDraftText = await regenerateEmailDraft({
        recipientName: draft.recipientName,
        recipientEmail: draft.recipientEmail,
        context: draft.context,
        goal: draft.goal,
        tone: draft.tone,
      });

      // Update draft in Firestore
      const docRef = doc(db, "drafts", id);
      await updateDoc(docRef, {
        generatedText: newDraftText,
        timestamp: new Date(),
      });

      setDraft({ ...draft, generatedText: newDraftText });
      setEditedText(newDraftText);
      setSuccess("Draft regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating draft:", error);
      setError(
        error.message || "Failed to regenerate draft. Please try again.",
      );
    } finally {
      setIsRegenerating(false);
    }
  }

  /**
   * Handle saving edited draft
   */
  async function handleSaveEdit() {
    if (!editedText.trim()) {
      return setError("Draft cannot be empty");
    }

    try {
      setError("");
      setSuccess("");

      const docRef = doc(db, "drafts", id);
      await updateDoc(docRef, {
        generatedText: editedText,
        timestamp: new Date(),
      });

      setDraft({ ...draft, generatedText: editedText });
      setIsEditing(false);
      setSuccess("Draft updated successfully!");
    } catch (error) {
      console.error("Error updating draft:", error);
      setError("Failed to update draft. Please try again.");
    }
  }

  /**
   * Handle draft deletion
   */
  async function handleDelete() {
    try {
      setError("");
      const docRef = doc(db, "drafts", id);
      await deleteDoc(docRef);

      setSuccess("Draft deleted successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.error("Error deleting draft:", error);
      setError("Failed to delete draft. Please try again.");
    }
  }

  /**
   * Copy draft to clipboard
   */
  function handleCopy() {
    navigator.clipboard.writeText(draft.generatedText);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  }

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

        {success && (
          <div className="success-message" role="alert">
            {success}
          </div>
        )}

        {/* Draft Info Card */}
        <div className="info-card">
          <div className="info-header">
            <h2>Draft Information</h2>
            <span className="timestamp">{formatDate(draft.timestamp)}</span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label>Recipient</label>
              <p>{draft.recipientName}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{draft.recipientEmail}</p>
            </div>
            <div className="info-item">
              <label>Goal</label>
              <p>{draft.goal}</p>
            </div>
            <div className="info-item">
              <label>Tone</label>
              <p>{draft.tone}</p>
            </div>
          </div>

          <div className="info-item full-width">
            <label>Context</label>
            <p className="context-text">{draft.context}</p>
          </div>
        </div>

        {/* Draft Content Card */}
        <div className="content-card">
          <div className="content-header">
            <h2>Generated Email</h2>
            {!isEditing && (
              <div className="action-buttons">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary"
                  title="Copy to clipboard"
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary"
                  title="Edit draft"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleRegenerate}
                  className="btn btn-primary"
                  disabled={isRegenerating}
                  title="Regenerate draft"
                >
                  {isRegenerating ? (
                    <>
                      <span className="spinner"></span>
                      Regenerating...
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Regenerate
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="edit-section">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows="15"
                className="edit-textarea"
              />
              <div className="edit-actions">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(draft.generatedText);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="draft-content">
              <pre>{draft.generatedText}</pre>
            </div>
          )}
        </div>

        {/* Delete Section */}
        <div className="danger-zone">
          <h3>Danger Zone</h3>
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
