"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { validateAuth } from "@/utils/validateAuth.utils";
import { useTitle } from "@/app/context/TitleContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type Recipient = {
  id: string;
  email: string;
  isSubscribed: boolean;
  isfromUniversity: boolean;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type Toast = { id: number; type: "success" | "error"; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
let toastIdCounter = 0;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function parseBulkEmails(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((e) => String(e).trim()).filter(Boolean);
      }
    } catch {
      // fallback
    }
  }
  return text.split(",").map((e) => e.trim()).filter(Boolean);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecipientsPage() {
  const router = useRouter();
  const { setLoginState, setLogoutState } = useAuth();
  const { setPageTitle } = useTitle();

  // Data
  const [recipients, setRecipients]   = useState<Recipient[]>([]);
  const [pagination, setPagination]   = useState<Pagination | null>(null);
  const [loading, setLoading]         = useState(true);

  // Search & filter
  const [search, setSearch]           = useState("");
  const [filterSub, setFilterSub]     = useState<"" | "true" | "false">("");
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 50;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selection
  const [selected, setSelected]       = useState<Set<string>>(new Set());

  // Modals
  const [addModal, setAddModal]       = useState<"single" | "bulk" | null>(null);
  const [editTarget, setEditTarget]   = useState<Recipient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipient | null>(null);

  // Form state (add single)
  const [addEmail, setAddEmail]       = useState("");
  const [addUniversity, setAddUniversity] = useState(false);
  const [addLoading, setAddLoading]   = useState(false);

  // Form state (bulk import)
  const [bulkText, setBulkText]       = useState("");
  const [bulkUniversity, setBulkUniversity] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult]   = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts]           = useState<Toast[]>([]);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    validateAuth()
      .then((res) => {
        if (!res) { router.push("/auth/login"); return; }
        setLoginState(res);
      })
      .catch(() => { setLogoutState(); router.push("/auth/login"); });
    setPageTitle("Recipients");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast helpers ───────────────────────────────────────────────────────────
  const toast = useCallback((type: "success" | "error", message: string) => {
    const id = ++toastIdCounter;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  // ── Fetch recipients ────────────────────────────────────────────────────────
  const fetchRecipients = useCallback(async (p = page, s = search, f = filterSub) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
    if (s) params.set("search", s);
    if (f) params.set("subscribed", f);
    try {
      const res  = await fetch(`/api/v1/email/recipients?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRecipients(data.data);
      setPagination(data.pagination);
      setSelected(new Set());
    } catch (err: any) {
      toast("error", err.message || "Failed to load recipients");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filterSub]);

  useEffect(() => { fetchRecipients(page, search, filterSub); }, [page, filterSub]);

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchRecipients(1, val, filterSub);
    }, 400);
  };

  // ── Selection ───────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === recipients.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(recipients.map((r) => r.id)));
    }
  };

  // ── Add single ──────────────────────────────────────────────────────────────
  const handleAddSingle = async () => {
    if (!addEmail.trim()) return;
    setAddLoading(true);
    try {
      const res  = await fetch("/api/v1/email/recipients", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail.trim(), isfromUniversity: addUniversity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast("success", `Added ${addEmail.trim()}`);
      setAddEmail(""); setAddUniversity(false); setAddModal(null);
      fetchRecipients(1, search, filterSub);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // ── Bulk import ─────────────────────────────────────────────────────────────
  const handleBulkImport = async () => {
    const emails = parseBulkEmails(bulkText);
    if (emails.length === 0) return;
    setBulkLoading(true); setBulkResult(null);
    try {
      const res  = await fetch("/api/v1/email/recipients/bulk", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, isfromUniversity: bulkUniversity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBulkResult(data.message);
      toast("success", data.message);
      fetchRecipients(1, search, filterSub);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Edit recipient ──────────────────────────────────────────────────────────
  const [editLoading, setEditLoading] = useState(false);
  const handleEdit = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const res  = await fetch(`/api/v1/email/recipients/${editTarget.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editTarget.email,
          isSubscribed: editTarget.isSubscribed,
          isfromUniversity: editTarget.isfromUniversity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast("success", "Recipient updated");
      setEditTarget(null);
      fetchRecipients(page, search, filterSub);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete single ───────────────────────────────────────────────────────────
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/v1/email/recipients/${deleteTarget.id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast("success", `Deleted ${deleteTarget.email}`);
      setDeleteTarget(null);
      fetchRecipients(page, search, filterSub);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Bulk delete ─────────────────────────────────────────────────────────────
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleteLoading(true);
    try {
      const res  = await fetch("/api/v1/email/recipients/bulk", {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast("success", data.message);
      setSelected(new Set());
      fetchRecipients(page, search, filterSub);
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const allSelected = recipients.length > 0 && selected.size === recipients.length;
  const someSelected = selected.size > 0;

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-in slide-in-from-top-2 ${
            t.type === "success" ? "bg-green-500/20 border border-green-600 text-green-300" : "bg-red-500/20 border border-red-600 text-red-300"
          }`}>
            {t.type === "success" ? "✓" : "✗"} {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-bold">Recipients</h1>
            {pagination && (
              <p className="text-xs text-neutral-500">{pagination.total.toLocaleString()} total subscribers</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {someSelected && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/15 border border-red-700 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {bulkDeleteLoading ? "Deleting..." : `Delete ${selected.size} selected`}
            </button>
          )}
          <button
            onClick={() => { setAddModal("bulk"); setBulkResult(null); setBulkText(""); }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Bulk Import
          </button>
          <button
            onClick={() => { setAddModal("single"); setAddEmail(""); setAddUniversity(false); }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            + Add Recipient
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-neutral-800/50">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-neutral-500 transition-colors"
          />
        </div>

        {/* Subscription filter */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-xl p-1 text-xs">
          {(["", "true", "false"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilterSub(f); setPage(1); }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterSub === f ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {f === "" ? "All" : f === "true" ? "Subscribed" : "Unsubscribed"}
            </button>
          ))}
        </div>

        {someSelected && (
          <span className="text-xs text-neutral-500">{selected.size} selected</span>
        )}
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg">No recipients found</p>
            {search && <p className="text-sm mt-1">Try a different search term</p>}
          </div>
        ) : (
          <div className="border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_120px_140px_120px_100px] gap-4 px-4 py-3 bg-neutral-900/50 border-b border-neutral-800 text-xs text-neutral-500 font-medium">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-white cursor-pointer"
                />
              </div>
              <span>Email</span>
              <span>Subscribed</span>
              <span>University</span>
              <span>Added</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-neutral-800/50">
              {recipients.map((r) => (
                <div
                  key={r.id}
                  className={`grid grid-cols-[40px_1fr_120px_140px_120px_100px] gap-4 px-4 py-3.5 items-center text-sm hover:bg-neutral-900/30 transition-colors ${
                    selected.has(r.id) ? "bg-neutral-900/50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4 rounded accent-white cursor-pointer"
                    />
                  </div>

                  <span className="text-neutral-200 truncate font-mono text-xs">{r.email}</span>

                  <span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      r.isSubscribed
                        ? "bg-green-500/10 border border-green-700 text-green-400"
                        : "bg-neutral-800 border border-neutral-700 text-neutral-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.isSubscribed ? "bg-green-400" : "bg-neutral-500"}`} />
                      {r.isSubscribed ? "Active" : "Unsub'd"}
                    </span>
                  </span>

                  <span className={`text-xs ${r.isfromUniversity ? "text-blue-400" : "text-neutral-600"}`}>
                    {r.isfromUniversity ? "🎓 University" : "External"}
                  </span>

                  <span className="text-xs text-neutral-600">{formatDate(r.createdAt)}</span>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditTarget({ ...r })}
                      className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="text-xs text-red-500 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-neutral-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-xs rounded-lg border border-neutral-700 disabled:opacity-30 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg border border-neutral-700 disabled:opacity-30 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ‹ Prev
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, page - 2);
                const p = start + i;
                if (p > pagination.totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                      p === page
                        ? "border-white bg-white text-black"
                        : "border-neutral-700 hover:bg-neutral-800"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-neutral-700 disabled:opacity-30 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Next ›
              </button>
              <button
                onClick={() => setPage(pagination.totalPages)}
                disabled={page === pagination.totalPages}
                className="px-2 py-1 text-xs rounded-lg border border-neutral-700 disabled:opacity-30 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Add single ── */}
      {addModal === "single" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setAddModal(null)}>
          <div className="w-full max-w-sm mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Add Recipient</h2>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="email@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSingle()}
                autoFocus
                className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-500 transition-colors font-mono"
              />
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addUniversity}
                  onChange={(e) => setAddUniversity(e.target.checked)}
                  className="w-4 h-4 rounded accent-white"
                />
                <span className="text-sm text-neutral-400">From university</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAddModal(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleAddSingle}
                disabled={addLoading || !addEmail.trim()}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {addLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Bulk import ── */}
      {addModal === "bulk" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setAddModal(null)}>
          <div className="w-full max-w-lg mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Bulk Import</h2>
            <p className="text-sm text-neutral-500">Paste emails separated by commas or as a JSON array.</p>
            <textarea
              rows={8}
              placeholder={'alice@example.com, bob@example.com\n\nor JSON:\n["alice@example.com", "bob@example.com"]'}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              autoFocus
              className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-neutral-500 transition-colors resize-none"
            />
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bulkUniversity}
                onChange={(e) => setBulkUniversity(e.target.checked)}
                className="w-4 h-4 rounded accent-white"
              />
              <span className="text-sm text-neutral-400">Mark all as from university</span>
            </label>
            {bulkResult && <p className="text-xs text-green-400 bg-green-500/10 border border-green-800 px-3 py-2 rounded-xl">{bulkResult}</p>}
            <div className="flex gap-3">
              <button onClick={() => setAddModal(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">Close</button>
              <button
                onClick={handleBulkImport}
                disabled={bulkLoading || !bulkText.trim()}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {bulkLoading ? "Importing..." : `Import ${parseBulkEmails(bulkText).length} emails`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit recipient ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-sm mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Edit Recipient</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={editTarget.email}
                  onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
                  className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors font-mono"
                />
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <p className="text-sm font-medium">Subscribed</p>
                    <p className="text-xs text-neutral-500">Receives newsletter emails</p>
                  </div>
                  <button
                    onClick={() => setEditTarget({ ...editTarget, isSubscribed: !editTarget.isSubscribed })}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${editTarget.isSubscribed ? "bg-green-500" : "bg-neutral-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editTarget.isSubscribed ? "left-5" : "left-1"}`} />
                  </button>
                </label>

                <div className="border-t border-neutral-800" />

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <p className="text-sm font-medium">University</p>
                    <p className="text-xs text-neutral-500">From a university domain</p>
                  </div>
                  <button
                    onClick={() => setEditTarget({ ...editTarget, isfromUniversity: !editTarget.isfromUniversity })}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${editTarget.isfromUniversity ? "bg-blue-500" : "bg-neutral-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editTarget.isfromUniversity ? "left-5" : "left-1"}`} />
                  </button>
                </label>
              </div>

              <div className="text-xs text-neutral-600 space-y-0.5">
                <p>Added: {formatDate(editTarget.createdAt)}</p>
                <p>Updated: {formatDate(editTarget.updatedAt)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditTarget(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleEdit}
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm delete single ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-700 mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Delete Recipient?</h2>
              <p className="text-sm text-neutral-500 mt-1 break-all">{deleteTarget.email}</p>
              <p className="text-xs text-neutral-600 mt-2">This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
              <button
                onClick={handleDeleteSingle}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
