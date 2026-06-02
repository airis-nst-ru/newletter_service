import React from "react";
import { Block } from "../../../types/types";

export function FeatureComparisonPreview({ block }: { block: Block }) {
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
            {parsedParagraphs.map((p, pIdx) => (
              <p key={pIdx} className="pt-4 font-sans text-sm text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: p }}></p>
            ))}

            {block.tableHeaders && (
              <table cellPadding="8" cellSpacing="0" className="w-full mt-4 font-sans text-xs border-collapse">
                <tbody>
                  <tr className="bg-[#333333] text-white font-bold">
                    {block.tableHeaders.split(",").map((h, hIdx) => (
                      <td key={hIdx} className="p-2">{h.trim()}</td>
                    ))}
                  </tr>
                  {(block.tableRows || "").split("\n").map((row, rIdx, list) => {
                    const cells = row.split("|");
                    const bg = rIdx % 2 === 0 ? "bg-neutral-50" : "bg-white";
                    const isLast = rIdx === list.length - 1;
                    return (
                      <tr key={rIdx} className={`${bg} text-neutral-800`}>
                        {cells.map((c, cIdx) => (
                          <td key={cIdx} className={`p-2 ${!isLast ? "border-b border-neutral-100" : ""}`}>{c.trim()}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {block.closingParagraph && (
              <p className="pt-4 font-sans text-sm text-neutral-700 leading-relaxed font-medium italic">{block.closingParagraph}</p>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function FeatureComparisonHtml(block: Block): string {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];
  const parsedHeaders = block.tableHeaders ? block.tableHeaders.split(',').map(h => h.trim()) : [];
  const parsedRows = block.tableRows ? block.tableRows.split('\n').map(row => row.split('|').map(cell => cell.trim())).filter(row => row.length > 0 && row[0] !== '') : [];

  return `
            <!-- Feature Comparison -->
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
                ${parsedParagraphs.map(p => `
                <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${p}</p>
                `).join('')}
                ${parsedHeaders.length > 0 ? `
                <table cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;margin-top:16px;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:13px;line-height:20px">
                  <tr style="background-color:#333333;color:#ffffff">
                    ${parsedHeaders.map(h => `<td style="padding:8px 12px;font-weight:bold">${h}</td>`).join('')}
                  </tr>
                  ${parsedRows.map((row, idx) => {
    const bg = idx % 2 === 0 ? 'background-color:#f9f9f9;' : '';
    return `
                    <tr style="${bg}color:#333333">
                      ${row.map(cell => {
      const border = idx !== parsedRows.length - 1 ? 'border-bottom:1px solid #e0e0e0' : '';
      return `<td style="padding:8px 12px;${border}">${cell}</td>`;
    }).join('')}
                    </tr>`;
  }).join('')}
                </table>
                ` : ''}
                ${block.closingParagraph ? `
                <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${block.closingParagraph}</p>
                ` : ''}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function FeatureComparisonSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-200">
      <div className="h-4 w-3/4 bg-neutral-300 rounded"></div>
      <div className="space-y-2">
        <div className="h-2 bg-neutral-200 rounded w-full"></div>
        <div className="h-12 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col overflow-hidden divide-y divide-neutral-200 text-[8px] text-neutral-400">
          <div className="h-6 bg-neutral-100 flex items-center px-2 font-bold">Table Header</div>
          <div className="h-6 flex items-center px-2">Table Rows...</div>
        </div>
      </div>
    </div>
  );
}
