"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { validateAuth } from "@/utils/validateAuth.utils";
import { capitalize } from "@/utils/helpers/string.helpers";
import { useTitle } from "@/app/context/TitleContext";
import { io as socketIO } from "socket.io-client";
import { SendTerminal, type LogEntry, type SendResult } from "./_components/SendTerminal";
import { RecipientsSection } from "./_components/RecipientsSection";
import { SendConfirmDialog, type DBRecipient } from "./_components/SendConfirmDialog";

// ── localStorage keys ─────────────────────────────────────────────────────────
const LS_BACKEND_URL  = "sender_backend_url";
const LS_RECIPIENTS   = "sender_recipients";
const LS_SUBJECT      = "sender_subject";
const LS_SECRET_KEY   = "sender_secret_key";
const LS_KNOWN_EMAILS = "sender_known_emails";
const LS_EMAIL_GROUPS = "sender_email_groups";

// ── Types ─────────────────────────────────────────────────────────────────────
type Newsletter = {
  title: string;
  status: string;
  editionNumber?: number | null;
  sent: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusColor = (s: string) => {
  if (s === "Approved")        return "text-purple-400 bg-purple-500/15";
  if (s === "Seeking_Approval") return "text-yellow-400 bg-yellow-500/15";
  if (s === "Draft")           return "text-yellow-400 bg-yellow-500/15";
  return "text-green-400 bg-green-500/15";
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SendPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user, setLoginState, setLogoutState } = useAuth();
  const setTitle = useTitle().setPageTitle;

  // Newsletter meta
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [newsletterHtml, setNewsletterHtml] = useState<string>("");
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Config (all persisted to localStorage)
  const [backendUrl, setBackendUrl] = useState("");
  const [secretKey, setSecretKey]   = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject]       = useState("");
  const [knownEmails, setKnownEmails] = useState<string[]>([]);
  const [emailGroups, setEmailGroups] = useState<Record<string, string[]>>({});

  // Save-flash state
  const [urlSaved, setUrlSaved]   = useState(false);
  const [keySaved, setKeySaved]   = useState(false);
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Send state
  const [sending, setSending]         = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [sendResult, setSendResult]   = useState<{ success: boolean; message: string; isTest?: boolean } | null>(null);

  // Confirm dialog state
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [dbRecipients, setDbRecipients] = useState<DBRecipient[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError]   = useState<string | null>(null);

  // Terminal / socket state
  const [logs, setLogs]               = useState<LogEntry[]>([]);
  const [finalResult, setFinalResult] = useState<SendResult | null>(null);

  // Backend connectivity
  type HealthStatus = "idle" | "checking" | "online" | "offline";
  type SocketStatus = "disconnected" | "connecting" | "connected";
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle");
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("disconnected");

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    validateAuth()
      .then((res) => {
        if (!res) { router.push("/auth/login"); return; }
        setLoginState(res);
        if (res.accountType !== "Sender") router.push("/dashboard");
      })
      .catch(() => { setLogoutState(); router.push("/auth/login"); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load from localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    setBackendUrl(localStorage.getItem(LS_BACKEND_URL) || "");
    setSecretKey(localStorage.getItem(LS_SECRET_KEY)   || "");
    setRecipients(localStorage.getItem(LS_RECIPIENTS)  || "");
    setSubject(localStorage.getItem(LS_SUBJECT)        || "");
    try {
      setKnownEmails(JSON.parse(localStorage.getItem(LS_KNOWN_EMAILS) || "[]"));
      setEmailGroups(JSON.parse(localStorage.getItem(LS_EMAIL_GROUPS) || "{}"));
    } catch { /* ignore */ }
  }, []);

  // ── Newsletter meta ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/newsletters/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) {
          const n = data.data;
          setNewsletter({
            title: n.content?.title || "Untitled",
            status: n.status || "Draft",
            editionNumber: n.editionNumber ?? null,
            sent: n.sent || false,
          });
          // Store the compiled HTML for sending
          if (n.content?.content) {
            setNewsletterHtml(n.content.content);
          }
          setTitle(`Send — ${n.content?.title || "Newsletter"}`);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMeta(false));
  }, [id, setTitle]);

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!backendUrl.trim()) return;
    setSocketStatus("connecting");
    const socket = socketIO(backendUrl.trim(), { transports: ["websocket"] });
    socket.on("connect",       () => setSocketStatus("connected"));
    socket.on("disconnect",    () => setSocketStatus("disconnected"));
    socket.on("connect_error", () => setSocketStatus("disconnected"));
    socket.on("send:log",      (entry: LogEntry)    => setLogs((p) => [...p, entry]));
    socket.on("send:complete", (result: SendResult) => setFinalResult(result));
    return () => { socket.disconnect(); setSocketStatus("disconnected"); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  // ── Persist helpers ─────────────────────────────────────────────────────────
  const saveBackendUrl = () => {
    const url = backendUrl.trim();
    localStorage.setItem(LS_BACKEND_URL, url);
    if (urlTimer.current) clearTimeout(urlTimer.current);
    setUrlSaved(true);
    urlTimer.current = setTimeout(() => setUrlSaved(false), 2000);
    // Ping healthcheck
    if (url) {
      setHealthStatus("checking");
      fetch(`${url}/healthcheck`)
        .then((r) => setHealthStatus(r.ok ? "online" : "offline"))
        .catch(()  => setHealthStatus("offline"));
    }
  };
  const clearBackendUrl = () => { localStorage.removeItem(LS_BACKEND_URL); setBackendUrl(""); };

  const saveSecretKey = () => {
    localStorage.setItem(LS_SECRET_KEY, secretKey.trim());
    if (keyTimer.current) clearTimeout(keyTimer.current);
    setKeySaved(true);
    keyTimer.current = setTimeout(() => setKeySaved(false), 2000);
  };
  const clearSecretKey = () => { localStorage.removeItem(LS_SECRET_KEY); setSecretKey(""); };

  const handleRecipientsChange = (val: string) => {
    setRecipients(val);
    localStorage.setItem(LS_RECIPIENTS, val);
  };
  const handleSubjectChange = (val: string) => {
    setSubject(val);
    localStorage.setItem(LS_SUBJECT, val);
  };

  const rememberEmails = (emails: string[]) => {
    const merged = Array.from(new Set([...knownEmails, ...emails]));
    setKnownEmails(merged);
    localStorage.setItem(LS_KNOWN_EMAILS, JSON.stringify(merged));
  };

  // ── Send logic ──────────────────────────────────────────────────────────────
  const parsedEmails = recipients.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean);
  const canSend = backendUrl.trim().length > 0 && secretKey.trim().length > 0 && parsedEmails.length > 0;

  const doSend = async (emailList: string[], isTest: boolean) => {
    if (!backendUrl.trim() || !secretKey.trim() || emailList.length === 0) return;
    isTest ? setTestSending(true) : setSending(true);
    setSendResult(null);
    setLogs([]);
    setFinalResult(null);
    try {
      const res = await fetch(`${backendUrl.trim()}/api/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": secretKey.trim() },
        body: JSON.stringify({
          emails: emailList,
          subject: subject.trim() || "The AIRIS Chronicle",
          html: newsletterHtml || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult({ success: false, message: data.message || "Send failed", isTest });
      } else {
        setSendResult({ success: true, message: data.message || "Sent successfully", isTest });
        rememberEmails(emailList);
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.message || "Network error", isTest });
    } finally {
      isTest ? setTestSending(false) : setSending(false);
    }
  };

  // ── Confirm dialog handlers ────────────────────────────────────────────────────────
  const openSendDialog = async () => {
    setDialogOpen(true);
    setDialogLoading(true);
    setDialogError(null);
    setDbRecipients([]);
    try {
      const res = await fetch("/api/v1/email/recipients?all=true", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch recipients");
      setDbRecipients(data.data || []);
    } catch (err: any) {
      setDialogError(err.message || "Could not load recipients");
    } finally {
      setDialogLoading(false);
    }
  };

  const confirmSend = () => {
    setDialogOpen(false);
    doSend(dbRecipients.map((r) => r.email), false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">

      {/* Confirm dialog */}
      <SendConfirmDialog
        open={dialogOpen}
        loading={dialogLoading}
        recipients={dbRecipients}
        fetchError={dialogError}
        newsletterTitle={newsletter?.title || "Newsletter"}
        subject={subject.trim() || "The AIRIS Chronicle"}
        onConfirm={confirmSend}
        onCancel={() => setDialogOpen(false)}
      />

      {/* Top bar */}
      <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push("/recipients")}
            className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer"
          >
            Recipients
          </button>
        </div>
        <span className="text-sm text-neutral-500">
          Logged in as <span className="text-white font-medium">{capitalize(user?.username || "")}</span>
        </span>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: scrollable form ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

            {/* Newsletter info */}
            <div>
              {loadingMeta ? (
                <div className="h-8 w-64 bg-neutral-900 rounded-xl animate-pulse" />
              ) : newsletter ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{newsletter.title}</h1>
                    {newsletter.editionNumber && (
                      <p className="text-neutral-500 text-sm mt-1">Edition #{newsletter.editionNumber}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium shrink-0 mt-1 ${statusColor(newsletter.sent ? "Sent" : newsletter.status)}`}>
                    {newsletter.sent ? "Sent" : newsletter.status.replace("_", " ")}
                  </span>
                </div>
              ) : (
                <p className="text-neutral-400">Newsletter not found.</p>
              )}
            </div>

            {/* Backend URL */}
            <section className="border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Backend URL</h2>
                <p className="text-sm text-neutral-500 mt-1">The base URL of the send API. Saved locally until you clear it.</p>
              </div>
              <div className="flex gap-2">
                <input
                  id="backend-url-input"
                  type="url"
                  placeholder="https://api.yourserver.com"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveBackendUrl()}
                  className="flex-1 bg-black border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-neutral-500 transition-colors text-sm"
                />
                <button
                  id="save-backend-url-btn"
                  onClick={saveBackendUrl}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium cursor-pointer shrink-0"
                >
                  {urlSaved ? "✓ Saved" : "Save"}
                </button>
              </div>
              {backendUrl.trim() && (
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Saved: <span className="text-neutral-300">{backendUrl.trim()}</span></span>
                  <button id="clear-backend-url-btn" onClick={clearBackendUrl} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">Clear</button>
                </div>
              )}

              {/* Status badges */}
              {backendUrl.trim() && (
                <div className="flex items-center gap-3">
                  {/* Health */}
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                    healthStatus === "online"   ? "border-green-700  text-green-400  bg-green-500/10" :
                    healthStatus === "offline"  ? "border-red-700    text-red-400    bg-red-500/10"   :
                    healthStatus === "checking" ? "border-neutral-700 text-neutral-400 bg-neutral-800" :
                    "border-neutral-800 text-neutral-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      healthStatus === "online"   ? "bg-green-400 animate-pulse" :
                      healthStatus === "offline"  ? "bg-red-400"   :
                      healthStatus === "checking" ? "bg-yellow-400 animate-pulse" :
                      "bg-neutral-600"
                    }`} />
                    {healthStatus === "online"   && "Server online"}
                    {healthStatus === "offline"  && "Server offline"}
                    {healthStatus === "checking" && "Checking..."}
                    {healthStatus === "idle"     && "Not checked"}
                  </span>

                  {/* Socket */}
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                    socketStatus === "connected"    ? "border-blue-700   text-blue-400   bg-blue-500/10"   :
                    socketStatus === "connecting"   ? "border-neutral-700 text-neutral-400 bg-neutral-800" :
                    "border-neutral-800 text-neutral-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      socketStatus === "connected"  ? "bg-blue-400 animate-pulse" :
                      socketStatus === "connecting" ? "bg-yellow-400 animate-pulse" :
                      "bg-neutral-600"
                    }`} />
                    {socketStatus === "connected"  && "Socket connected"}
                    {socketStatus === "connecting" && "Socket connecting..."}
                    {socketStatus === "disconnected" && "Socket disconnected"}
                  </span>
                </div>
              )}
            </section>

            {/* Secret Key */}
            <section className="border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Newsletter Secret Key</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  The <code className="text-neutral-400 bg-neutral-900 px-1 rounded">x-api-key</code> sent with every request. Saved locally until you clear it.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  id="secret-key-input"
                  type="password"
                  placeholder="your-secret-key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveSecretKey()}
                  className="flex-1 bg-black border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-neutral-500 transition-colors text-sm font-mono"
                />
                <button
                  id="save-secret-key-btn"
                  onClick={saveSecretKey}
                  className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm font-medium cursor-pointer shrink-0"
                >
                  {keySaved ? "✓ Saved" : "Save"}
                </button>
              </div>
              {secretKey.trim() && (
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Key saved: <span className="text-neutral-300">{"•".repeat(Math.min(secretKey.trim().length, 20))}</span></span>
                  <button id="clear-secret-key-btn" onClick={clearSecretKey} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">Clear</button>
                </div>
              )}
            </section>

            {/* Recipients (extracted component) */}
            <RecipientsSection
              recipients={recipients}
              parsedEmails={parsedEmails}
              knownEmails={knownEmails}
              emailGroups={emailGroups}
              canSend={canSend}
              testSending={testSending}
              isSending={sending}
              userEmail={user?.email}
              onRecipientsChange={handleRecipientsChange}
              onKnownEmailsChange={setKnownEmails}
              onEmailGroupsChange={setEmailGroups}
              onTestSend={() => doSend(parsedEmails, true)}
            />

            {/* Subject */}
            <section className="border border-neutral-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Subject</h2>
                <p className="text-sm text-neutral-500 mt-1">Email subject line. Saved locally for next time.</p>
              </div>
              <input
                id="subject-input"
                type="text"
                placeholder="The AIRIS Chronicle — Edition #1"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-neutral-500 transition-colors text-sm"
              />
            </section>

            {/* Send button */}
            <div className="flex items-center gap-4">
              <button
                id="send-newsletter-btn"
                disabled={!backendUrl.trim() || !secretKey.trim() || sending || testSending}
                onClick={openSendDialog}
                className={`flex-1 py-4 rounded-2xl font-semibold text-base transition-all ${
                  backendUrl.trim() && secretKey.trim() && !sending && !testSending
                    ? "bg-white text-black hover:scale-[1.02] cursor-pointer"
                    : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
                }`}
              >
                {sending ? "Sending..." : "Send Newsletter →"}
              </button>
            </div>

            {sendResult && (
              <p className={`text-sm text-center -mt-4 ${sendResult.success ? "text-green-400" : "text-red-400"}`}>
                {sendResult.isTest && <span className="text-neutral-500">[Test] </span>}
                {sendResult.success ? "✓" : "✗"} {sendResult.message}
              </p>
            )}

            {!canSend && (
              <p className="text-xs text-neutral-600 text-center -mt-4">
                {!backendUrl.trim() && "Add a backend URL. "}
                {!secretKey.trim() && "Add the secret key. "}
                {!parsedEmails.length && "Add at least one recipient."}
              </p>
            )}

          </div>
        </div>

        {/* ── Right: terminal panel (extracted component) ── */}
        <SendTerminal
          logs={logs}
          finalResult={finalResult}
          onClear={() => { setLogs([]); setFinalResult(null); }}
        />

      </div>
    </div>
  );
}
