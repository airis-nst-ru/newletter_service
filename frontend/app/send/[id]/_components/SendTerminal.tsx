"use client";

import { useRef, useEffect } from "react";

export type LogEntry = {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
};

export type SendResult = {
  success: boolean;
  message: string;
  total?: number;
  succeeded?: number;
  failed?: number;
  results?: Array<{ email: string; success: boolean; error?: string }>;
};

interface Props {
  logs: LogEntry[];
  finalResult: SendResult | null;
  onClear: () => void;
}

export function SendTerminal({ logs, finalResult, onClear }: Props) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, finalResult]);

  const levelColor = (level: LogEntry["level"]) => {
    if (level === "error") return "text-red-400";
    if (level === "warn")  return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="w-1/2 shrink-0 border-l border-neutral-800 bg-neutral-950 flex flex-col h-full overflow-hidden">
      {/* Traffic-light header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-neutral-500 font-mono">send log</span>
        <button
          onClick={onClear}
          className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer"
        >
          clear
        </button>
      </div>

      {/* Log body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs space-y-1">
        {logs.length === 0 && !finalResult && (
          <p className="text-neutral-700 mt-4 text-center">
            Logs will appear here when you send.
          </p>
        )}

        {logs.map((entry, i) => (
          <div key={i} className="flex gap-2 leading-5">
            <span className="text-neutral-700 shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className={`shrink-0 font-semibold ${levelColor(entry.level)}`}>
              [{entry.level.toUpperCase()}]
            </span>
            <span className="text-neutral-300 break-all">{entry.message}</span>
          </div>
        ))}

        {finalResult && (
          <div className="mt-4 border border-neutral-700 rounded-xl p-3 space-y-2">
            <p className={`text-xs font-semibold ${finalResult.success ? "text-green-400" : "text-red-400"}`}>
              {finalResult.success ? "✓ COMPLETE" : "✗ FAILED"} — {finalResult.message}
            </p>

            {typeof finalResult.total !== "undefined" && (
              <div className="flex gap-4 text-xs">
                <span className="text-neutral-400">
                  Total: <span className="text-white">{finalResult.total}</span>
                </span>
                <span className="text-green-400">✓ {finalResult.succeeded}</span>
                <span className="text-red-400">✗ {finalResult.failed}</span>
              </div>
            )}

            {Array.isArray(finalResult.results) && (
              <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
                {finalResult.results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 text-xs ${r.success ? "text-green-400" : "text-red-400"}`}
                  >
                    <span>{r.success ? "✓" : "✗"}</span>
                    <span className="text-neutral-300">{r.email}</span>
                    {r.error && (
                      <span className="text-red-500 truncate">{r.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
