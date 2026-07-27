import React from "react";
import { Block } from "../../../types/types";

export function DividerPreview({ block }: { block: Block }) {
  return (
    <table className="w-full" style={{ backgroundColor: block.backgroundColor || "transparent" }}>
      <tbody>
        <tr>
          <td height="1" className="border-b border-[#cccccc]">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  );
}

export function DividerHtml(block: Block): string {
  return `
            <!-- Divider -->
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0;background-color:${block.backgroundColor || 'transparent'}">&nbsp;</td></tr>
  `;
}

export function DividerSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center h-16 w-full bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
      <div className="h-px bg-neutral-700 w-full"></div>
    </div>
  );
}
