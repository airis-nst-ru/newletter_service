"use client";

import React from "react";
import { useEditor } from "../../app/context/EditorContext";
import { Settings, Trash2, Image as ImageIcon } from "lucide-react";
import CommentThread from "@/components/comments/CommentThread";

interface AutoResizingTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
}

function AutoResizingTextarea({
  value,
  onChange,
  className = "",
  placeholder = ""
}: AutoResizingTextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={`${className} resize-none overflow-hidden`}
      placeholder={placeholder}
      rows={1}
    />
  );
}

export default function RightPane() {
  const {
    selectedBlock,
    deleteBlock,
    updateSelectedBlockField,
    openMediaLibraryForField,
    setShowMediaModal,
    newsletterId,
    commentsByBlock
  } = useEditor();

  const [activeTab, setActiveTab] = React.useState<"settings" | "comments">("settings");
  const [showReadMore, setShowReadMore] = React.useState(false);

  React.useEffect(() => {
    setActiveTab("settings");
    setShowReadMore(!!selectedBlock?.readMoreUrl?.trim());
  }, [selectedBlock?.id]);

  const supportsLogo = selectedBlock ? ["header", "footer"].includes(selectedBlock.type) : false;
  const supportsImage = selectedBlock ? ["section", "featureComparison", "memberSpotlight", "technicalSession"].includes(selectedBlock.type) : false;

  const blockComments = selectedBlock ? commentsByBlock[selectedBlock.id] || [] : [];
  const unresolvedCommentsCount = blockComments.filter(c => !c.resolved).length;

  return (
    <aside className="w-96 flex flex-col border-l border-neutral-900 bg-neutral-950 overflow-y-auto p-5 shrink-0">
      {selectedBlock ? (
        <div className="space-y-6">

          {/* Block Header Info */}
          <div className="flex flex-col gap-3 border-b border-neutral-900 pb-4">
            <button
              onClick={() => {
                if (selectedBlock.imageUrl !== undefined || supportsImage) {
                  openMediaLibraryForField(selectedBlock.id, "imageUrl");
                } else if (selectedBlock.logoUrl !== undefined || supportsLogo) {
                  openMediaLibraryForField(selectedBlock.id, "logoUrl");
                } else {
                  setShowMediaModal(true);
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-300 hover:text-white font-semibold bg-neutral-900 border border-neutral-850 hover:border-neutral-750 rounded-2xl py-2.5 cursor-pointer transition-all duration-200"
            >
              <ImageIcon size={12} />
              Open Media Library
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white capitalize">{selectedBlock.type} Block</h2>
                <p className="text-xs text-neutral-500 font-mono tracking-wider mt-1">ID: {selectedBlock.id}</p>
              </div>
              <button
                onClick={() => deleteBlock(selectedBlock.id)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold bg-red-950/20 border border-red-900/30 rounded-2xl px-3 py-2 cursor-pointer transition-all duration-200 shrink-0"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border border-neutral-900 p-0.5 bg-neutral-990 rounded-2xl mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "settings" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Configure
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative ${
                activeTab === "comments" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Comments
              {unresolvedCommentsCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-neutral-950">
                  {unresolvedCommentsCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === "settings" ? (
            /* Block Editable Settings Fields */
            <div className="space-y-4">

            {/* LOGO URL */}
            {(selectedBlock.logoUrl !== undefined || supportsLogo) && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Logo Image URL</label>
                <div className="flex gap-2 items-center">
                  <AutoResizingTextarea
                    value={selectedBlock.logoUrl || ""}
                    onChange={(e) => updateSelectedBlockField("logoUrl", e.target.value)}
                    className="flex-1 bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaLibraryForField(selectedBlock.id, "logoUrl")}
                    className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-2xl transition-all cursor-pointer shrink-0"
                    title="Choose from Media Library"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* PRESENTS TEXT */}
            {selectedBlock.presentsText !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Sub-header presents Text</label>
                <AutoResizingTextarea
                  value={selectedBlock.presentsText || ""}
                  onChange={(e) => updateSelectedBlockField("presentsText", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* SECTION LABEL */}
            {selectedBlock.sectionLabel !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Section Label (e.g. SPATIAL INTELLIGENCE)</label>
                <AutoResizingTextarea
                  value={selectedBlock.sectionLabel || ""}
                  onChange={(e) => updateSelectedBlockField("sectionLabel", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* TITLE */}
            {selectedBlock.title !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Headline Title</label>
                <AutoResizingTextarea
                  value={selectedBlock.title || ""}
                  onChange={(e) => updateSelectedBlockField("title", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* SUBTITLE */}
            {selectedBlock.subtitle !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Subtitle Tagline</label>
                <AutoResizingTextarea
                  value={selectedBlock.subtitle || ""}
                  onChange={(e) => updateSelectedBlockField("subtitle", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* IMAGE URL */}
            {(selectedBlock.imageUrl !== undefined || supportsImage) && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Banner/Section Image URL</label>
                <div className="flex gap-2 items-center">
                  <AutoResizingTextarea
                    value={selectedBlock.imageUrl || ""}
                    onChange={(e) => updateSelectedBlockField("imageUrl", e.target.value)}
                    className="flex-1 bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => openMediaLibraryForField(selectedBlock.id, "imageUrl")}
                    className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-2xl transition-all cursor-pointer shrink-0"
                    title="Choose from Media Library"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* IMAGE ALT */}
            {(selectedBlock.imageAlt !== undefined || supportsImage) && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Image Alt Description</label>
                <AutoResizingTextarea
                  value={selectedBlock.imageAlt || ""}
                  onChange={(e) => updateSelectedBlockField("imageAlt", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* QUOTE TEXT */}
            {selectedBlock.quoteText !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Quote Text</label>
                <AutoResizingTextarea
                  value={selectedBlock.quoteText || ""}
                  onChange={(e) => updateSelectedBlockField("quoteText", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                />
              </div>
            )}

            {/* QUOTE AUTHOR */}
            {selectedBlock.quoteAuthor !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Quote Author & Info</label>
                <AutoResizingTextarea
                  value={selectedBlock.quoteAuthor || ""}
                  onChange={(e) => updateSelectedBlockField("quoteAuthor", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* PARAGRAPHS */}
            {selectedBlock.paragraphs !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Paragraphs (Double Newline Separated)</label>
                <AutoResizingTextarea
                  value={selectedBlock.paragraphs || ""}
                  onChange={(e) => updateSelectedBlockField("paragraphs", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* READ MORE TOGGLE + URL */}
            {selectedBlock.readMoreUrl !== undefined && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Read More Link</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Appends a styled link after the text</p>
                  </div>
                  <label className="relative cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showReadMore}
                      onChange={(e) => {
                        setShowReadMore(e.target.checked);
                        if (!e.target.checked) updateSelectedBlockField("readMoreUrl", "");
                      }}
                    />
                    <div className="w-10 h-6 bg-neutral-700 peer-checked:bg-[#b654a7] rounded-full transition-colors duration-200" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
                  </label>
                </div>
                {showReadMore && (
                  <div>
                    <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Read More Target URL</label>
                    <AutoResizingTextarea
                      value={selectedBlock.readMoreUrl}
                      onChange={(e) => updateSelectedBlockField("readMoreUrl", e.target.value)}
                      className="w-full bg-black border border-neutral-800 focus:border-[#b654a7] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200 font-mono"
                      placeholder="https://example.com/full-article"
                    />
                  </div>
                )}
              </div>
            )}

            {/* BUTTON TEXT */}
            {selectedBlock.buttonText !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Button Label Text</label>
                <AutoResizingTextarea
                  value={selectedBlock.buttonText || ""}
                  onChange={(e) => updateSelectedBlockField("buttonText", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* BUTTON URL */}
            {selectedBlock.buttonUrl !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Button Target Link URL</label>
                <AutoResizingTextarea
                  value={selectedBlock.buttonUrl || ""}
                  onChange={(e) => updateSelectedBlockField("buttonUrl", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* TABLE HEADERS */}
            {selectedBlock.tableHeaders !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Table Columns (Comma Separated)</label>
                <AutoResizingTextarea
                  value={selectedBlock.tableHeaders || ""}
                  onChange={(e) => updateSelectedBlockField("tableHeaders", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                  placeholder="Feature,Pattern Recognition,World Modeling"
                />
              </div>
            )}

            {/* TABLE ROWS */}
            {selectedBlock.tableRows !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Table Rows (Format: Cell|Cell|Cell)</label>
                <AutoResizingTextarea
                  value={selectedBlock.tableRows || ""}
                  onChange={(e) => updateSelectedBlockField("tableRows", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                  placeholder="Core Logic|Correlation|Structure"
                />
              </div>
            )}

            {/* CLOSING PARAGRAPH */}
            {selectedBlock.closingParagraph !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Closing/Footer Paragraph</label>
                <AutoResizingTextarea
                  value={selectedBlock.closingParagraph || ""}
                  onChange={(e) => updateSelectedBlockField("closingParagraph", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* GRID CARDS SECTION TITLE */}
            {selectedBlock.gridCardsTitle !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Grid Section Title</label>
                <AutoResizingTextarea
                  value={selectedBlock.gridCardsTitle || ""}
                  onChange={(e) => updateSelectedBlockField("gridCardsTitle", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* GRID CARDS LIST */}
            {selectedBlock.gridCards !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Grid Cards (Format: Card Title|Card Content)</label>
                <AutoResizingTextarea
                  value={selectedBlock.gridCards || ""}
                  onChange={(e) => updateSelectedBlockField("gridCards", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                  placeholder="Card Title|Description paragraph details"
                />
              </div>
            )}

            {/* SOURCES SECTION TITLE */}
            {selectedBlock.sourcesTitle !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Sources Section Title</label>
                <AutoResizingTextarea
                  value={selectedBlock.sourcesTitle || ""}
                  onChange={(e) => updateSelectedBlockField("sourcesTitle", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* SOURCES LIST */}
            {selectedBlock.sources !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Sources & Links (Format: Title|URL)</label>
                <AutoResizingTextarea
                  value={selectedBlock.sources || ""}
                  onChange={(e) => updateSelectedBlockField("sources", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                  placeholder="Silicon Republic (Date)|https://url.com"
                />
              </div>
            )}

            {/* ENDING PARAGRAPH */}
            {selectedBlock.endingParagraph !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Ending Paragraph</label>
                <AutoResizingTextarea
                  value={selectedBlock.endingParagraph || ""}
                  onChange={(e) => updateSelectedBlockField("endingParagraph", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* FOOTER INSTAGRAM URL */}
            {selectedBlock.instagramUrl !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Instagram Link URL</label>
                <AutoResizingTextarea
                  value={selectedBlock.instagramUrl || ""}
                  onChange={(e) => updateSelectedBlockField("instagramUrl", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                />
              </div>
            )}

            {/* FOOTER LINKEDIN URL */}
            {selectedBlock.linkedinUrl !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">LinkedIn Link URL</label>
                <AutoResizingTextarea
                  value={selectedBlock.linkedinUrl || ""}
                  onChange={(e) => updateSelectedBlockField("linkedinUrl", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                />
              </div>
            )}

            {/* UNSUBSCRIBE TEXT */}
            {selectedBlock.text !== undefined && selectedBlock.type === "unsubscribe" && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Unsubscribe Text</label>
                <AutoResizingTextarea
                  value={selectedBlock.text || ""}
                  onChange={(e) => updateSelectedBlockField("text", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200"
                />
              </div>
            )}

            {/* UNSUBSCRIBE URL */}
            {selectedBlock.unsubscribeUrl !== undefined && (
              <div>
                <label className="block mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Unsubscribe link URL</label>
                <AutoResizingTextarea
                  value={selectedBlock.unsubscribeUrl || ""}
                  onChange={(e) => updateSelectedBlockField("unsubscribeUrl", e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-neutral-600 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-200 font-mono text-xs"
                />
              </div>
            )}

          </div>
          ) : (
            <div className="pt-2">
              <CommentThread newsletterId={newsletterId} blockId={selectedBlock.id} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500 p-6">
          <Settings className="mb-3 opacity-20 animate-[spin_8s_linear_infinite]" size={40} />
          <p className="text-sm font-semibold text-neutral-400">Select a block from preview or structure list to configure its fields.</p>
        </div>
      )}
    </aside>
  );
}
