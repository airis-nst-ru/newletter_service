import React from "react";
import { Block } from "../../../types/types";
import { formatRichHtmlForEmail, isRichHtml, splitRichHtmlParagraphs } from "../../../utils/richText";

export function MemberSpotlightPreview({ block }: { block: Block }) {
  const parsedParagraphs = splitRichHtmlParagraphs(block.paragraphs);

  return (
    <table className="w-full bg-white">
      <tbody>
        <tr className="bg-[#b654a7] text-white">
          <td className="p-[10px_20px] font-sans text-[11px] font-bold tracking-widest uppercase">{block.sectionLabel}</td>
        </tr>
        <tr>
          <td className="p-[40px_20px_30px] text-left text-neutral-800">
            <table className="w-full mb-6 border-collapse">
              <tbody>
                <tr>
                  <td width="4" className="bg-[#b654a7] rounded-sm">&nbsp;</td>
                  <td className="pl-4">
                    {isRichHtml(block.quoteText) ? (
                      <div className="m-0 font-sans text-[16px] italic leading-relaxed text-neutral-900 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: block.quoteText || "" }} />
                    ) : (
                      <p className="m-0 font-sans text-[16px] italic leading-relaxed text-neutral-900">"{block.quoteText}"</p>
                    )}
                    <p className="pt-1.5 font-sans text-xs font-bold text-[#b654a7]">— {block.quoteAuthor}</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h1 className="m-0 font-sans text-[24px] font-normal leading-tight text-neutral-900">{block.title}</h1>
            {block.imageUrl && (
              <img src={block.imageUrl} alt={block.title || ""} className="max-w-full h-auto rounded-xl my-6 block mx-auto" />
            )}

            {isRichHtml(block.paragraphs) ? (
              <div className="pt-4 font-sans text-sm text-neutral-700 leading-relaxed rich-text-p" dangerouslySetInnerHTML={{ __html: parsedParagraphs[0] || "" }} />
            ) : (
              <p className="pt-4 font-sans text-sm text-neutral-700 leading-relaxed">{parsedParagraphs[0]}</p>
            )}
            {block.readMoreUrl && (
              <p className="pt-4 font-sans text-sm leading-relaxed">
                <a href={block.readMoreUrl} className="text-[#b654a7] font-bold text-sm tracking-wide">Read More &rarr;</a>
              </p>
            )}

            {block.gridCardsTitle && (
              <p className="pt-6 pb-2 font-sans text-sm font-bold text-neutral-900">{block.gridCardsTitle}</p>
            )}

            {block.gridCards && (
              <div className="grid grid-cols-2 gap-4 my-2">
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

            {parsedParagraphs.slice(1).map((p, pIdx) => (
              isRichHtml(block.paragraphs) ? (
                <div key={pIdx} className="pt-5 font-sans text-sm text-neutral-700 leading-relaxed rich-text-p" dangerouslySetInnerHTML={{ __html: p }} />
              ) : (
                <p key={pIdx} className="pt-5 font-sans text-sm text-neutral-700 leading-relaxed">{p}</p>
              )
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function MemberSpotlightHtml(block: Block): string {
  const parsedParagraphs = splitRichHtmlParagraphs(block.paragraphs);
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
              <td style="padding:40px 20px 30px;background-color:#ffffff;text-align:left">
                <!-- Pull quote -->
                <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-bottom:24px">
                  <tr>
                    <td width="4" style="background-color:#b654a7;border-radius:2px">&nbsp;</td>
                    <td style="padding:0 0 0 16px">
                      ${isRichHtml(block.quoteText)
                        ? formatRichHtmlForEmail(block.quoteText)
                        : `<p style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:18px;font-style:italic;line-height:26px;color:#333333">"${block.quoteText || ''}"</p>`}
                      <p style="padding:6px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;color:#b654a7;font-weight:700">— ${block.quoteAuthor || ''}</p>
                    </td>
                  </tr>
                </table>
                
                <h1 style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:30px;font-weight:normal;line-height:36px;color:#333333">${block.title || ''}</h1>
                
                ${block.imageUrl ? `
                <img 
                  src="${block.imageUrl}"
                  alt="${block.title || ''}"
                  width="100%"
                  style="max-width:850px;height:auto;display:block;margin:25px auto;border-radius:12px;"
                >` : ''}
                
                ${isRichHtml(block.paragraphs)
                  ? formatRichHtmlForEmail(parsedParagraphs[0])
                  : `<p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${parsedParagraphs[0] || ''}</p>`}
                 ${block.readMoreUrl?.trim() ? `
                 <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;line-height:21px;color:#333333"><a href="${block.readMoreUrl.trim()}" target="_blank" style="color:#b654a7;font-weight:700;text-decoration:none">Read More &rarr;</a></p>
                 ` : ''}
                
                ${block.gridCardsTitle ? `<p style="padding:24px 0 8px;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:16px;font-weight:700;line-height:22px;color:#333333">${block.gridCardsTitle}</p>` : ''}
                
                ${parsedGridCards.length > 0 ? `
                <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
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
                
                ${isRichHtml(block.paragraphs)
                  ? parsedParagraphs.slice(1).map(p => formatRichHtmlForEmail(p)).join('')
                  : parsedParagraphs.slice(1).map(p => `
                  <p style="padding:20px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#333333">${p}</p>
                  `).join('')}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function MemberSpotlightSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-3.5 w-full border border-neutral-200">
      <div className="flex gap-2">
        <div className="w-1 bg-[#b654a7] rounded"></div>
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-neutral-300 rounded w-full"></div>
          <div className="h-2 bg-neutral-300 rounded w-2/3"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[8px] text-neutral-400">
        <div className="h-8 bg-neutral-50 border border-purple-100/50 rounded-lg p-1.5">Grid Card</div>
        <div className="h-8 bg-neutral-50 border border-purple-100/50 rounded-lg p-1.5">Grid Card</div>
      </div>
    </div>
  );
}
