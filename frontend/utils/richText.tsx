import React from "react";

export function isRichHtml(content: string | undefined): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  return trimmed.startsWith("<p>") || trimmed.startsWith("<div") || trimmed.startsWith("<ul>") || trimmed.startsWith("<ol>") || trimmed.startsWith("<h");
}

export function formatRichHtmlForEmail(content: string | undefined, textColor: string = "#333333", linkColor: string = "#b654a7"): string {
  if (!content) return "";
  if (!isRichHtml(content)) {
    // Legacy plain text paragraphs separated by \n
    return content
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => `<p style="margin:15px 0 0;padding:0;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:14px;font-weight:400;line-height:21px;color:${textColor};">${p}</p>`)
      .join("");
  }

  let html = content;

  // Add styles inline to <p> tags
  html = html.replace(/<p>/g, `<p style="margin: 15px 0 0; padding: 0; font-family: arial,'helvetica neue',helvetica,sans-serif; font-size: 14px; font-weight: 400; line-height: 21px; color: ${textColor};">`);

  // Add styles inline to <a> tags (links)
  html = html.replace(/<a /g, `<a style="color: ${linkColor}; font-weight: 700; text-decoration: none;" `);

  // Add styles inline to list tags
  html = html.replace(/<ul>/g, `<ul style="margin: 15px 0 0; padding-left: 20px; font-family: arial,'helvetica neue',helvetica,sans-serif; font-size: 14px; color: ${textColor};">`);
  html = html.replace(/<ol>/g, `<ol style="margin: 15px 0 0; padding-left: 20px; font-family: arial,'helvetica neue',helvetica,sans-serif; font-size: 14px; color: ${textColor};">`);
  html = html.replace(/<li>/g, `<li style="margin-bottom: 5px; font-family: arial,'helvetica neue',helvetica,sans-serif; font-size: 14px; line-height: 21px; color: ${textColor};">`);

  return html;
}

export function renderParagraphsPreview(
  content: string | undefined, 
  textClassName: string = "text-neutral-700", 
  linkClassName: string = "text-[#b654a7]"
): React.ReactNode {
  if (!content) return null;
  if (!isRichHtml(content)) {
    const parsedParagraphs = content.split("\n").map((p) => p.trim()).filter((p) => p.length > 0);
    return parsedParagraphs.map((p, pIdx) => (
      <p key={pIdx} className={`pt-4 font-sans text-sm ${textClassName} leading-relaxed`} dangerouslySetInnerHTML={{ __html: p }}></p>
    ));
  }
  return (
    <div
      className={`rich-text-preview font-sans text-sm ${textClassName} leading-relaxed space-y-4 pt-4 [&_a]:${linkClassName} [&_a]:font-bold [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export function splitRichHtmlParagraphs(content: string | undefined): string[] {
  if (!content) return [];
  if (!isRichHtml(content)) {
    return content.split("\n").map((p) => p.trim()).filter((p) => p.length > 0);
  }

  const matches = content.match(/<p>[\s\S]*?<\/p>/g);
  if (matches) {
    return matches;
  }

  return content
    .split("</p>")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => {
      let chunk = p;
      if (!chunk.startsWith("<p>")) {
        const pIdx = chunk.indexOf("<p>");
        if (pIdx !== -1) chunk = chunk.substring(pIdx);
      }
      return chunk.endsWith("</p>") ? chunk : chunk + "</p>";
    });
}
