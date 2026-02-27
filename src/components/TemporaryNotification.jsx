import { useEffect } from "react";

export default function TemporaryNotification({
  message,
  type = "success",
  durationMs = 2000,
  onHide,
  className = "",
  position = "top",
}) {
  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => {
      if (onHide) onHide();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, durationMs, onHide]);

  if (!message) return null;

  const isError = type === "error";

  const fixedStyle =
    position === "top"
      ? {
          position: "fixed",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          maxWidth: "min(92vw, 560px)",
          width: "max-content",
        }
      : {};

  const baseStyle = {
    padding: "12px 16px",
    borderRadius: "6px",
    border: `1px solid ${isError ? "#fecaca" : "#86efac"}`,
    background: isError ? "#fef2f2" : "#ecfdf3",
    color: isError ? "#b91c1c" : "#166534",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
  };

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      style={{ ...fixedStyle, ...baseStyle }}
      className={className}
    >
      {message}
    </div>
  );
}
