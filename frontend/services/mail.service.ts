import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Transporter (singleton)
// ---------------------------------------------------------------------------
let _transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      pool: true,
      maxConnections: 2,
      maxMessages: 100,
    });
  }
  return _transporter;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Base URL for building links inside emails (server-side only)
// ---------------------------------------------------------------------------
const FRONTEND_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

// ---------------------------------------------------------------------------
// Token helpers — base64url encode/decode the subscriber email
// ---------------------------------------------------------------------------
export function encodeEmailToken(email: string): string {
  return Buffer.from(email).toString("base64url");
}

export function decodeEmailToken(token: string): string {
  return Buffer.from(token, "base64url").toString("utf-8");
}

export function personaliseHtml(html: string, email: string): string {
  const token = encodeEmailToken(email);
  const unsubscribeUrl = `${FRONTEND_BASE_URL}/unsubscribe?token=${token}`;
  return html
    .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)
    .replace(/\{\{subscriber_email\}\}/g, encodeURIComponent(email));
}

// ---------------------------------------------------------------------------
// Single send
// ---------------------------------------------------------------------------
export async function sendEmail(
  email: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const personalisedHtml = personaliseHtml(html, email);
  try {
    await getTransporter().sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      html: personalisedHtml,
    });
    return { email, success: true };
  } catch (err: any) {
    return { email, success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Bulk send (batched with concurrency)
// ---------------------------------------------------------------------------
const BATCH_SIZE = 20;
const CONCURRENCY = 5;
const INTER_BATCH_DELAY_MS = 4000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function processBatch(
  batch: string[],
  subject: string,
  html: string
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map((email) => sendEmail(email, subject, html))
    );
    results.push(...chunkResults);
  }
  return results;
}

export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<EmailResult[]> {
  // Deduplicate and validate
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const unique = [...new Set(recipients.map((e) => e.trim()).filter((e) => emailRegex.test(e)))];

  const allResults: EmailResult[] = [];
  const totalBatches = Math.ceil(unique.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const batch = unique.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const batchResults = await processBatch(batch, subject, html);
    allResults.push(...batchResults);
    if (i < totalBatches - 1) await sleep(INTER_BATCH_DELAY_MS);
  }

  return allResults;
}
