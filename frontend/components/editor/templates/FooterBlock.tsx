import React from "react";
import { Block } from "../../../types/types";

export function FooterPreview({ block }: { block: Block }) {
  return (
    <table cellPadding="0" cellSpacing="0" className="w-full text-white p-5" style={{ backgroundColor: block.backgroundColor || "#333333" }}>
      <tbody>
        <tr>
          <td>
            <div className="flex items-center justify-between p-4">
              {block.logoUrl && <img src={block.logoUrl} alt="Footer Logo" className="max-w-[150px] h-auto block" />}
              <div className="flex gap-2">
                {block.instagramUrl && <span className="text-xs text-neutral-400 underline">Instagram</span>}
                {block.linkedinUrl && <span className="text-xs text-neutral-400 underline">LinkedIn</span>}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function FooterHtml(block: Block): string {
  return `
            <!-- Footer -->
            <tr>
              <td style="padding:20px;background-color:${block.backgroundColor || '#333333'}">
                <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
                  <tr>
                    <td valign="middle" class="footer-col" style="text-align:left">
                      <a href="https://airis-club.vercel.app/" target="_blank">
                        <img alt="AIRIS" src="${block.logoUrl || ''}" width="180" class="footer-logo" style="display:block;max-width:180px;height:auto;border:0;outline:none;text-decoration:none;margin:0">
                      </a>
                    </td>
                    <td valign="middle" class="footer-col" style="text-align:right">
                      <table align="right" cellpadding="0" cellspacing="0" class="social-table" style="border-collapse:collapse">
                        <tr>
                          ${block.instagramUrl ? `
                          <td style="padding:0 5px 0 0">
                            <a href="${block.instagramUrl}">
                              <img alt="Inst" height="32" src="https://eyuczcj.stripocdn.email/content/assets/img/social-icons/square-colored/instagram-square-colored.png" title="Instagram" width="32" style="display:block;width:32px;height:32px;border:0">
                            </a>
                          </td>
                          ` : ''}
                          ${block.linkedinUrl ? `
                          <td style="padding:0 0 0 5px">
                            <a href="${block.linkedinUrl}">
                              <img alt="IN" height="32" src="https://eyuczcj.stripocdn.email/content/assets/img/social-icons/square-colored/linkedin-square-colored.png" title="LinkedIn" width="32" style="display:block;width:32px;height:32px;border:0">
                            </a>
                          </td>
                          ` : ''}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  `;
}

export function FooterSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-2xl p-4 flex justify-between items-center w-full border border-neutral-800">
      <div className="h-4 w-20 bg-neutral-700 rounded-md"></div>
      <div className="flex gap-2">
        <div className="h-4 w-4 bg-neutral-700 rounded-full"></div>
        <div className="h-4 w-4 bg-neutral-700 rounded-full"></div>
      </div>
    </div>
  );
}
