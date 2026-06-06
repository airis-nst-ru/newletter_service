"use client";

import React, { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import ReplyComposer from "./ReplyComposer";
import { useAuth } from "@/app/context/AuthContext";
import type { Comment as C } from "@/types/Comment";
import { useEditor } from "../../app/context/EditorContext";

export default function CommentThread({ newsletterId, blockId }: { newsletterId: string; blockId: string }) {
  const [comments, setComments] = useState<C[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  // Call global refresh if available in editor context
  let globalFetchComments: (() => Promise<void>) | undefined;
  try {
    const editorCtx = useEditor();
    globalFetchComments = editorCtx?.fetchComments;
  } catch (e) {
    // Not in editor context (e.g. in approver view)
  }

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setComments((data.data || []).filter((c: C) => c.blockId === blockId));
      globalFetchComments?.();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchComments(); }, [newsletterId, blockId]);

  const handleNewReply = async (commentId: string, payload: { type: 'text'|'voice'; text?: string; voiceUrl?: string }) => {
    try {
      if (payload.type === 'voice' && payload.voiceUrl && payload.voiceUrl.startsWith('data:')) {
        // upload to cloudinary
        setUploading(true);
        const up = await fetch(`/api/v1/uploads/voice`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64: payload.voiceUrl }) });
        const d = await up.json();
        if (!up.ok) throw new Error(d.message || 'Upload failed');
        payload.voiceUrl = d.url;
      }

      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments/${commentId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reply');
      await fetchComments();
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally { setUploading(false); }
  };

  const handleToggleResolve = async (commentId: string, resolved: boolean) => {
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments/${commentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      await fetchComments();
    } catch (err) {
      console.error(err);
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      if (!confirm('Delete this comment?')) return;
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments/${commentId}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to delete');
      await fetchComments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  const handleNewComment = async (content: string) => {
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockId, content }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed');
      await fetchComments();
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-50 rounded-2xl p-4">
      <h4 className="text-sm font-bold mb-3">Comments</h4>
      {loading ? <div className="text-sm text-neutral-400">Loading comments…</div> : null}

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id}>
            <CommentItem comment={c} onReply={(p) => handleNewReply(c.id, p)} onToggleResolve={(r) => handleToggleResolve(c.id, r)} onDelete={(id) => handleDeleteComment(id)} />
            <div className="mt-2">
              <ReplyComposer onSend={async (p) => await handleNewReply(c.id, p)} uploading={uploading} />
            </div>
          </div>
        ))}
      </div>

      {user?.accountType === "Approver" && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-neutral-400 mb-2">Add a new comment</h5>
          <ReplyComposer onSend={async (p) => { if (p.type === 'text' && p.text) await handleNewComment(p.text); else if (p.type === 'voice' && p.voiceUrl) {
            setUploading(true);
            try {
              const up = await fetch(`/api/v1/uploads/voice`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ base64: p.voiceUrl }) });
              const d = await up.json();
              if (!up.ok) throw new Error(d.message||'Upload failed');
              // create a comment containing a short note and voice reply as first reply
              const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ blockId, content: 'Voice comment' }) });
              const cd = await res.json();
              if (!res.ok) throw new Error(cd.message||'Failed to create comment');
              const commentId = cd.data.id;
              await handleNewReply(commentId, { type: 'voice', voiceUrl: d.url });
            } catch (err) { console.error(err); alert('Failed to add voice comment'); }
            finally { setUploading(false); }
          } }} uploading={uploading} />
        </div>
      )}
    </div>
  );
}
