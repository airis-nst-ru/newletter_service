import React from "react";
import { Block } from "../../../types/types";

export function HeaderPreview({ block }: { block: Block }) {
  return (
    <table cellPadding="0" cellSpacing="0" className="w-full bg-[#333333] text-white">
      <tbody>
        <tr>
          <td className="p-[10px_20px]">
            {block.logoUrl && <img src={block.logoUrl} alt="Logo" className="max-w-[100px] h-auto block" />}
            <p className="pt-1 font-sans text-xs text-neutral-400 leading-normal">{block.presentsText}</p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function HeaderHtml(block: Block): string {
  return `
            <!-- Header -->
            <tr>
              <td style="padding:10px 20px;background-color:#333333">
                <a href="https://airis-club.vercel.app/" target="_blank">
                  <img alt="AIRIS" src="${block.logoUrl || ''}" width="100" style="display:block;max-width:100px;height:auto">
                </a>
                <p style="padding:4px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;line-height:21px;color:#737373">${block.presentsText || ''}</p>
              </td>
            </tr>
  `;
}

export function HeaderSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-2 w-full border border-neutral-850">
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 bg-neutral-700 rounded-md"></div>
        <div className="h-2 w-8 bg-neutral-700/50 rounded"></div>
      </div>
    </div>
  );
}
