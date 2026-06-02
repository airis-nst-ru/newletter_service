import { Block } from "@/types/types";
import { HeaderHtml } from "@/components/editor/templates/HeaderBlock";
import { HeroHtml } from "@/components/editor/templates/HeroBlock";
import { SectionHtml } from "@/components/editor/templates/SectionBlock";
import { FeatureComparisonHtml } from "@/components/editor/templates/FeatureComparisonBlock";
import { BenchmarkTableHtml } from "@/components/editor/templates/BenchmarkTableBlock";
import { MemberSpotlightHtml } from "@/components/editor/templates/MemberSpotlightBlock";
import { TechnicalSessionHtml } from "@/components/editor/templates/TechnicalSessionBlock";
import { AirisReadsHtml } from "@/components/editor/templates/AirisReadsBlock";
import { ConclusionHtml } from "@/components/editor/templates/ConclusionBlock";
import { FooterHtml } from "@/components/editor/templates/FooterBlock";
import { UnsubscribeHtml } from "@/components/editor/templates/UnsubscribeBlock";
import { DividerHtml } from "@/components/editor/templates/DividerBlock";

const VALID_BLOCK_TYPES = [
  "header", "hero", "section", "featureComparison", "benchmarkTable",
  "memberSpotlight", "technicalSession", "airisReads", "conclusion",
  "footer", "unsubscribe", "divider",
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Validates an array of blocks. Returns errors (block-breaking) and warnings (non-fatal). */
export function validateBlocks(blocks: Block[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(blocks)) {
    errors.push("State must be an array of blocks");
    return { valid: false, errors, warnings };
  }

  blocks.forEach((b, i) => {
    if (!b.id) errors.push(`Block[${i}] missing required field: id`);
    if (!b.type) errors.push(`Block[${i}] missing required field: type`);
    else if (!VALID_BLOCK_TYPES.includes(b.type)) {
      errors.push(`Block[${i}] has unknown type: "${b.type}"`);
    }

    // Non-fatal warnings
    if (b.type === "header" && !b.logoUrl) warnings.push(`Header block has no logoUrl`);
    if (b.type === "hero" && !b.title) warnings.push(`Hero block has no title`);
    if ((b.type === "section" || b.type === "memberSpotlight") && !b.imageUrl) {
      warnings.push(`${b.type} block has no imageUrl`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/** Generates the HTML string for a single block (excluding hidden ones). */
export function getBlockHtml(block: Block): string {
  switch (block.type) {
    case "header":            return HeaderHtml(block);
    case "hero":              return HeroHtml(block);
    case "section":           return SectionHtml(block);
    case "featureComparison": return FeatureComparisonHtml(block);
    case "benchmarkTable":    return BenchmarkTableHtml(block);
    case "memberSpotlight":   return MemberSpotlightHtml(block);
    case "technicalSession":  return TechnicalSessionHtml(block);
    case "airisReads":        return AirisReadsHtml(block);
    case "conclusion":        return ConclusionHtml(block);
    case "footer":            return FooterHtml(block);
    case "unsubscribe":       return UnsubscribeHtml(block);
    case "divider":           return DividerHtml(block);
    default:                  return "";
  }
}

/** Compiles the full email HTML document from a blocks array, skipping hidden blocks. */
export function generateHtmlFromBlocks(blocks: Block[]): string {
  const bodyRows = blocks
    .filter(block => !block.hidden)
    .map(block => getBlockHtml(block))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="telephone=no" name="format-detection">
    <title>The AIRIS Chronicle</title>
    <style type="text/css">
      body, p, h1, h2, h3 { margin: 0; padding: 0; }
      body { width: 100%; height: 100%; font-family: arial, 'helvetica neue', helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #F0F4F2; }
      a { text-decoration: none; }
      img { display: block; border: 0; outline: none; text-decoration: none; margin: 0; }
      table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      td { border-collapse: collapse; }
      .highlight { color: #b654a7; }
      @media only screen and (max-width: 600px) {
        .wrapper { width: 100% !important; }
        .responsive-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; border-left: none !important; }
        .hero-title { font-size: 30px !important; }
        .footer-col { display: block !important; width: 100% !important; text-align: center !important; }
        .footer-logo { margin: 0 auto !important; }
        .social-table { margin: 16px auto 0 !important; }
      }
    </style>
  </head>
  <body style="width:100%;height:100%;font-family:arial,'helvetica neue',helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;margin:0;background-color:#F0F4F2">
    <table cellpadding="0" cellspacing="0" role="none" width="100%" style="border-collapse:collapse;border-spacing:0;padding:0;margin:0;width:100%;height:100%;background-color:#F0F4F2">
      <tr>
        <td align="center" valign="top" style="padding:0;margin:0">
          <table align="center" cellpadding="0" cellspacing="0" width="600" class="wrapper" style="max-width:600px;width:100%;background-color:#ffffff">
            <!-- Top divider -->
            <tr><td height="1" style="border-bottom:1px solid #cccccc;font-size:0;line-height:0">&nbsp;</td></tr>
${bodyRows}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
