"use client";

import React from "react";
import { useEditor } from "../../app/context/EditorContext";
import { Monitor, Tablet, Smartphone, Eye, Code } from "lucide-react";
import { HeaderPreview } from "./templates/HeaderBlock";
import { HeroPreview } from "./templates/HeroBlock";
import { SectionPreview } from "./templates/SectionBlock";
import { FeatureComparisonPreview } from "./templates/FeatureComparisonBlock";
import { BenchmarkTablePreview } from "./templates/BenchmarkTableBlock";
import { MemberSpotlightPreview } from "./templates/MemberSpotlightBlock";
import { TechnicalSessionPreview } from "./templates/TechnicalSessionBlock";
import { AirisReadsPreview } from "./templates/AirisReadsBlock";
import { ConclusionPreview } from "./templates/ConclusionBlock";
import { FooterPreview } from "./templates/FooterBlock";
import { UnsubscribePreview } from "./templates/UnsubscribeBlock";
import { DividerPreview } from "./templates/DividerBlock";

export default function CenterPane() {
  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    viewMode,
    setViewMode,
    previewDevice,
    setPreviewDevice,
    compiledHtml
  } = useEditor();

  return (
    <main className="flex-1 bg-black overflow-y-auto p-6 flex flex-col items-center min-h-0">
      <div className={`w-full flex items-center justify-between mb-6 select-none shrink-0 ${viewMode === "visual" ? "max-w-[750px]" : "max-w-4xl"}`}>
        {/* Device Viewport Buttons */}
        <div>
          {viewMode === "visual" ? (
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-850 p-1 rounded-2xl shadow-md">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all duration-150 ${previewDevice === "desktop" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                title="Desktop View"
              >
                <Monitor size={14} />
                Desktop
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all duration-150 ${previewDevice === "tablet" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                title="Tablet View"
              >
                <Tablet size={14} />
                Tablet
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all duration-150 ${previewDevice === "mobile" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                title="Mobile View"
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-850 p-1 rounded-2xl shadow-md">
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all duration-150 ${viewMode === "visual" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
          >
            <Eye size={14} />
            Editor Preview
          </button>
          <button
            onClick={() => setViewMode("html")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all duration-150 ${viewMode === "html" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
          >
            <Code size={14} />
            View HTML
          </button>
        </div>
      </div>

      {viewMode === "visual" ? (
        <div
          className={`w-full bg-neutral-950 border border-neutral-900 shadow-2xl flex flex-col simulated-device-shell transition-all duration-300 ${previewDevice === "mobile"
              ? "max-w-[375px] rounded-[3.2rem] border-8 border-neutral-800 relative pt-12 pb-8 px-3 shadow-3xl min-h-[80vh]"
              : previewDevice === "tablet"
                ? "max-w-[576px] rounded-[2.5rem] border-4 border-neutral-850 relative pt-10 pb-6 px-4 min-h-[82vh]"
                : "max-w-[750px] rounded-[2rem] border border-neutral-900 relative pt-12 pb-6 px-6 min-h-[85vh]"
            }`}
        >
          {/* Premium Device Shell Layouts */}
          {previewDevice === "mobile" && (
            <>
              {/* Notch/Dynamic Island Cutout */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full absolute right-3" />
              </div>
              {/* Status Bar Indicators */}
              <div className="absolute top-3 left-6 right-6 flex justify-between items-center text-[10px] font-bold text-neutral-500 select-none z-10">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-neutral-600 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-neutral-500 rounded-2xs" />
                  </div>
                </div>
              </div>
            </>
          )}

          {previewDevice === "tablet" && (
            <div className="absolute top-2.5 left-8 right-8 flex justify-between items-center text-[10px] font-bold text-neutral-500 select-none z-10">
              <span>AIRIS Tablet</span>
              <div className="flex items-center gap-2">
                <span>9:41 AM</span>
                <span>85%</span>
              </div>
            </div>
          )}

          {previewDevice === "desktop" && (
            <div className="absolute top-3 left-6 right-6 flex items-center gap-3 border-b border-neutral-900/60 pb-3 z-10">
              {/* Browser Window Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              {/* Simulated URL bar */}
              <div className="flex-1 max-w-xs bg-black/40 border border-neutral-850 rounded-lg py-1 px-3 text-[10px] text-neutral-500 font-mono flex items-center gap-1.5 select-none truncate">
                <span className="text-neutral-700">https://</span>newsletter.airis.ai/chronicle
              </div>
            </div>
          )}

          <div className="text-center text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 border-b border-neutral-900/60 pb-3 select-none mt-2">
            {previewDevice === "desktop" && "Desktop Preview (600px fixed width)"}
            {previewDevice === "tablet" && "Tablet Preview (Responsive layout)"}
            {previewDevice === "mobile" && "Mobile Preview (Responsive layout)"}
          </div>

          <div className="bg-[#ffffff] text-black font-sans leading-normal overflow-hidden rounded-xl">
            <table cellPadding="0" cellSpacing="0" role="none" className="w-full border-collapse bg-[#F0F4F2]">
              <tbody>
                <tr>
                  <td align="center" className="p-0">
                    <table align="center" cellPadding="0" cellSpacing="0" width="100%" className="max-w-[600px] w-full bg-white text-left">
                      <tbody>
                        {/* Top spacing */}
                        <tr><td height="1" className="border-b border-neutral-200">&nbsp;</td></tr>

                        {blocks.map((block) => {
                          const isSelected = block.id === selectedBlockId;

                          return (
                            <tr
                              key={block.id}
                              onClick={() => setSelectedBlockId(block.id)}
                              className={`group/block cursor-pointer relative ${isSelected ? "outline-4 outline-[#b654a7] -outline-offset-4" : "hover:outline-2 hover:outline-dashed hover:outline-[#b654a7]/40"
                                }`}
                            >
                              <td className="p-0 relative">

                                {/* Overlay badge */}
                                <div className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest hidden group-hover/block:block z-10">
                                  {block.type} Block
                                </div>

                                {/* BLOCK RENDER IN PREVIEW */}
                                {block.type === "header" && <HeaderPreview block={block} />}
                                {block.type === "hero" && <HeroPreview block={block} />}
                                {block.type === "section" && <SectionPreview block={block} />}
                                {block.type === "featureComparison" && <FeatureComparisonPreview block={block} />}
                                {block.type === "benchmarkTable" && <BenchmarkTablePreview block={block} />}
                                {block.type === "memberSpotlight" && <MemberSpotlightPreview block={block} />}
                                {block.type === "technicalSession" && <TechnicalSessionPreview block={block} />}
                                {block.type === "airisReads" && <AirisReadsPreview block={block} />}
                                {block.type === "conclusion" && <ConclusionPreview block={block} />}
                                {block.type === "footer" && <FooterPreview block={block} />}
                                {block.type === "unsubscribe" && <UnsubscribePreview block={block} />}
                                {block.type === "divider" && <DividerPreview block={block} />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* HTML Source Code Mode Container */
        <div className="w-full max-w-4xl bg-neutral-950 border border-neutral-900 rounded-[2.5rem] p-6 h-[80vh] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Compiled HTML (Read Only)</h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(compiledHtml);
                alert("HTML source code copied to clipboard!");
              }}
              className="text-xs text-neutral-400 hover:text-white font-semibold bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200"
            >
              Copy Source
            </button>
          </div>
          <textarea
            value={compiledHtml}
            readOnly
            className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl p-4 font-mono text-xs leading-relaxed text-neutral-300 focus:outline-none resize-none"
          />
        </div>
      )}
    </main>
  );
}
