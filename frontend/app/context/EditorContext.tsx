"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Block } from "../../types/types";
import { defaultBlocks, createBlockWithDefaults } from "../../components/editor/templates/defaultBlocks";
import { useDebounce } from "../../lib/useDebounce";


interface EditorContextProps {
  newsletterId: string;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  selectedBlock: Block | null;
  newsletterTitle: string;
  setNewsletterTitle: (title: string) => void;
  newsletterStatus: string;
  setNewsletterStatus: (status: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  loading: boolean;
  saving: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  approving: boolean;
  sending: boolean;
  viewMode: "visual" | "html";
  setViewMode: (mode: "visual" | "html") => void;
  showMediaModal: boolean;
  setShowMediaModal: (show: boolean) => void;
  showAddBlockOverlay: boolean;
  setShowAddBlockOverlay: (show: boolean) => void;
  mediaTargetField: { blockId: string; field: keyof Block } | null;
  setMediaTargetField: (field: { blockId: string; field: keyof Block } | null) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  previewDevice: "desktop" | "tablet" | "mobile";
  setPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void;
  compiledHtml: string;
  handleSave: () => Promise<void>;
  handleApprove: () => Promise<void>;
  handleSend: () => Promise<void>;
  handleSendForApproval: () => Promise<void>;
  updateSelectedBlockField: (field: keyof Block, value: any) => void;
  moveBlock: (index: number, direction: "up" | "down") => void;
  deleteBlock: (id: string) => void;
  addBlock: (type: string) => void;
  openMediaLibraryForField: (blockId: string, field: keyof Block) => void;
  handleMediaSelect: (url: string) => void;
  hasUnsavedChanges: boolean;

  // Comments API
  commentsByBlock: Record<string, any[]>;
  fetchComments: () => Promise<void>;
  addComment: (blockId: string, content: string) => Promise<void>;
  replyToComment: (commentId: string, payload: { type: 'text' | 'voice'; text?: string; voiceUrl?: string }) => Promise<void>;
  toggleCommentResolved: (commentId: string, resolved: boolean) => Promise<void>;
  uploadVoice: (base64: string) => Promise<string>;

  user: any;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export function EditorProvider({ children, newsletterId }: { children: React.ReactNode; newsletterId: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("Draft");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [compiledHtml, setCompiledHtml] = useState("");

  // Comments state: keyed by blockId
  const [commentsByBlock, setCommentsByBlock] = useState<Record<string, any[]>>({});

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch comments");
      const comments = data.data || [];
      const grouped: Record<string, any[]> = {};
      comments.forEach((c: any) => {
        if (!grouped[c.blockId]) grouped[c.blockId] = [];
        grouped[c.blockId].push(c);
      });
      setCommentsByBlock(grouped);
    } catch (err) {
      console.error("[fetchComments]", err);
    }
  };

  const addComment = async (blockId: string, content: string) => {
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add comment");
      // refresh
      await fetchComments();
    } catch (err) {
      console.error("[addComment]", err);
      throw err;
    }
  };

  const replyToComment = async (commentId: string, payload: { type: 'text' | 'voice'; text?: string; voiceUrl?: string }) => {
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments/${commentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reply");
      await fetchComments();
    } catch (err) {
      console.error("[replyToComment]", err);
      throw err;
    }
  };

  const toggleCommentResolved = async (commentId: string, resolved: boolean) => {
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update comment");
      await fetchComments();
    } catch (err) {
      console.error("[toggleCommentResolved]", err);
      throw err;
    }
  };

  const uploadVoice = async (base64: string) => {
    try {
      const res = await fetch(`/api/v1/uploads/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data.url as string;
    } catch (err) {
      console.error("[uploadVoice]", err);
      throw err;
    }
  };

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [approving, setApproving] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showAddBlockOverlay, setShowAddBlockOverlay] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<{ blockId: string; field: keyof Block } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");


  const selectedBlock = useMemo(() => {
    return blocks.find(b => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);


  // Debounce blocks — auto-save fires 1.5s after last change
  const debouncedBlocks = useDebounce(blocks, 1500);

  // Fetch Newsletter
  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/newsletters/${newsletterId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch newsletter");
        }

        const newsletter = data.data;
        setNewsletterTitle(newsletter.content?.title || "Untitled Newsletter");
        setNewsletterStatus(newsletter.status || "Draft");
        setDueDate(newsletter.dueDate);

        if (newsletter.content?.state !== undefined && newsletter.content?.state !== null) {
          const s: any = newsletter.content.state;
          try {
            if (typeof s === 'string') {
              // Could be a JSON-encoded array or a sentinel string like "seeking approval"
              try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) {
                  setBlocks(parsed);
                  if (parsed.length > 0) setSelectedBlockId(parsed[0].id);
                  lastSavedStateRef.current = JSON.stringify(parsed);
                } else {
                  // parsed to a non-array value; treat as sentinel (fall back to defaults)
                  setBlocks(defaultBlocks);
                  setSelectedBlockId(defaultBlocks[0].id);
                  lastSavedStateRef.current = JSON.stringify(defaultBlocks);
                }
              } catch (e) {
                // Not JSON — this is a sentinel string (e.g. "seeking approval").
                // Don't log as an error; just fall back to defaults silently.
                setBlocks(defaultBlocks);
                setSelectedBlockId(defaultBlocks[0].id);
                lastSavedStateRef.current = JSON.stringify(defaultBlocks);
              }
            } else if (Array.isArray(s)) {
              setBlocks(s);
              if (s.length > 0) setSelectedBlockId(s[0].id);
              lastSavedStateRef.current = JSON.stringify(s);
            } else if (typeof s === 'object') {
              // server may store JSON directly — if object is an array-like structure, handle
              if (Array.isArray(s)) {
                setBlocks(s);
                if (s.length > 0) setSelectedBlockId(s[0].id);
                lastSavedStateRef.current = JSON.stringify(s);
              } else {
                setBlocks(defaultBlocks);
                setSelectedBlockId(defaultBlocks[0].id);
                lastSavedStateRef.current = JSON.stringify(defaultBlocks);
              }
            } else {
              setBlocks(defaultBlocks);
              setSelectedBlockId(defaultBlocks[0].id);
              lastSavedStateRef.current = JSON.stringify(defaultBlocks);
            }
          } catch (e) {
            console.error("Error parsing state, falling back to defaults", e);
            setBlocks(defaultBlocks);
            setSelectedBlockId(defaultBlocks[0].id);
            lastSavedStateRef.current = JSON.stringify(defaultBlocks);
          }
        } else {
          setBlocks(defaultBlocks);
          setSelectedBlockId(defaultBlocks[0].id);
          lastSavedStateRef.current = JSON.stringify(defaultBlocks);
        }

        // Seed compiledHtml from fetched content so it's not empty on first render
        if (newsletter.content?.content) {
          setCompiledHtml(newsletter.content.content);
        }
      } catch (error) {
        console.error("Error fetching newsletter:", error);
      } finally {
        setLoading(false);
        // Mark initial load done so auto-save doesn't fire on hydration
        setTimeout(() => setIsInitialLoad(false), 500);
      }
    };

    fetchNewsletter();
  }, [newsletterId]);

  // --- Queued save mechanism ---
  const saveQueueRef = React.useRef<Block[][]>([]);
  const pendingFlushTimeoutRef = React.useRef<number | null>(null);
  const isFlushingRef = React.useRef(false);
  const lastSavedStateRef = React.useRef<string>("");

  const hasUnsavedChanges = React.useMemo(() => {
    try {
      return JSON.stringify(blocks) !== lastSavedStateRef.current;
    } catch (e) {
      return false;
    }
  }, [blocks]);

  const flushQueue = React.useCallback(async () => {
    if (isFlushingRef.current) return;
    const queue = saveQueueRef.current;
    if (!queue || queue.length === 0) return;

    // Use the most recent queued state
    const stateToSave = queue[queue.length - 1];
    // clear queue immediately to coalesce further changes while saving
    saveQueueRef.current = [];

    isFlushingRef.current = true;
    setSaveState("saving");

    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateToSave }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Save failed");

      setCompiledHtml(data.compiledHtml);
      if (data.state && Array.isArray(data.state)) {
        setBlocks(data.state);
        lastSavedStateRef.current = JSON.stringify(data.state);
      } else {
        lastSavedStateRef.current = JSON.stringify(stateToSave);
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      console.error("[QueuedSave] Error:", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    } finally {
      isFlushingRef.current = false;
      // If more items queued while flushing, schedule another flush
      if (saveQueueRef.current.length > 0) {
        if (pendingFlushTimeoutRef.current) window.clearTimeout(pendingFlushTimeoutRef.current as any);
        pendingFlushTimeoutRef.current = window.setTimeout(() => flushQueue(), 500) as unknown as number;
      }
    }
  }, [newsletterId]);

  // Enqueue debounced state changes and flush after short delay — avoids saving unchanged state
  useEffect(() => {
    if (isInitialLoad || loading) return;

    const json = JSON.stringify(debouncedBlocks);
    if (!debouncedBlocks || debouncedBlocks.length === 0) return;

    // If identical to last saved state, skip enqueueing
    if (json === lastSavedStateRef.current) return;

    saveQueueRef.current.push(debouncedBlocks);

    if (pendingFlushTimeoutRef.current) {
      window.clearTimeout(pendingFlushTimeoutRef.current as any);
    }
    // Schedule flush after 1s of quiescence
    pendingFlushTimeoutRef.current = window.setTimeout(() => flushQueue(), 1000) as unknown as number;

  }, [debouncedBlocks, isInitialLoad, loading, flushQueue]);

  // If the editor changes after a Seeking_Approval/Approved state, reset newsletter.status to Draft
  useEffect(() => {
    if (isInitialLoad || loading) return;
    if (!debouncedBlocks || debouncedBlocks.length === 0) return;

    const json = JSON.stringify(debouncedBlocks);
    // If no real change compared to last saved, do nothing
    if (json === lastSavedStateRef.current) return;

    if (newsletterStatus === "Seeking_Approval" || newsletterStatus === "Approved") {
      // Update server-side status to Draft so approver must re-approve after changes
      const revertStatus = async () => {
        try {
          setSaveState("saving");
          const res = await fetch(`/api/v1/newsletters/${newsletterId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Draft" }),
          });
          const data = await res.json();
          if (!res.ok) {
            console.error("Failed to revert status to Draft:", data);
          } else {
            setNewsletterStatus("Draft");
          }
        } catch (err) {
          console.error("Error reverting status to Draft:", err);
        } finally {
          setTimeout(() => setSaveState("idle"), 1000);
        }
      };

      // Fire and forget — no need to await here (user continues editing)
      revertStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBlocks]);

  // Manual save — enqueue current state and flush immediately
  const handleSave = async () => {
    setSaving(true);
    try {
      // Avoid enqueueing if identical to last saved state
      const json = JSON.stringify(blocks);
      if (json !== lastSavedStateRef.current) {
        saveQueueRef.current.push(blocks);
        if (pendingFlushTimeoutRef.current) {
          window.clearTimeout(pendingFlushTimeoutRef.current as any);
          pendingFlushTimeoutRef.current = null;
        }
        await flushQueue();
      }
    } catch (error: any) {
      console.error("[ManualSave] Error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Approve Newsletter
  const handleApprove = async () => {
    try {
      setApproving(true);
      await handleSave();

      const response = await fetch(`/api/v1/newsletters/${newsletterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "Approved"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to approve newsletter");
      }

      setNewsletterStatus("Approved");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (error: any) {
      console.error(error);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    } finally {
      setApproving(false);
    }
  };

  // Send Newsletter
  const handleSend = async () => {
    if (!confirm("Are you sure you want to mark this newsletter as sent?")) {
      return;
    }

    try {
      setSending(true);
      await handleSave();

      const response = await fetch(`/api/v1/newsletters/${newsletterId}/send`, {
        method: "PATCH"
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as sent");
      }

      setNewsletterStatus("Sent");
      alert("Newsletter successfully marked as Sent!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      alert(`Error sending: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Send for approval: save current state then update newsletter.status to Seeking_Approval
  const handleSendForApproval = async () => {
    try {
      setSaveState("saving");
      // ensure latest state is saved first
      await handleSave();

      const response = await fetch(`/api/v1/newsletters/${newsletterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Seeking_Approval" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to request approval");

      // Update local status to Seeking_Approval if server accepted
      setNewsletterStatus("Seeking_Approval");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
      // UI will show a confirmation dialog/modal; no alert here
    } catch (err: any) {
      console.error("[SendForApproval]", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };


  const updateSelectedBlockField = (field: keyof Block, value: any) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === selectedBlockId) {
        return { ...b, [field]: value };
      }
      return b;
    }));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setBlocks(updated);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      alert("You must keep at least one block in the newsletter!");
      return;
    }
    const index = blocks.findIndex(b => b.id === id);
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);

    if (selectedBlockId === id) {
      const nextSelect = updated[Math.min(index, updated.length - 1)];
      setSelectedBlockId(nextSelect.id);
    }
  };

  const addBlock = (type: string) => {
    const newId = `${type}-${Date.now()}`;
    const newBlock = createBlockWithDefaults(type, newId);
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  const openMediaLibraryForField = (blockId: string, field: keyof Block) => {
    setMediaTargetField({ blockId, field });
    setShowMediaModal(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetField) {
      setBlocks(prev => prev.map(b => {
        if (b.id === mediaTargetField.blockId) {
          return { ...b, [mediaTargetField.field]: url };
        }
        return b;
      }));
    }
    setShowMediaModal(false);
    setMediaTargetField(null);
  };

  return (
    <EditorContext.Provider
      value={{
        newsletterId,
        blocks,
        setBlocks,
        selectedBlockId,
        setSelectedBlockId,
        selectedBlock,
        newsletterTitle,
        setNewsletterTitle,
        newsletterStatus,
        setNewsletterStatus,
        dueDate,
        setDueDate,
        loading,
        saving,
        saveState,
        approving,
        sending,
        viewMode,
        setViewMode,
        showMediaModal,
        setShowMediaModal,
        showAddBlockOverlay,
        setShowAddBlockOverlay,
        mediaTargetField,
        setMediaTargetField,
        isDarkMode,
        setIsDarkMode,
        previewDevice,
        setPreviewDevice,
        compiledHtml,
        handleSave,
        handleApprove,
        handleSend,
        handleSendForApproval,
        updateSelectedBlockField,
        moveBlock,
        deleteBlock,
        addBlock,
        openMediaLibraryForField,
        handleMediaSelect,
        hasUnsavedChanges,
        // Comments API
        commentsByBlock,
        fetchComments,
        addComment,
        replyToComment,
        toggleCommentResolved,
        uploadVoice,
        user
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
