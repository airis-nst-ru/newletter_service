import React from "react";
import { Block } from "../../../types/types";

export function BenchmarkTablePreview({ block }: { block: Block }) {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  return (
    <table className="w-full text-white" style={{ backgroundColor: block.backgroundColor || "#666666" }}>
      <tbody>
        <tr>
          <td className="p-[40px_20px] text-left">
            <h1 className="m-0 font-sans text-[24px] font-normal leading-tight text-white">{block.title}</h1>
            {parsedParagraphs.map((p, pIdx) => (
              <p key={pIdx} className="pt-4 font-sans text-sm text-neutral-200 leading-relaxed">{p}</p>
            ))}

            {block.tableHeaders && (
              <table cellPadding="8" cellSpacing="0" className="w-full mt-5 font-sans text-xs border-collapse">
                <tbody>
                  <tr className="bg-[#b654a7] text-white font-bold">
                    {block.tableHeaders.split(",").map((h, hIdx) => (
                      <td key={hIdx} className="p-2">{h.trim()}</td>
                    ))}
                  </tr>
                  {(block.tableRows || "").split("\n").map((row, rIdx, list) => {
                    const cells = row.split("|");
                    const bg = rIdx % 2 === 0 ? "bg-white/10" : "bg-transparent";
                    const isLast = rIdx === list.length - 1;
                    return (
                      <tr key={rIdx} className={`${bg} text-white`}>
                        {cells.map((c, cIdx) => (
                          <td key={cIdx} className={`p-2 ${!isLast ? "border-b border-white/20" : ""}`}>{c.trim()}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {block.sourcesTitle && (
              <p className="pt-5 font-sans text-xs font-bold text-white tracking-wider uppercase">{block.sourcesTitle}</p>
            )}
            {(block.sources || "").split("\n").map((line, sIdx) => {
              const parts = line.split("|");
              if (!parts[0]) return null;
              return (
                <p key={sIdx} className="pt-1 font-sans text-xs text-neutral-300">
                  <a href={parts[1]?.trim()} className="underline text-neutral-300" target="_blank" rel="noreferrer">{parts[0].trim()}</a>
                </p>
              );
            })}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function BenchmarkTableHtml(block: Block): string {
  const parsedParagraphs = block.paragraphs
    ? block.paragraphs.split("\n").map((p) => p.trim()).filter((p) => p.length > 0)
    : [];
  const parsedHeaders = block.tableHeaders ? block.tableHeaders.split(',').map(h => h.trim()) : [];
  const parsedRows = block.tableRows ? block.tableRows.split('\n').map(row => row.split('|').map(cell => cell.trim())).filter(row => row.length > 0 && row[0] !== '') : [];
  const parsedSources = block.sources ? block.sources.split('\n').map(line => {
    const parts = line.split('|');
    return { title: parts[0]?.trim(), url: parts[1]?.trim() };
  }).filter(s => s.title) : [];

  return `
            <!-- Benchmark Table -->
            <tr>
              <td style="padding:40px 20px;background-color:${block.backgroundColor || '#666666'};text-align:left">
                <h1 style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:30px;font-weight:normal;line-height:36px;color:#ffffff">${block.title || ''}</h1>
                ${parsedParagraphs.map(p => `
                <p style="padding:15px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:#ffffff">${p}</p>
                `).join('')}
                
                ${parsedHeaders.length > 0 ? `
                <table cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;margin-top:20px;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px">
                  <tr style="background-color:#b654a7;color:#ffffff">
                    ${parsedHeaders.map(h => `<td style="padding:8px 10px;font-weight:bold">${h}</td>`).join('')}
                  </tr>
                  ${parsedRows.map((row, idx) => {
    const bg = idx % 2 === 0 ? 'background-color:rgba(255,255,255,0.1);' : '';
    return `
                    <tr style="${bg}color:#ffffff">
                      ${row.map(cell => {
      const border = idx !== parsedRows.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.2)' : '';
      return `<td style="padding:8px 10px;${border}">${cell}</td>`;
    }).join('')}
                    </tr>`;
  }).join('')}
                </table>
                ` : ''}
                
                ${block.sourcesTitle ? `<p style="padding:20px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;font-weight:700;line-height:18px;color:#ffffff">${block.sourcesTitle}</p>` : ''}
                ${parsedSources.map((src, idx) => {
    const pad = idx === 0 ? 'padding:6px 0 0;' : 'padding:4px 0 0;';
    return `<p style="${pad}font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;line-height:18px;color:#cccccc"><a href="${src.url}" target="_blank" style="color:#cccccc;text-decoration:underline">${src.title}</a></p>`;
  }).join('')}
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function BenchmarkTableSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-700">
      <div className="h-4 w-2/3 bg-neutral-600 rounded"></div>
      <div className="h-12 bg-neutral-900/50 rounded-xl border border-neutral-700 flex flex-col overflow-hidden divide-y divide-neutral-700 text-[8px] text-neutral-500">
        <div className="h-6 bg-[#b654a7]/85 flex items-center px-2 font-bold text-white">Results Table</div>
        <div className="h-6 flex items-center px-2">Data rows...</div>
      </div>
    </div>
  );
}
