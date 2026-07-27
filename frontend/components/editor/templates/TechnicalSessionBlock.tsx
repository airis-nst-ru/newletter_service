import React from "react";
import { Block } from "../../../types/types";

export function TechnicalSessionPreview({ block }: { block: Block }) {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return (
    <table className="w-full" style={{ backgroundColor: block.backgroundColor || "#ffffff" }}>
      <tbody>
        <tr className="bg-[#b654a7] text-white">
          <td className="p-[10px_20px] font-sans text-[11px] font-bold tracking-widest uppercase">{block.sectionLabel}</td>
        </tr>
        <tr>
          <td className="p-[40px_20px] text-left text-neutral-800">
            <h1 className="m-0 font-sans text-[24px] font-normal leading-tight text-neutral-900">{block.title}</h1>
            {block.imageUrl && (
              <img src={block.imageUrl} alt={block.title || ""} className="max-w-full h-auto rounded-xl my-6 block mx-auto" />
            )}

            {parsedParagraphs.map((p, pIdx) => (
              <p key={pIdx} className="pt-4 font-sans text-sm text-neutral-700 leading-relaxed">{p}</p>
            ))}

            {block.gridCards && (
              <div className="grid grid-cols-2 gap-4 my-4">
                {block.gridCards.split("\n").map((line, cIdx) => {
                  const parts = line.split("|");
                  if (!parts[0]) return null;
                  return (
                    <div key={cIdx} className="border border-purple-100 bg-white rounded-lg p-3">
                      <p className="font-sans text-xs font-bold text-[#b654a7]">{parts[0].trim()}</p>
                      <p className="pt-1 font-sans text-[11px] text-neutral-600 leading-relaxed">{parts[1]?.trim()}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {block.endingParagraph && (
              <p className="pt-5 font-sans text-sm text-neutral-700 leading-relaxed">{block.endingParagraph}</p>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function TechnicalSessionHtml(block: Block): string {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];
  const parsedGridCards = block.gridCards ? block.gridCards.split('\n').map(line => {
    const parts = line.split('|');
    return { title: parts[0]?.trim(), text: parts[1]?.trim() };
  }).filter(c => c.title) : [];

  return `
            <!-- Section label bar -->
            <tr>
              <td style="padding:0;background-color:#b654a7">
                <p style="padding:10px 20px;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#ffffff;text-transform:uppercase;margin:0">${block.sectionLabel || ''}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 20px;background-color:${block.backgroundColor || '#ffffff'};text-align:left">
                <h1 style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:30px;font-weight:normal;line-height:36px;color:#333333">${block.title || ''}</h1>
                ${block.imageUrl ? `
                <img 
                  src="${block.imageUrl}"
                  alt="${block.title || ''}"
                  width="100%"
                  style="max-width:850px;height:auto;display:block;margin:25px auto;border-radius:12px;"
                >` : ''}
                
                ${parsedParagraphs.map(p => `
                <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${p}</p>
                `).join('')}
                
                ${parsedGridCards.length > 0 ? `
                <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-top:20px">
                  ${(() => {
        let result = '';
        for (let i = 0; i < parsedGridCards.length; i += 2) {
          const card1 = parsedGridCards[i];
          const card2 = parsedGridCards[i + 1];
          result += `
                      <tr>
                        <td valign="top" width="50%" style="padding:0 8px 12px 0">
                          <table cellpadding="12" cellspacing="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e8d5f0;border-radius:4px">
                            <tr>
                              <td>
                                <p style="padding:6px 0 0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:13px;font-weight:700;color:#b654a7">${card1.title}</p>
                                <p style="padding:4px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;line-height:18px;color:#555555">${card1.text}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ${card2 ? `
                        <td valign="top" width="50%" style="padding:0 0 12px 8px">
                          <table cellpadding="12" cellspacing="0" width="100%" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e8d5f0;border-radius:4px">
                            <tr>
                              <td>
                                <p style="padding:6px 0 0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:13px;font-weight:700;color:#b654a7">${card2.title}</p>
                                <p style="padding:4px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;line-height:18px;color:#555555">${card2.text}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : `<td width="50%">&nbsp;</td>`}
                      </tr>`;
        }
        return result;
      })()}
                </table>
                ` : ''}
                
                ${block.endingParagraph ? `
                <p style="padding:22px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${block.endingParagraph}</p>
                ` : ''}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function TechnicalSessionSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-200">
      <div className="h-4 w-3/4 bg-neutral-300 rounded"></div>
      <div className="h-10 bg-neutral-100 rounded-xl border border-neutral-200"></div>
      <div className="grid grid-cols-2 gap-2 text-[8px] text-neutral-400">
        <div className="h-6 bg-neutral-50 border border-purple-100/50 rounded-lg p-1">Highlighter</div>
        <div className="h-6 bg-neutral-50 border border-purple-100/50 rounded-lg p-1">Highlighter</div>
      </div>
    </div>
  );
}
