import React from "react";
import { Block } from "../../../types/types";

export function UnsubscribePreview({ block }: { block: Block }) {
  return (
    <table className="w-full text-neutral-400 p-[15px_20px]" style={{ backgroundColor: block.backgroundColor || "#f5f5f5" }}>
      <tbody>
        <tr>
          <td className="text-center font-sans text-[11px] leading-relaxed py-4">
            {block.text}{" "}
            <span className="text-[#b654a7] underline">Unsubscribe</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function UnsubscribeHtml(block: Block): string {
  return `
            <!-- Unsubscribe -->
            <tr>
              <td style="padding:15px 20px;background-color:${block.backgroundColor || '#f5f5f5'};text-align:center">
                <p style="margin:0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:12px;line-height:18px;color:#999999">
                  ${block.text || ''}
                  <a href="${block.unsubscribeUrl || ''}" target="_blank" style="color:#b654a7;text-decoration:underline;font-size:12px">Unsubscribe</a>
                </p>
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function UnsubscribeSkeleton() {
  return (
    <div className="bg-neutral-50 rounded-2xl p-4 flex flex-col items-center gap-2 w-full border border-neutral-200">
      <div className="h-2 w-2/3 bg-neutral-300 rounded"></div>
      <div className="h-2 w-1/3 bg-[#b654a7]/40 rounded"></div>
    </div>
  );
}
