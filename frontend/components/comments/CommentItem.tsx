"use client";

import React from "react";
import type { Comment as C, CommentReply } from "@/types/Comment";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/context/AuthContext";
import { Check, Trash2 } from "lucide-react";

export default function CommentItem({ comment, onReply, onToggleResolve, onDelete }: { comment: C; onReply: (payload: { type: 'text'|'voice'; text?: string; voiceUrl?: string }) => Promise<void>; onToggleResolve: (resolved: boolean) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const { user } = useAuth();

  return (
    <div className="mb-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{comment.author?.username || 'Approver'}</div>
          <div className="text-xs text-neutral-400">{formatDistanceToNow(new Date(comment.createdAt))} ago</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleResolve(!comment.resolved)}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
              comment.resolved ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title={comment.resolved ? 'Mark unresolved' : 'Mark resolved'}
          >
            <Check size={14} />
          </button>
          {user?.accountType === 'Approver' && (
            <button
              onClick={() => onDelete(comment.id)}
              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 hover:border-red-700/60 text-red-400 hover:text-red-300 transition-all duration-150 cursor-pointer"
              title="Delete Comment"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 text-sm text-neutral-200">{comment.content}</div>

      <div className="mt-3 space-y-2">
        {comment.replies?.map((r: CommentReply) => (
          <div key={r.id} className="pl-3">
            <div className="text-xs text-neutral-400">{r.author?.username || 'You'} • {formatDistanceToNow(new Date(r.createdAt))} ago</div>
            {r.type === 'text' ? (
              <div className="text-sm text-neutral-200">{r.text}</div>
            ) : r.voiceUrl ? (
              <audio controls src={r.voiceUrl} className="mt-1 w-full" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3">
        {/* reply handled by parent ReplyComposer component */}
      </div>
    </div>
  );
}
