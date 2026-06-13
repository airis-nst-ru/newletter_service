import React from "react";
import { Block } from "../../../types/types";
import { renderParagraphsPreview, formatRichHtmlForEmail } from "../../../utils/richText";

export function SectionPreview({ block }: { block: Block }) {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return (
    <table className="w-full bg-white">
      <tbody>
        <tr>
          <td className="p-[40px_20px] text-left text-neutral-800">
            <h1 className="m-0 font-sans text-[24px] font-normal leading-tight text-neutral-900">{block.title}</h1>
            {block.imageUrl && (
              <img src={block.imageUrl} alt={block.imageAlt || block.title || ""} className="max-w-full h-auto rounded-xl my-6 block mx-auto" />
            )}
            {renderParagraphsPreview(block.paragraphs)}
            {block.readMoreUrl && (
              <p className="pt-4 font-sans text-sm leading-relaxed">
                <a href={block.readMoreUrl} className="text-[#b654a7] font-bold text-sm tracking-wide">Read More &rarr;</a>
              </p>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function SectionHtml(block: Block): string {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return `
            <!-- Section -->
            <tr>
              <td style="padding:40px 20px;background-color:#ffffff;text-align:left">
                <h1 style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:30px;font-weight:normal;line-height:36px;color:#333333">${block.title || ''}</h1>
                ${block.imageUrl ? `
                <img 
                  src="${block.imageUrl}"
                  alt="${block.imageAlt || block.title || ''}"
                  width="100%"
                  style="max-width:850px;height:auto;display:block;margin:25px auto;border-radius:12px;"
                >` : ''}
                ${formatRichHtmlForEmail(block.paragraphs)}
                ${block.readMoreUrl?.trim() ? `
                <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;line-height:21px;color:#333333"><a href="${block.readMoreUrl.trim()}" target="_blank" style="color:#b654a7;font-weight:700;text-decoration:none">Read More &rarr;</a></p>
                ` : ''}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function SectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-200">
      <div className="h-4 w-3/4 bg-neutral-300 rounded"></div>
      <div className="h-16 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Image Banner</div>
      <div className="space-y-1.5">
        <div className="h-2 bg-neutral-200 rounded w-full"></div>
        <div className="h-2 bg-neutral-200 rounded w-4/5"></div>
      </div>
    </div>
  );
}
