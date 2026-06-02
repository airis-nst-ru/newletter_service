"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Block } from "../../types/types";
import { defaultBlocks, createBlockWithDefaults } from "../../components/editor/templates/defaultBlocks";
import { HeaderHtml } from "../../components/editor/templates/HeaderBlock";
import { HeroHtml } from "../../components/editor/templates/HeroBlock";
import { SectionHtml } from "../../components/editor/templates/SectionBlock";
import { FeatureComparisonHtml } from "../../components/editor/templates/FeatureComparisonBlock";
import { BenchmarkTableHtml } from "../../components/editor/templates/BenchmarkTableBlock";
import { MemberSpotlightHtml } from "../../components/editor/templates/MemberSpotlightBlock";
import { TechnicalSessionHtml } from "../../components/editor/templates/TechnicalSessionBlock";
import { AirisReadsHtml } from "../../components/editor/templates/AirisReadsBlock";
import { ConclusionHtml } from "../../components/editor/templates/ConclusionBlock";
import { FooterHtml } from "../../components/editor/templates/FooterBlock";
import { UnsubscribeHtml } from "../../components/editor/templates/UnsubscribeBlock";
import { DividerHtml } from "../../components/editor/templates/DividerBlock";

function generateHtmlFromBlocks(blocks: Block[]): string {
  const bodyRows = blocks.filter(block => !block.hidden).map(block => {
    switch (block.type) {
      case "header":
        return HeaderHtml(block);
      case "hero":
        return HeroHtml(block);
      case "section":
        return SectionHtml(block);
      case "featureComparison":
        return FeatureComparisonHtml(block);
      case "benchmarkTable":
        return BenchmarkTableHtml(block);
      case "memberSpotlight":
        return MemberSpotlightHtml(block);
      case "technicalSession":
        return TechnicalSessionHtml(block);
      case "airisReads":
        return AirisReadsHtml(block);
      case "conclusion":
        return ConclusionHtml(block);
      case "footer":
        return FooterHtml(block);
      case "unsubscribe":
        return UnsubscribeHtml(block);
      case "divider":
        return DividerHtml(block);
      default:
        return '';
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="telephone=no" name="format-detection">
    <title>The AIRIS Chronicle</title>
    <style type="text/css">
      body, p, h1, h2, h3 { margin: 0; padding: 0; }
      body { width: 100%; height: 100%; font-family: arial, 'helvetica neue', helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #F0F4F2; }
      a { text-decoration: none; }
      img { display: block; border: 0; outline: none; text-decoration: none; margin: 0; }
      table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      td { border-collapse: collapse; }
      .highlight { color: #b654a7; }
      @media only screen and (max-width: 600px) {
        .wrapper { width: 100% !important; }
        .responsive-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; border-left: none !important; }
        .hero-title { font-size: 30px !important; }
        .footer-col { display: block !important; width: 100% !important; text-align: center !important; }
        .footer-logo { margin: 0 auto !important; }
        .social-table { margin: 16px auto 0 !important; }
      }
    </style>
  </head>
  <body style="width:100%;height:100%;font-family:arial,'helvetica neue',helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;margin:0;background-color:#F0F4F2">
    <table cellpadding="0" cellspacing="0" role="none" width="100%" style="border-collapse:collapse;border-spacing:0;padding:0;margin:0;width:100%;height:100%;background-color:#F0F4F2">
      <tr>
        <td align="center" valign="top" style="padding:0;margin:0">
          <table align="center" cellpadding="0" cellspacing="0" width="600" class="wrapper" style="max-width:600px;width:100%;background-color:#ffffff">
            <!-- Top divider -->
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
${bodyRows}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

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
  handleSave: (silent?: boolean) => Promise<void>;
  handleApprove: () => Promise<void>;
  handleSend: () => Promise<void>;
  updateSelectedBlockField: (field: keyof Block, value: any) => void;
  moveBlock: (index: number, direction: "up" | "down") => void;
  deleteBlock: (id: string) => void;
  addBlock: (type: string) => void;
  openMediaLibraryForField: (blockId: string, field: keyof Block) => void;
  handleMediaSelect: (url: string) => void;
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
  const [approving, setApproving] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showAddBlockOverlay, setShowAddBlockOverlay] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<{ blockId: string; field: keyof Block } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const selectedBlock = useMemo(() => {
    return blocks.find(b => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  const compiledHtml = useMemo(() => {
    return generateHtmlFromBlocks(blocks);
  }, [blocks]);

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

        if (newsletter.content?.state) {
          try {
            const parsedBlocks = JSON.parse(newsletter.content.state);
            setBlocks(parsedBlocks);
            if (parsedBlocks.length > 0) {
              setSelectedBlockId(parsedBlocks[0].id);
            }
          } catch (e) {
            console.error("Error parsing state, falling back to defaults", e);
            setBlocks(defaultBlocks);
            setSelectedBlockId(defaultBlocks[0].id);
          }
        } else {
          setBlocks(defaultBlocks);
          setSelectedBlockId(defaultBlocks[0].id);
        }
      } catch (error) {
        console.error("Error fetching newsletter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [newsletterId]);

  // Save Newsletter
  const handleSave = async (silent = false) => {
    try {
      if (!silent) setSaving(true);
      const response = await fetch(`/api/v1/newsletters/${newsletterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newsletterTitle,
          content: compiledHtml,
          state: JSON.stringify(blocks)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save newsletter");
      }

      if (!silent) {
        alert("Newsletter saved successfully!");
      }
    } catch (error: any) {
      console.error(error);
      if (!silent) {
        alert(`Error saving: ${error.message}`);
      }
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Approve Newsletter
  const handleApprove = async () => {
    try {
      setApproving(true);
      await handleSave(true);

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
      alert("Newsletter status updated to Approved!");
    } catch (error: any) {
      console.error(error);
      alert(`Error approving: ${error.message}`);
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
      await handleSave(true);

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
        updateSelectedBlockField,
        moveBlock,
        deleteBlock,
        addBlock,
        openMediaLibraryForField,
        handleMediaSelect,
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
