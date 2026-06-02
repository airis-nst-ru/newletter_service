"use client";

import React from "react";
import type { Comment as C, CommentReply } from "@/types/Comment";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/context/AuthContext";

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
          <button onClick={() => onToggleResolve(!comment.resolved)} className={`px-2 py-1 rounded-md text-xs ${comment.resolved ? 'bg-green-700 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
            {comment.resolved ? 'Resolved' : 'Resolve'}
          </button>
          {user?.accountType === 'Approver' && (
            <button onClick={() => onDelete(comment.id)} className="px-2 py-1 rounded-md text-xs bg-red-700 text-white">Delete</button>
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
