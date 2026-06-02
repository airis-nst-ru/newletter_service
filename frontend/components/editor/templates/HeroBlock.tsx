import React from "react";
import { Block } from "../../../types/types";

export function HeroPreview({ block }: { block: Block }) {
  return (
    <table cellPadding="0" cellSpacing="0" className="w-full bg-[#333333] text-white">
      <tbody>
        <tr>
          <td className="p-[40px_20px] text-left">
            <h1 className="hero-title m-0 font-sans text-[36px] font-bold leading-tight uppercase tracking-tight text-white">{block.title}</h1>
            <p className="pt-2.5 font-sans text-xs font-bold leading-normal text-white">{block.subtitle}</p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function HeroHtml(block: Block): string {
  return `
            <!-- Hero -->
            <tr>
              <td style="padding:40px 20px;background-color:#333333;text-align:left">
                <h1 class="hero-title" style="margin:0;font-family:helvetica,'helvetica neue',arial,verdana,sans-serif;font-size:48px;font-weight:700;line-height:1.1;color:#ffffff;letter-spacing:0">${block.title || ''}</h1>
                <p style="padding:10px 0 0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:700;line-height:21px;color:#ffffff">${block.subtitle || ''}</p>
              </td>
            </tr>
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
  `;
}

export function HeroSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex flex-col gap-3 w-full border border-neutral-850">
      <div className="h-6 w-5/6 bg-neutral-700 rounded-md"></div>
      <div className="h-3 w-2/3 bg-neutral-700/50 rounded-md"></div>
    </div>
  );
}
