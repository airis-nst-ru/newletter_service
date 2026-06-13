import React from "react";
import { Block } from "../../../types/types";

export function HtmlBlockPreview({ block }: { block: Block }) {
  const rawHtml = block.htmlContent || "";

  if (!rawHtml.trim()) {
    return (
      <table className="w-full bg-white border border-dashed border-neutral-300">
        <tbody>
          <tr>
            <td className="p-8 text-center text-neutral-400 font-sans text-xs">
              <p className="font-bold text-neutral-600 mb-1">Empty HTML Block</p>
              <p>Click here to configure and add HTML code in the right panel.</p>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const trimmed = rawHtml.trim();
  const isFullTr = trimmed.startsWith("<tr") || trimmed.startsWith("<!--");

  if (isFullTr) {
    return (
      <table className="w-full bg-white border-collapse" style={{ tableLayout: "fixed" }}>
        <tbody dangerouslySetInnerHTML={{ __html: rawHtml }} />
      </table>
    );
  }

  return (
    <table className="w-full bg-white border-collapse" style={{ tableLayout: "fixed" }}>
      <tbody>
        <tr>
          <td
            style={{
              padding: "20px",
              backgroundColor: "#ffffff",
              textAlign: "left",
              fontFamily: "arial, 'helvetica neue', helvetica, sans-serif",
            }}
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        </tr>
      </tbody>
    </table>
  );
}

export function HtmlBlockHtml(block: Block): string {
  const content = block.htmlContent || "";
  const trimmed = content.trim();
  if (!trimmed) return "";

  const isFullTr = trimmed.startsWith("<tr") || trimmed.startsWith("<!--");

  if (isFullTr) {
    return content;
  }

  return `
            <!-- Custom HTML Block -->
            <tr>
              <td style="padding: 20px; background-color: #ffffff; text-align: left; font-family: arial, 'helvetica neue', helvetica, sans-serif;">
                ${content}
              </td>
            </tr>
  `;
}

export function HtmlBlockSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-200">
      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
        <div className="h-3 w-1/3 bg-neutral-300 rounded"></div>
        <div className="h-3 w-8 bg-neutral-200 rounded"></div>
      </div>
      <div className="space-y-2 font-mono text-[9px] text-neutral-400">
        <div className="h-2 bg-neutral-200 rounded w-full"></div>
        <div className="h-2 bg-neutral-200 rounded w-5/6 pl-4"></div>
        <div className="h-2 bg-neutral-200 rounded w-4/5 pl-4"></div>
        <div className="h-2 bg-neutral-200 rounded w-11/12"></div>
      </div>
    </div>
  );
}
