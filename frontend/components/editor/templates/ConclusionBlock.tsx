import React from "react";
import { Block } from "../../../types/types";
import { renderParagraphsPreview, formatRichHtmlForEmail } from "../../../utils/richText";

export function ConclusionPreview({ block }: { block: Block }) {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return (
    <table className="w-full bg-white">
      <tbody>
        <tr>
          <td className="p-[40px_20px] text-left text-neutral-800">
            <h1 className="m-0 font-sans text-[24px] font-normal leading-tight text-neutral-900">{block.title}</h1>
            {renderParagraphsPreview(block.paragraphs)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function ConclusionHtml(block: Block): string {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return `
            <!-- Conclusion -->
            <tr>
              <td style="padding:40px 20px;background-color:#ffffff;text-align:left">
                <h1 style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:30px;font-weight:normal;line-height:36px;color:#333333">${block.title || ''}</h1>
                ${formatRichHtmlForEmail(block.paragraphs)}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function ConclusionSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-2.5 w-full border border-neutral-200">
      <div className="h-4 w-2/5 bg-neutral-300 rounded"></div>
      <div className="h-2 bg-neutral-200 rounded w-full"></div>
      <div className="h-2 bg-neutral-200 rounded w-5/6"></div>
    </div>
  );
}
