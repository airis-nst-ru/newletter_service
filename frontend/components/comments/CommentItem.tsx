"use client";

import React from "react";
import type { Comment as C, CommentReply } from "@/types/Comment";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/context/AuthContext";
import { Check, Trash2, Pencil, X, Loader2 } from "lucide-react";

export default function CommentItem({ comment, onReply, onToggleResolve, onDelete, onEdit }: { comment: C; onReply: (payload: { type: 'text'|'voice'; text?: string; voiceUrl?: string }) => Promise<void>; onToggleResolve: (resolved: boolean) => Promise<void>; onDelete: (id: string) => Promise<void>; onEdit?: (content: string) => Promise<void> }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [editing, setEditing] = React.useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setEditing(true);
    try {
      if (onEdit) {
        await onEdit(editContent.trim());
      }
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

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
          {comment.authorId === user?.id && (
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setEditContent(comment.content);
                } else {
                  setIsEditing(true);
                }
              }}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-all duration-150 cursor-pointer"
              title={isEditing ? 'Cancel Edit' : 'Edit Comment'}
            >
              {isEditing ? <X size={14} /> : <Pencil size={14} />}
            </button>
          )}
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

      {isEditing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={editing}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-neutral-700 transition-all resize-none"
            rows={2}
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              disabled={editing}
              className="px-2.5 py-1 text-xs rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={editing || !editContent.trim() || editContent.trim() === comment.content}
              className="px-2.5 py-1 text-xs rounded bg-white text-black hover:bg-neutral-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editing && <Loader2 className="animate-spin" size={10} />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-neutral-200">{comment.content}</div>
      )}

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
