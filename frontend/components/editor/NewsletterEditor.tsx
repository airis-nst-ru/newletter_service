"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MediaManager from "@/components/editor/MediaManager";
import {
  ArrowLeft,
  Save,
  Check,
  Eye,
  Code,
  Sun,
  Moon,
  History,
  BookmarkPlus
} from "lucide-react";

import { NewsletterVersion } from "@/types/types";

import { EditorProvider, useEditor } from "../../app/context/EditorContext";
import LeftPane from "./LeftPane";
import CenterPane from "./CenterPane";
import RightPane from "./RightPane";

import { HeaderSkeleton } from "./templates/HeaderBlock";
import { HeroSkeleton } from "./templates/HeroBlock";
import { SectionSkeleton } from "./templates/SectionBlock";
import { FeatureComparisonSkeleton } from "./templates/FeatureComparisonBlock";
import { BenchmarkTableSkeleton } from "./templates/BenchmarkTableBlock";
import { MemberSpotlightSkeleton } from "./templates/MemberSpotlightBlock";
import { TechnicalSessionSkeleton } from "./templates/TechnicalSessionBlock";
import { AirisReadsSkeleton } from "./templates/AirisReadsBlock";
import { ConclusionSkeleton } from "./templates/ConclusionBlock";
import { FooterSkeleton } from "./templates/FooterBlock";
import { UnsubscribeSkeleton } from "./templates/UnsubscribeBlock";
import { DividerSkeleton } from "./templates/DividerBlock";
import { FaSyncAlt } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { MdError } from "react-icons/md";
import { useAuth } from "@/app/context/AuthContext";
import { validateAuth } from "@/utils/validateAuth.utils";

function NewsletterEditorContent() {
  const router = useRouter();
  const { setLoginState, setLogoutState } = useAuth();
  const [authLoading, setAuthLoading] = React.useState(true);

  React.useEffect(() => {
    validateAuth()
      .then((res) => {
        if (!res) {
          setLogoutState();
          router.push("/auth/login");
          return;
        }
        setLoginState(res);
        if (res.accountType !== "Editor") {
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

  const {
    user,
    newsletterId,
    blocks,
    setBlocks,
    compiledHtml,
    newsletterTitle,
    setNewsletterTitle,
    newsletterStatus,
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
    isDarkMode,
    setIsDarkMode,
    handleSave,
    handleApprove,
    handleSend,
    handleSendForApproval,
    handleMediaSelect,
    addBlock,
    hasUnsavedChanges
  } = useEditor();

  const [showSendForApprovalModal, setShowSendForApprovalModal] = React.useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
  const [showVersionHistory, setShowVersionHistory] = React.useState(false);
  const [versions, setVersions] = React.useState<NewsletterVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = React.useState(false);
  const [savingVersion, setSavingVersion] = React.useState(false);
  
  const fetchVersions = async () => {
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/versions`);
      const data = await res.json();
      if (data.success) {
        setVersions(data.versions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSaveVersion = async () => {
    if (savingVersion) return;
    setSavingVersion(true);
    try {
      // First ensure the latest state is saved as draft
      await handleSave();
      
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: blocks,
          content: compiledHtml
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Version saved successfully!");
        if (showVersionHistory) fetchVersions();
      } else {
        alert("Failed to save version: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error saving version");
    } finally {
      setSavingVersion(false);
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!confirm("Are you sure you want to restore this version? Your current unsaved progress will be lost.")) return;
    
    try {
      const res = await fetch(`/api/v1/newsletters/${newsletterId}/versions/${versionId}`);
      const data = await res.json();
      if (data.success && data.version.state) {
        let parsed = data.version.state;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        setBlocks(parsed);
        setShowVersionHistory(false);
        alert("Version restored!");
      }
    } catch (e) {
      console.error(e);
      alert("Error restoring version");
    }
  };

  React.useEffect(() => {
    if (showVersionHistory) {
      fetchVersions();
    }
  }, [showVersionHistory]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b654a7] border-t-transparent"></div>
          <p className="text-neutral-400">Verifying editor access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b654a7] border-t-transparent"></div>
          <p className="text-neutral-400">Loading newsletter editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen flex-col bg-black text-white overflow-hidden newsletter-editor ${isDarkMode ? "dark-theme" : "light-theme"}`}>

      {/* TOP HEADER TOOLBAR */}
      <header className="flex h-14 items-center justify-between border-b border-neutral-900 bg-neutral-950 px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (hasUnsavedChanges) { setShowUnsavedModal(true); } else { router.push("/dashboard"); } }}
            className="bg-transparent hover:bg-neutral-900/60 text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl font-semibold transition-all duration-150 cursor-pointer text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="h-4 w-[1px] bg-neutral-900 mx-1" />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newsletterTitle}
              onChange={(e) => setNewsletterTitle(e.target.value)}
              className="bg-transparent border border-transparent hover:border-neutral-900 focus:border-neutral-850 rounded-xl px-2 py-1 outline-none text-white text-sm font-semibold transition-all w-48"
              placeholder="Newsletter Title"
            />
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${newsletterStatus === "Sent"
                ? "bg-green-500/15 text-green-400"
                : newsletterStatus === "Approved"
                  ? "bg-purple-500/15 text-purple-400"
                  : "bg-yellow-500/15 text-yellow-400"
              }`}>
              {newsletterStatus}
            </span>

            {/* Auto-save indicator */}
            {saveState === "saving" && (
              <span className="flex items-center gap-1 text-[12px] text-neutral-100 font-medium">
                {/* <span className="h-2 w-2 animate-spin rounded-full border border-neutral-500 border-t-transparent" /> */}
                <FaSyncAlt className="animate-spin" />
              </span>
            )}
            {saveState === "saved" && (
              <span className="text-[12px] text-neutral-100 font-semibold"><SiTicktick /></span>
            )}
            {saveState === "error" && (
              <span className="text-[12px] text-neutral-100 font-semibold"><MdError /></span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-900/60 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={() => setShowVersionHistory(true)}
            className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-900/60 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0"
            title="Version History"
          >
            <History size={16} />
          </button>
          
          <button
            onClick={handleSaveVersion}
            disabled={savingVersion}
            className={`btn-save-version px-3 py-1.5 rounded-xl font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer text-xs ${savingVersion
                ? "bg-neutral-850 text-neutral-500 cursor-not-allowed"
                : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              }`}
            title="Save a snapshot of the current state"
          >
            {savingVersion ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"></span>
            ) : (
              <BookmarkPlus size={14} />
            )}
            Save Version
          </button>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className={`btn-save px-4 py-1.5 rounded-xl font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer text-xs ${saving
                ? "bg-neutral-850 text-neutral-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-neutral-200"
              }`}
          >
            {saving ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"></span>
            ) : (
              <Save size={14} />
            )}
            Save
          </button>

          {/* Send for Approval (visible to non-approvers while in Draft) */}
          {user?.accountType !== "Approver" && newsletterStatus === "Draft" && (
            <button
              onClick={() => setShowSendForApprovalModal(true)}
              disabled={saveState === "saving"}
              className="btn-approve bg-[#b654a7] hover:bg-[#a04692] text-white px-4 py-1.5 rounded-xl font-semibold transition-all duration-150 cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Check size={14} />
              Send for Approval
            </button>
          )}

          {user?.accountType === "Approver" && (newsletterStatus === "Draft" || newsletterStatus === "Seeking_Approval") && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="btn-approve bg-[#b654a7] hover:bg-[#a04692] text-white px-4 py-1.5 rounded-xl font-semibold transition-all duration-150 cursor-pointer text-xs flex items-center gap-1.5"
            >
              {approving ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <Check size={14} />
              )}
              Approve
            </button>
          )}

          {user?.accountType === "Sender" && newsletterStatus === "Approved" && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="btn-send bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl font-semibold transition-all duration-150 cursor-pointer text-xs flex items-center gap-1.5"
            >
              {sending ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <Check size={14} />
              )}
              Mark as Sent
            </button>
          )}
        </div>
      </header>

      {/* THREE PANES MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <LeftPane />
        <CenterPane />
        <RightPane />
      </div>

      {/* SEND FOR APPROVAL MODAL */}
      {showSendForApprovalModal && (
        <div
          onClick={() => setShowSendForApprovalModal(false)}
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-850 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold mb-2">Send for approval?</h3>
            <p className="text-sm text-neutral-400 mb-4">This will save current changes and set the newsletter status to "Seeking_Approval". Approvers will be notified.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSendForApprovalModal(false)} className="px-3 py-2 rounded-md bg-neutral-800 text-white">Cancel</button>
              <button onClick={async () => { setShowSendForApprovalModal(false); await handleSendForApproval(); }} className="px-3 py-2 rounded-md bg-[#b654a7] text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div
          onClick={() => setShowUnsavedModal(false)}
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-850 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold mb-2">Unsaved changes</h3>
            <p className="text-sm text-neutral-400 mb-4">You have unsaved changes. Save before leaving?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowUnsavedModal(false); router.push('/dashboard'); }} className="px-3 py-2 rounded-md bg-neutral-800 text-white">Discard</button>
              <button onClick={async () => { await handleSave(); setShowUnsavedModal(false); router.push('/dashboard'); }} className="px-3 py-2 rounded-md bg-white text-black">Save & Leave</button>
              <button onClick={() => setShowUnsavedModal(false)} className="px-3 py-2 rounded-md bg-neutral-700 text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA MANAGER MODAL */}
      {showMediaModal && (
        <div
          onClick={() => setShowMediaModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden cursor-default"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Media Library</h2>
                <p className="text-xs text-neutral-400 mt-1">Select an existing image or upload a new one to insert into this block.</p>
              </div>
              <button
                onClick={() => {
                  setShowMediaModal(false);
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl px-4 py-2 cursor-pointer transition-all"
              >
                Close Library
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <MediaManager onSelect={handleMediaSelect} />
            </div>
          </div>
        </div>
      )}

      {/* ADD BLOCK TEMPLATE SELECTOR OVERLAY */}
      {showAddBlockOverlay && (
        <div
          onClick={() => setShowAddBlockOverlay(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-850 rounded-[2.5rem] p-8 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">Add Newsletter Section Block</h2>
                <p className="text-xs text-neutral-400 mt-1">Select a structural section type below to append to your newsletter template.</p>
              </div>
              <button
                onClick={() => setShowAddBlockOverlay(false)}
                className="border border-neutral-800 bg-neutral-990 hover:bg-neutral-850 text-white font-semibold rounded-2xl px-5 py-2.5 cursor-pointer transition-all text-sm"
              >
                Close Picker
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
                {[
                  {
                    name: "Newsletter Header",
                    type: "header",
                    description: "Brand identity bar containing logo image and header taglines.",
                    skeleton: <HeaderSkeleton />
                  },
                  {
                    name: "Hero Title",
                    type: "hero",
                    description: "Large bold editorial headline with custom presents tagline.",
                    skeleton: <HeroSkeleton />
                  },
                  {
                    name: "Standard Article",
                    type: "section",
                    description: "Standard editorial block with heading, large banner image, and paragraphs.",
                    skeleton: <SectionSkeleton />
                  },
                  {
                    name: "Feature Comparison",
                    type: "featureComparison",
                    description: "Structured section containing heading, comparison table, and notes.",
                    skeleton: <FeatureComparisonSkeleton />
                  },
                  {
                    name: "Benchmark Table",
                    type: "benchmarkTable",
                    description: "Benchmarking panel featuring result grid and research sources.",
                    skeleton: <BenchmarkTableSkeleton />
                  },
                  {
                    name: "Member Spotlight",
                    type: "memberSpotlight",
                    description: "Community highlight featuring member quote, picture, and course list.",
                    skeleton: <MemberSpotlightSkeleton />
                  },
                  {
                    name: "Technical Session",
                    type: "technicalSession",
                    description: "Workshop showcase block containing image, highlights card, and overview.",
                    skeleton: <TechnicalSessionSkeleton />
                  },
                  {
                    name: "AIRIS Reads",
                    type: "airisReads",
                    description: "Article highlight block showing reading updates and author names.",
                    skeleton: <AirisReadsSkeleton />
                  },
                  {
                    name: "Conclusion Text",
                    type: "conclusion",
                    description: "Wrap-up block showing editorial notes and final ideas.",
                    skeleton: <ConclusionSkeleton />
                  },
                  {
                    name: "Footer info",
                    type: "footer",
                    description: "Closing footer details displaying branding logo and social icons.",
                    skeleton: <FooterSkeleton />
                  },
                  {
                    name: "Unsubscribe Area",
                    type: "unsubscribe",
                    description: "Unsubscribe block matching legal opt-out rules for newsletters.",
                    skeleton: <UnsubscribeSkeleton />
                  },
                  {
                    name: "Horizontal Divider",
                    type: "divider",
                    description: "Decorative border line to separate structural visual modules.",
                    skeleton: <DividerSkeleton />
                  }
                ].map(item => (
                  <div
                    key={item.type}
                    onClick={() => {
                      addBlock(item.type);
                      setShowAddBlockOverlay(false);
                    }}
                    className="group rounded-4xl border border-neutral-850 bg-neutral-950 p-5 hover:border-[#b654a7] hover:bg-neutral-900 transition-all duration-200 cursor-pointer flex flex-col justify-between h-72 shadow-lg"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#b654a7] uppercase tracking-widest block mb-1">Template</span>
                      <h4 className="text-base font-bold text-white group-hover:text-white transition-colors">{item.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                    </div>

                    {/* SKELETON AREA */}
                    <div className="my-4 flex items-center justify-center overflow-hidden">
                      {item.skeleton}
                    </div>

                    <button className="w-full text-center text-xs font-bold bg-neutral-900 text-neutral-300 border border-neutral-800 rounded-xl py-2 group-hover:bg-[#b654a7] group-hover:text-white group-hover:border-[#b654a7] transition-all cursor-pointer">
                      Insert Section
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* VERSION HISTORY MODAL */}
      {showVersionHistory && (
        <div
          onClick={() => setShowVersionHistory(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end p-0"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border-l border-neutral-850 h-full w-full max-w-sm flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-900">
              <h2 className="text-xl font-bold text-white">Version History</h2>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingVersions ? (
                <div className="flex justify-center py-10">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#b654a7] border-t-transparent"></span>
                </div>
              ) : versions.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-10">No saved versions found.</p>
              ) : (
                versions.map((v) => (
                  <div key={v.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors">
                    <h4 className="font-semibold text-white text-sm">{v.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(v.createdAt).toLocaleString()} by {v.createdBy?.username || "Unknown"}
                    </p>
                    <button 
                      onClick={() => restoreVersion(v.id)}
                      className="mt-3 text-xs bg-[#b654a7] hover:bg-[#9a458d] text-white px-3 py-1.5 rounded-lg font-medium transition-colors w-full"
                    >
                      Restore this version
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

interface NewsletterEditorProps {
  newsletterId: string;
}

export default function NewsletterEditor({ newsletterId }: NewsletterEditorProps) {
  return (
    <EditorProvider newsletterId={newsletterId}>
      <NewsletterEditorContent />
    </EditorProvider>
  );
}
