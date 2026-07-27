import React from "react";
import { Block } from "../../../types/types";

export function AirisReadsPreview({ block }: { block: Block }) {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return (
    <table className="w-full" style={{ backgroundColor: block.backgroundColor || "#ffffff" }}>
      <tbody>
        <tr className="bg-[#333333] text-white">
          <td className="p-[10px_20px] font-sans text-[11px] font-bold tracking-widest uppercase">{block.sectionLabel}</td>
        </tr>
        <tr>
          <td className="p-[40px_20px] text-left text-neutral-800">
            {block.author && (
              <p className="m-0 font-sans text-xs font-bold text-[#b654a7] tracking-wider uppercase">{block.author}</p>
            )}
            <h1 className="m-0 mt-2.5 font-sans text-[22px] font-bold leading-tight text-neutral-900">{block.title}</h1>
            {parsedParagraphs.map((p, pIdx) => (
              <p key={pIdx} className="pt-4 font-sans text-sm text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: p }}></p>
            ))}
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

export function AirisReadsHtml(block: Block): string {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return `
            <!-- AIRIS Reads -->
            <tr>
              <td style="padding:0;background-color:#333333">
                <p style="padding:10px 20px;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#ffffff;text-transform:uppercase;margin:0">${block.sectionLabel || ''}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 20px;background-color:${block.backgroundColor || '#ffffff'};text-align:left">
                ${block.author ? `<p style="margin:0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#b654a7">${block.author}</p>` : ''}
                <h1 style="margin:12px 0 0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:26px;font-weight:700;line-height:32px;color:#333333">${block.title || ''}</h1>
                ${parsedParagraphs.map(p => `
                <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${p}</p>
                `).join('')}
                 ${block.readMoreUrl?.trim() ? `
                 <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;line-height:21px;color:#333333"><a href="${block.readMoreUrl.trim()}" target="_blank" style="color:#b654a7;font-weight:700;text-decoration:none">Read More &rarr;</a></p>
                 ` : ''}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function AirisReadsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-200">
      <div className="h-2 w-1/4 bg-[#b654a7]/60 rounded"></div>
      <div className="h-4 w-5/6 bg-neutral-300 rounded"></div>
      <div className="h-2 bg-neutral-200 rounded w-full"></div>
    </div>
  );
}
