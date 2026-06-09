"use client";

// ── Time estimate helpers (mirrors backend mail.service constants) ─────────────
const BATCH_SIZE        = 20;
const CONCURRENCY       = 5;
const INTER_BATCH_MS    = 4000;    // 4 s between batches
const PER_EMAIL_SMTP_MS = 1500;    // rough SMTP send time per email

function estimateSeconds(emailCount: number): number {
  const batches        = Math.ceil(emailCount / BATCH_SIZE);
  const chunksPerBatch = Math.ceil(BATCH_SIZE / CONCURRENCY);
  const batchTime      = chunksPerBatch * PER_EMAIL_SMTP_MS;            // serial chunks within batch
  const totalSendTime  = batches * batchTime;
  const totalDelay     = (batches - 1) * INTER_BATCH_MS;                // delay between batches
  return Math.ceil((totalSendTime + totalDelay) / 1000);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `~${m}m ${s}s` : `~${m}m`;
}

// ── Types ──────────────────────────────────────────────────────────────────────
export type DBRecipient = { id: string; email: string; isSubscribed: boolean };

interface Props {
  open: boolean;
  loading: boolean;               // while fetching recipients
  recipients: DBRecipient[];
  fetchError: string | null;
  newsletterTitle: string;
  subject: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function SendConfirmDialog({
  open,
  loading,
  recipients,
  fetchError,
  newsletterTitle,
  subject,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const count    = recipients.length;
  const batches  = Math.ceil(count / BATCH_SIZE);
  const estSecs  = estimateSeconds(count);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Dialog card */}
      <div
        className="relative w-full max-w-md mx-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 mx-auto mb-5">
          <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">Confirm Send</h2>
        <p className="text-neutral-500 text-sm text-center mb-6">
          You are about to send <span className="text-white font-medium">{newsletterTitle}</span>
        </p>

        {loading ? (
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-neutral-800 rounded-full animate-pulse" />
            <div className="h-4 bg-neutral-800 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-neutral-800 rounded-full w-1/2 animate-pulse" />
          </div>
        ) : fetchError ? (
          <div className="mb-6 p-4 rounded-xl border border-red-800 bg-red-500/10 text-red-400 text-sm">
            {fetchError}
          </div>
        ) : (
          <div className="mb-6 space-y-3">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">{count.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 mt-1">Recipients</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-white">{formatDuration(estSecs)}</p>
                <p className="text-xs text-neutral-500 mt-1">Est. time</p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subject</span>
                <span className="text-neutral-300 truncate max-w-[200px]">{subject || "The AIRIS Chronicle"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Batches</span>
                <span className="text-neutral-300">{batches} × {BATCH_SIZE} emails</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Concurrency</span>
                <span className="text-neutral-300">{CONCURRENCY} parallel / batch</span>
              </div>
            </div>

            {/* Warning note */}
            <p className="text-xs text-neutral-600 text-center">
              Do not close this page while sending is in progress.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !!fetchError || count === 0}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              !loading && !fetchError && count > 0
                ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
            }`}
          >
            Send to {count.toLocaleString()} recipients →
          </button>
        </div>
      </div>
    </div>
  );
}
