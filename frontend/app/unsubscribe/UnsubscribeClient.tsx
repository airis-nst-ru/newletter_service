"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface UnsubscribeClientProps {
  email: string;
  initialError?: string;
}

export default function UnsubscribeClient({ email, initialError }: UnsubscribeClientProps) {
  const [status, setStatus] = useState<"unsubscribed" | "resubscribed" | "error" | "already">(
    initialError ? "error" : "unsubscribed"
  );
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-unsubscribe on mount
  useEffect(() => {
    if (!email || initialError) return;

    fetch("/api/v1/email/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Already unsubscribed") setStatus("already");
      })
      .catch(() => {});
  }, [email, initialError]);

  const handleResubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/email/resubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStatus("resubscribed");
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/v1/email/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feedback }),
      });
      setFeedbackSent(true);
      setFeedback("");
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{
      background: "linear-gradient(135deg, #0a0a0a 0%, #0f0a0f 100%)",
      backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(176,84,167,0.18) 0%, transparent 65%)",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(182,84,167,0.25)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        padding: "48px 40px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "28px" }}>
          <img
            src="/logo.png"
            alt="AIRIS"
            style={{ maxWidth: "140px", margin: "0 auto", filter: "drop-shadow(0 0 24px rgba(182,84,167,0.4))" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* --- Resubscribed state --- */}
        {status === "resubscribed" && (
          <>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "linear-gradient(135deg, #b654a7, #8e44ad)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", marginBottom: "20px",
            }}>✓</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "Inter, sans-serif",
              background: "linear-gradient(135deg, #b654a7, #d4a5d6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "12px" }}>
              Welcome Back!
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "0.95rem", fontFamily: "Inter, sans-serif" }}>
              <strong style={{ color: "#d4a5d6" }}>{email}</strong> has been re-subscribed to the AIRIS Chronicle.
            </p>
          </>
        )}

        {/* --- Error state --- */}
        {status === "error" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "Inter, sans-serif",
              background: "linear-gradient(135deg, #b654a7, #d4a5d6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "12px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "0.95rem", fontFamily: "Inter, sans-serif" }}>
              We couldn't process your unsubscribe request. Please try again or contact us.
            </p>
          </>
        )}

        {/* --- Unsubscribed / Already state --- */}
        {(status === "unsubscribed" || status === "already") && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "Inter, sans-serif",
              background: "linear-gradient(135deg, #b654a7, #d4a5d6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>
              {status === "already" ? "Already Unsubscribed" : "Unsubscribed"}
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "0.95rem", fontFamily: "Inter, sans-serif", marginBottom: "28px" }}>
              {status === "already"
                ? "This email is already not on our mailing list."
                : <>You've been removed from the mailing list for <strong style={{ color: "#d4a5d6" }}>{email}</strong>.</>
              }
            </p>

            {/* Feedback box */}
            {!feedbackSent ? (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ color: "#666", fontSize: "0.85rem", fontFamily: "Inter, sans-serif", marginBottom: "10px" }}>
                  Mind telling us why? (optional)
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us why you're leaving..."
                  rows={3}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(182,84,167,0.3)", borderRadius: "12px",
                    padding: "12px 14px", fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem", color: "#f0f0f0", resize: "vertical",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleFeedback}
                  disabled={!feedback.trim() || loading}
                  style={{
                    marginTop: "10px", width: "100%", padding: "12px",
                    border: "none", borderRadius: "12px",
                    background: "rgba(182,84,167,0.15)",
                    border: "1px solid rgba(182,84,167,0.3)" as any,
                    color: "#d4a5d6", fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                    opacity: (!feedback.trim() || loading) ? 0.5 : 1,
                  }}
                >
                  {loading ? "Sending…" : "Send Feedback"}
                </button>
              </div>
            ) : (
              <p style={{ color: "#b654a7", fontSize: "0.9rem", marginBottom: "20px", fontFamily: "Inter, sans-serif" }}>
                ✓ Thanks for the feedback!
              </p>
            )}

            {/* Resubscribe button */}
            <button
              onClick={handleResubscribe}
              disabled={loading}
              style={{
                width: "100%", padding: "14px", border: "none", borderRadius: "12px",
                background: "linear-gradient(135deg, #b654a7, #8e44ad)",
                color: "#fff", fontFamily: "Inter, sans-serif",
                fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
              }}
            >
              {loading ? "Processing…" : "Re-subscribe"}
            </button>
            <p style={{ marginTop: "12px", color: "#555", fontSize: "0.8rem", fontFamily: "Inter, sans-serif" }}>
              Changed your mind? Click above to stay subscribed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
