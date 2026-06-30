"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { validateAuth } from "@/utils/validateAuth.utils";
import CommentThread from "@/components/comments/CommentThread";
import { Layout, Sparkles, AlignLeft, Columns, Table as TableIcon, User, Cpu, BookOpen, Settings, AlertCircle, Minus, ArrowLeft, CheckCircle, Send, Moon, Sun } from 'lucide-react';
import { TiThMenu } from "react-icons/ti";
import { GrCaretNext } from "react-icons/gr";

const blockTypeIcons: Record<string, React.ComponentType<any>> = {
  header: Layout,
  hero: Sparkles,
  section: AlignLeft,
  featureComparison: Columns,
  benchmarkTable: TableIcon,
  memberSpotlight: User,
  technicalSession: Cpu,
  airisReads: BookOpen,
  conclusion: Layout,
  footer: Settings,
  unsubscribe: AlertCircle,
  divider: Minus,
};

export default function ApproverReviewClient({ newsletterId, compiledHtml, meta }: { newsletterId: string; compiledHtml: string; meta?: any }) {
  const { user, setLoginState, setLogoutState } = useAuth();
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [status, setStatus] = useState(meta?.status || "Draft");

  useEffect(() => {
    validateAuth()
      .then((res) => {
        if (!res) {
          setLogoutState();
          router.push("/auth/login");
          return;
        }
        setLoginState(res);
        if (res.accountType !== "Approver") {
          router.push("/dashboard");
          return;
        }
        setAuthLoading(false);
      })
      .catch(() => {
        setLogoutState();
        router.push("/auth/login");
      });
  }, [router, setLoginState, setLogoutState]);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [blocks, setBlocks] = useState<{ id: string; type: string; title?: string }[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
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
    const root = document.querySelector('.approver-root');
    if (!root) return;
    if (theme === 'dark') {
      root.classList.remove('newsletter-editor', 'light-theme', 'light-mode');
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
      root.classList.add('newsletter-editor', 'light-theme', 'light-mode');
    }
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingBlocks(true);
        const res = await fetch(`/api/v1/newsletters/${newsletterId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || '');
        if (data.data?.status) {
          setStatus(data.data.status);
        }
        const state = data.data.content?.state;
        if (Array.isArray(state)) {
          const mapped = state.map((b: any) => ({ id: b.id, type: b.type, title: b.title || (b.type + ' block') }));
          setBlocks(mapped);
          if (mapped.length > 0 && !selectedBlock) setSelectedBlock(mapped[0].id);
        }

        const cRes = await fetch(`/api/v1/newsletters/${newsletterId}/comments`);
        const cData = await cRes.json();
        const comments = (cData.data || []);
        const map: Record<string, number> = {};
        comments.forEach((c: any) => { map[c.blockId] = (map[c.blockId] || 0) + 1; });
        setCounts(map);
      } catch (err) { console.error(err); }
      finally { setLoadingBlocks(false); }
    };
    fetchData();
  }, [newsletterId]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      const res = await fetch(`/api/v1/newsletters/${newsletterId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Approved', content: compiledHtml }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      setShowApproveModal(false);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    } finally { setApproving(false); }
  };

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
    } catch (err) {
      console.error(err);
      alert("Failed to send to self");
    } finally { setSendingToSelf(false); }
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
    } catch (err) {
      console.error(err);
      alert("Failed to send newsletter");
    } finally { setSending(false); }
  };

  useEffect(() => {
    if (!previewRef.current) return;
    const root = previewRef.current;
    const prev = root.querySelectorAll('.ap-selected-block');
    prev.forEach(p => p.classList.remove('ap-selected-block'));
    if (selectedBlock) {
      const el = root.querySelector(`[data-block-id="${selectedBlock}"]`) || root.querySelector(`#${selectedBlock}`);
      if (el) {
        el.classList.add('ap-selected-block');
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedBlock, compiledHtml]);

  const jumpToNextComment = () => {
    if (!previewRef.current || blocks.length === 0) return;
    const idsWithComments = blocks.filter(b => (counts[b.id] || 0) > 0).map(b => b.id);
    if (idsWithComments.length === 0) return;
    const currentIndex = idsWithComments.indexOf(selectedBlock || idsWithComments[0]);
    const nextIndex = (currentIndex + 1) % idsWithComments.length;
    const nid = idsWithComments[nextIndex];
    setSelectedBlock(nid);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b654a7] border-t-transparent"></div>
          <p className="text-neutral-400">Verifying approver access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden approver-root flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className={`border-b px-6 py-4 flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-200 bg-neutral-50'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`} title="Back to dashboard">
            <ArrowLeft size={20} className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{meta?.title || 'Untitled'}</h1>
            <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Edition {meta?.editionNumber || '—'} · by {meta?.createdByName || '—'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {!meta?.isSupportingNews && (
            <button onClick={() => setShowSendModal(true)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${theme === 'dark' ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-black'}`}>
              <Send size={16} /> Send
            </button>
          )}
          {status === "Seeking_Approval" && (
            <button onClick={() => setShowApproveModal(true)} disabled={approving} className="px-3 py-2 rounded-lg bg-[#b654a7] hover:bg-[#a54a97] text-white text-sm font-medium transition-colors flex items-center gap-2">
              <CheckCircle size={16} /> {approving ? 'Approving…' : 'Approve'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Left Sidebar - Sections */}
        <aside className={`w-72 flex flex-col border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'}`}>
            <h3 className="font-semibold text-sm mb-2">Sections</h3>
            <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>{blocks.length} blocks</div>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
            {loadingBlocks ? (
              <div className={`text-xs px-3 py-2 ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Loading…</div>
            ) : (
              blocks.map(b => {
                const Icon = blockTypeIcons[b.type] || Layout;
                const isSelected = selectedBlock === b.id;
                const commentCount = counts[b.id] || 0;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBlock(b.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${isSelected
                        ? theme === 'dark'
                          ? 'bg-[#b654a7]/15 border border-[#b654a7]/40 text-white'
                          : 'bg-[#b654a7]/10 border border-[#b654a7]/30 text-black'
                        : theme === 'dark'
                          ? 'hover:bg-neutral-800 text-neutral-300'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{b.title}</div>
                      <div className={`text-[10px] ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'}`}>{b.type}</div>
                    </div>
                    {commentCount > 0 && (
                      <div className="bg-yellow-500/20 text-yellow-600 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0">
                        {commentCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Center - Preview */}
        <main className={`flex-1 flex flex-col border rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'}`}>
            <div className="flex items-center gap-2 text-sm">
              <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>Preview:</span>
              <span className={`text-xs rounded px-2 py-1 ${theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black'}`}>{device}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDevice('desktop')} className={`px-3 py-1.5 rounded text-xs font-medium ${device === 'desktop' ? 'bg-[#b654a7] text-white' : theme === 'dark' ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}>
                Desktop
              </button>
              <button onClick={() => setDevice('tablet')} className={`px-3 py-1.5 rounded text-xs font-medium ${device === 'tablet' ? 'bg-[#b654a7] text-white' : theme === 'dark' ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}>
                Tablet
              </button>
              <button onClick={() => setDevice('mobile')} className={`px-3 py-1.5 rounded text-xs font-medium ${device === 'mobile' ? 'bg-[#b654a7] text-white' : theme === 'dark' ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}>
                Mobile
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className={`p-4 preview-wrapper ${device} ${theme === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'}`} ref={previewRef} dangerouslySetInnerHTML={{ __html: compiledHtml || '<div>No preview</div>' }} style={{ minHeight: '100%', maxWidth: '100%', boxSizing: 'border-box' }} />
          </div>
        </main>

        {/* Right Sidebar - Comments */}
        <aside className={`${commentsCollapsed ? 'w-12' : 'w-80'} flex flex-col border rounded-2xl overflow-hidden transition-all ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-50'}`}>
            {!commentsCollapsed && (
              <>
                <h3 className="font-semibold text-sm">Comments</h3>
                <div className="flex items-center gap-1">
                  <button onClick={jumpToNextComment} className={`p-1 rounded text-xs ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`} title="Next comment">
                    <GrCaretNext size={16} />
                  </button>
                  <button onClick={() => setCommentsCollapsed(true)} className={`p-1 rounded text-xs ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
                    <TiThMenu size={16} />
                  </button>
                </div>
              </>
            )}
            {commentsCollapsed && (
              <button onClick={() => setCommentsCollapsed(false)} className={`p-1 rounded text-xs mx-auto ${theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
                <TiThMenu size={16} />
              </button>
            )}
          </div>
          {!commentsCollapsed && (
            <div className="flex-1 overflow-y-auto p-3">
              {selectedBlock ? (
                <CommentThread newsletterId={newsletterId} blockId={selectedBlock} />
              ) : (
                <div className={`text-xs text-center py-8 ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Select a section to view comments</div>
              )}
            </div>
          )}
        </aside>
      </div>

      {showSendModal && (
        <div onClick={() => { setShowSendModal(false); setSendResult(null); }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div onClick={(e) => e.stopPropagation()} className={`border rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <h3 className="text-lg font-bold">Send Newsletter</h3>

            {/* Send to self */}
            <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-50 border border-neutral-200'}`}>
              <div>
                <p className="text-sm font-semibold">Send to myself</p>
                <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>{user?.email || 'your account email'}</p>
              </div>
              <button
                onClick={handleSendToSelf}
                disabled={sendingToSelf}
                className="px-3 py-1.5 rounded-lg bg-[#b654a7] text-white text-xs font-semibold disabled:opacity-50"
              >
                {sendingToSelf ? 'Sending…' : 'Send Preview'}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
              <span className={`text-xs ${theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'}`}>or send to a list</span>
              <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
            </div>

            {/* Subject */}
            <div>
              <label className={`text-xs mb-1.5 block font-semibold ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>Subject (optional)</label>
              <input
                value={sendSubject}
                onChange={(e) => setSendSubject(e.target.value)}
                placeholder="The AIRIS Chronicle"
                className={`w-full rounded-lg px-3 py-2 text-sm ${theme === 'dark' ? 'bg-neutral-900 border border-neutral-800 text-neutral-200' : 'bg-neutral-50 border border-neutral-200 text-black'}`}
              />
            </div>

            {/* Add recipient input */}
            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>Recipients ({recipients.length})</label>
              <div className="flex gap-2">
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(emailInput); } }}
                  placeholder="name@example.com"
                  className={`flex-1 rounded-lg px-3 py-2 text-sm ${theme === 'dark' ? 'bg-neutral-900 border border-neutral-800 text-neutral-200' : 'bg-neutral-50 border border-neutral-200 text-black'}`}
                />
                <button
                  onClick={() => addRecipient(emailInput)}
                  className="px-3 py-2 rounded-lg text-sm bg-[#b654a7]/20 text-[#b654a7] hover:bg-[#b654a7]/30 font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Recipient chips (scrollable) */}
            {recipients.length > 0 && (
              <div className={`max-h-36 overflow-y-auto rounded-xl p-2 flex flex-wrap gap-1.5 ${theme === 'dark' ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-50 border border-neutral-200'}`}>
                {recipients.map((email) => (
                  <div key={email} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'}`}>
                    <span className="max-w-[180px] truncate">{email}</span>
                    <button onClick={() => removeRecipient(email)} className="text-neutral-500 hover:text-red-400 leading-none">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Send result */}
            {sendResult && (
              <p className={`text-sm font-medium ${sendResult.failed === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                ✓ Sent to {sendResult.succeeded} — {sendResult.failed} failed
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setShowSendModal(false); setSendResult(null); }} className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black hover:bg-neutral-300'}`}>Close</button>
              <button
                onClick={handleSend}
                disabled={sending || recipients.length === 0}
                className="px-4 py-2 rounded-lg bg-[#b654a7] text-white text-sm font-semibold disabled:opacity-50"
              >
                {sending ? 'Sending…' : `Send to ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div onClick={() => setShowApproveModal(false)} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div onClick={(e) => e.stopPropagation()} className={`border rounded-2xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <h3 className="text-lg font-bold mb-2">Confirm approval</h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Approving will mark the newsletter as Approved and save the current compiled HTML as the final content. This action cannot be easily undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowApproveModal(false)} className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black hover:bg-neutral-300'}`}>Cancel</button>
              <button onClick={handleApprove} disabled={approving} className="px-3 py-2 rounded-lg bg-[#b654a7] text-white text-sm">{approving ? 'Approving…' : 'Confirm Approve'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .preview-wrapper {
          background: transparent;
          color: inherit;
          max-width: 100%;
        }
        .preview-wrapper.desktop { max-width: 900px; margin: 0 auto; }
        .preview-wrapper.tablet { max-width: 720px; margin: 0 auto; }
        .preview-wrapper.mobile { max-width: 420px; margin: 0 auto; }
        .ap-selected-block { outline: 3px solid rgba(182, 84, 167, 0.6); border-radius: 6px; }
      `}</style>
    </div>
  );
}
