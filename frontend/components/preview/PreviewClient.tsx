"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { validateAuth } from "@/utils/validateAuth.utils";
import { ArrowLeft, Send, Moon, Sun, Monitor, Tablet, Smartphone } from "lucide-react";

interface PreviewMeta {
  id: string;
  title: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  createdByName: string | null;
  editionNumber: number | null;
  isSupportingNews: boolean;
}

export default function PreviewClient({ newsletterId, compiledHtml, meta }: { newsletterId: string; compiledHtml: string; meta?: PreviewMeta }) {
  const { user, setLoginState, setLogoutState } = useAuth();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    validateAuth()
      .then((res) => {
        if (!res) {
          setLogoutState();
          router.push("/auth/login");
          return;
        }
        setLoginState(res);
        setAuthLoading(false);
      })
      .catch(() => {
        setLogoutState();
        router.push("/auth/login");
      });
  }, [router, setLoginState, setLogoutState]);

  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [recipients, setRecipients] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("airis_saved_recipients");
        return saved ? JSON.parse(saved) : [];
      } catch {}
    }
    return [];
  });
  const [sendSubject, setSendSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingToSelf, setSendingToSelf] = useState(false);
  const [sendResult, setSendResult] = useState<{ succeeded: number; failed: number } | null>(null);

  const LS_KEY = "airis_saved_recipients";

  const persistRecipients = (list: string[]) => {
    setRecipients(list);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  };

  const addRecipient = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed) || recipients.includes(trimmed)) return;
    persistRecipients([...recipients, trimmed]);
    setEmailInput("");
  };

  const removeRecipient = (email: string) => {
    persistRecipients(recipients.filter((r) => r !== email));
  };

  useEffect(() => {
    const root = document.querySelector(".preview-root");
    if (!root) return;
    if (theme === "dark") {
      root.classList.remove("newsletter-editor", "light-theme", "light-mode");
      root.classList.add("dark-mode");
    } else {
      root.classList.remove("dark-mode");
      root.classList.add("newsletter-editor", "light-theme", "light-mode");
    }
  }, [theme]);

  const handleSendToSelf = async () => {
    try {
      setSendingToSelf(true);
      const res = await fetch("/api/v1/email/send-to-self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed");
      setSendResult({ succeeded: 1, failed: 0 });
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to send preview email: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSendingToSelf(false);
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) return;
    try {
      setSending(true);
      setSendResult(null);
      const res = await fetch("/api/v1/email/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId,
          emails: recipients,
          subject: sendSubject.trim() || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed");
      setSendResult({ succeeded: d.succeeded, failed: d.failed });
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to send newsletter: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b654a7] border-t-transparent"></div>
          <p className="text-neutral-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden preview-root flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Header */}
      <header className={`border-b px-6 py-4 flex items-center justify-between shrink-0 ${theme === "dark" ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-neutral-50"}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`} title="Back to dashboard">
            <ArrowLeft size={20} className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{meta?.title || "Untitled"}</h1>
            <div className={`text-xs ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>Edition {meta?.editionNumber || "—"} · by {meta?.createdByName || "—"}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`} title="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {!meta?.isSupportingNews && (
            <button onClick={() => setShowSendModal(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${theme === "dark" ? "bg-[#b654a7] hover:bg-[#a04692] text-white" : "bg-[#b654a7] hover:bg-[#a04692] text-white"}`}>
              <Send size={16} /> Send Preview
            </button>
          )}
        </div>
      </header>

      {/* Main Preview Area */}
      <div className={`flex-1 overflow-auto flex flex-col items-center justify-start p-8 ${theme === "dark" ? "bg-neutral-900" : "bg-neutral-100"}`}>
        {/* Device Switcher Controls */}
        <div className={`flex items-center gap-2 p-1.5 rounded-xl mb-6 shadow-md ${theme === "dark" ? "bg-neutral-950 border border-neutral-800" : "bg-white border border-neutral-200"}`}>
          <button
            onClick={() => setDevice("desktop")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${device === "desktop" ? "bg-[#b654a7] text-white shadow" : theme === "dark" ? "text-neutral-400 hover:text-neutral-250 hover:bg-neutral-900" : "text-neutral-600 hover:text-neutral-850 hover:bg-neutral-50"}`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${device === "tablet" ? "bg-[#b654a7] text-white shadow" : theme === "dark" ? "text-neutral-400 hover:text-neutral-250 hover:bg-neutral-900" : "text-neutral-600 hover:text-neutral-850 hover:bg-neutral-50"}`}
          >
            <Tablet size={14} /> Tablet
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${device === "mobile" ? "bg-[#b654a7] text-white shadow" : theme === "dark" ? "text-neutral-400 hover:text-neutral-250 hover:bg-neutral-900" : "text-neutral-600 hover:text-neutral-850 hover:bg-neutral-50"}`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>

        {/* Display Wrapper */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[300px]">
          <div
            className={`preview-frame transition-all duration-300 relative shadow-2xl rounded-2xl border ${theme === "dark" ? "bg-neutral-950 border-neutral-800" : "bg-white border-neutral-200"}`}
            style={{
              width: device === "desktop" ? "100%" : device === "tablet" ? "768px" : "375px",
              height: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {/* Device mock decoration for Tablet/Mobile */}
            {device !== "desktop" && (
              <div className={`h-6 w-full flex items-center justify-center shrink-0 border-b ${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"}`}>
                <div className={`w-12 h-1.5 rounded-full ${theme === "dark" ? "bg-neutral-700" : "bg-neutral-300"}`} />
              </div>
            )}

            {/* Frame Content */}
            <iframe
              srcDoc={compiledHtml}
              className="w-full h-full border-none"
              title="Newsletter Preview"
              style={{
                height: device !== "desktop" ? "calc(100% - 24px)" : "100%",
                background: "white",
              }}
            />
          </div>
        </div>
      </div>

      {/* SEND MODAL */}
      {showSendModal && (
        <div onClick={() => { setShowSendModal(false); setSendResult(null); }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div onClick={(e) => e.stopPropagation()} className={`border rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 ${theme === "dark" ? "bg-neutral-950 border-neutral-800" : "bg-white border-neutral-200"}`}>
            <h3 className="text-lg font-bold">Send Newsletter Preview</h3>

            {/* Send to self */}
            <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${theme === "dark" ? "bg-neutral-900 border border-neutral-800" : "bg-neutral-50 border border-neutral-200"}`}>
              <div>
                <p className="text-sm font-semibold">Send to myself</p>
                <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-neutral-400" : "text-neutral-500"}`}>{user?.email || "your account email"}</p>
              </div>
              <button
                onClick={handleSendToSelf}
                disabled={sendingToSelf}
                className="px-3 py-1.5 rounded-lg bg-[#b654a7] text-white text-xs font-semibold disabled:opacity-50 hover:bg-[#a04692] transition-colors"
              >
                {sendingToSelf ? "Sending…" : "Send Preview"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className={`flex-1 h-px ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-200"}`} />
              <span className={`text-xs ${theme === "dark" ? "text-neutral-500" : "text-neutral-400"}`}>or send to others</span>
              <div className={`flex-1 h-px ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-200"}`} />
            </div>

            {/* Subject */}
            <div>
              <label className={`text-xs mb-1.5 block font-semibold ${theme === "dark" ? "text-neutral-400" : "text-neutral-500"}`}>Subject (optional)</label>
              <input
                value={sendSubject}
                onChange={(e) => setSendSubject(e.target.value)}
                placeholder="[Preview] The AIRIS Chronicle"
                className={`w-full rounded-lg px-3 py-2 text-sm ${theme === "dark" ? "bg-neutral-900 border border-neutral-800 text-neutral-200" : "bg-neutral-50 border border-neutral-200 text-black"}`}
              />
            </div>

            {/* Add recipient input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-xs font-semibold ${theme === "dark" ? "text-neutral-400" : "text-neutral-500"}`}>Recipients ({recipients.length})</label>
              </div>
              <div className="flex gap-2">
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecipient(emailInput); } }}
                  placeholder="name@example.com"
                  className={`flex-1 rounded-lg px-3 py-2 text-sm ${theme === "dark" ? "bg-neutral-900 border border-neutral-800 text-neutral-200" : "bg-neutral-50 border border-neutral-200 text-black"}`}
                />
                <button
                  onClick={() => addRecipient(emailInput)}
                  className="px-3 py-2 rounded-lg text-sm bg-[#b654a7]/20 text-[#b654a7] hover:bg-[#b654a7]/30 font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Recipient chips (scrollable) */}
            {recipients.length > 0 && (
              <div className={`max-h-24 overflow-y-auto rounded-xl p-2 flex flex-wrap gap-1.5 ${theme === "dark" ? "bg-neutral-900 border border-neutral-800" : "bg-neutral-50 border border-neutral-200"}`}>
                {recipients.map((email) => (
                  <div key={email} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${theme === "dark" ? "bg-neutral-880 text-neutral-300 border border-neutral-800" : "bg-neutral-100 text-neutral-700 border border-neutral-200"}`}>
                    <span className="max-w-[180px] truncate">{email}</span>
                    <button onClick={() => removeRecipient(email)} className="text-neutral-500 hover:text-red-400 leading-none">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Send result */}
            {sendResult && (
              <p className={`text-sm font-medium ${sendResult.failed === 0 ? "text-green-400" : "text-yellow-400"}`}>
                ✓ Sent to {sendResult.succeeded} — {sendResult.failed} failed
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setShowSendModal(false); setSendResult(null); }} className={`px-3 py-2 rounded-lg text-sm ${theme === "dark" ? "bg-neutral-800 text-white" : "bg-neutral-200 text-black hover:bg-neutral-300"}`}>Close</button>
              <button
                onClick={handleSend}
                disabled={sending || recipients.length === 0}
                className="px-4 py-2 rounded-lg bg-[#b654a7] text-white text-sm font-semibold disabled:opacity-50 hover:bg-[#a04692] transition-colors"
              >
                {sending ? "Sending…" : `Send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
