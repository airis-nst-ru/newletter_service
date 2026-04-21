import nodemailer from "nodemailer";
import { logger } from "../logger/logger";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Parses a space-separated string of emails, deduplicates, validates, and sorts them.
 */
export const organiseEmails = (rawEmails: string): string[] => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emails = rawEmails
        .trim()
        .split(/\s+/)
        .filter((e) => emailRegex.test(e));

    const unique = [...new Set(emails)];
    unique.sort();

    return unique;
};

// ---------------------------------------------------------------------------
// Bulk-email configuration
// ---------------------------------------------------------------------------
const BATCH_SIZE = 20;
const CONCURRENCY = 5;
const INTER_BATCH_DELAY_MS = 4000;
const MAX_RETRIES = 2;
const FAILURE_THRESHOLD = 0.3; // 30 %

/** Reusable async sleep utility. */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Sends a single email with retry logic.
 * Retries up to MAX_RETRIES times with exponential back-off (1 s, 2 s).
 */
const sendSingleEmail = async (
    email: string,
    subject: string,
    html: string
): Promise<{ email: string; success: boolean; error?: string }> => {
    const unsubscribeUrl = `${process.env.BASE_URL}/api/v1/email/unsubscribe?email=${encodeURIComponent(email)}`;
    const personalizedHtml = html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);

    let lastError = "";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: email,
                subject,
                html: personalizedHtml,
            });
            return { email, success: true };
        } catch (err: any) {
            lastError = err.message;
            if (attempt < MAX_RETRIES) {
                await sleep(1000 * (attempt + 1)); // 1 s, 2 s back-off
            }
        }
    }

    return { email, success: false, error: lastError };
};

/**
 * Processes a batch of emails with controlled concurrency.
 * Splits the batch into sub-chunks of CONCURRENCY size and awaits each chunk.
 */
const processBatch = async (
    batch: string[],
    subject: string,
    html: string
): Promise<{ email: string; success: boolean; error?: string }[]> => {
    const batchResults: { email: string; success: boolean; error?: string }[] = [];

    for (let i = 0; i < batch.length; i += CONCURRENCY) {
        const chunk = batch.slice(i, i + CONCURRENCY);
        const chunkResults = await Promise.all(
            chunk.map(email => sendSingleEmail(email, subject, html))
        );
        batchResults.push(...chunkResults);
    }

    return batchResults;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sends an HTML email to a list of recipients using Gmail via nodemailer.
 *
 * Features:
 *  - Batching (BATCH_SIZE per batch, sequential)
 *  - Controlled concurrency (CONCURRENCY simultaneous sends per sub-chunk)
 *  - Throttling (INTER_BATCH_DELAY_MS between batches)
 *  - Retry with exponential back-off (MAX_RETRIES attempts)
 *  - 30 % failure-rate circuit breaker per batch
 *  - Optional startIndex for resumability
 *
 * @param recipients  Validated, deduplicated list of email addresses
 * @param subject     Email subject line
 * @param html        HTML template (may contain {{UNSUBSCRIBE_URL}})
 * @param startIndex  Optional index to resume from (defaults to 0)
 */
export const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    html: string,
    startIndex: number = 0
) => {
    const results: { email: string; success: boolean; error?: string }[] = [];
    const pending = recipients.slice(startIndex);
    const totalBatches = Math.ceil(pending.length / BATCH_SIZE);

    logger.info(`Starting bulk email send — ${pending.length} recipient(s), ${totalBatches} batch(es)`);

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const batch = pending.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE);

        logger.info(`Processing batch ${batchIdx + 1} of ${totalBatches} (${batch.length} emails)`);

        const batchResults = await processBatch(batch, subject, html);
        results.push(...batchResults);

        // --- failure-rate circuit breaker ---
        const batchFailures = batchResults.filter(r => !r.success).length;
        if (batch.length > 0 && batchFailures / batch.length > FAILURE_THRESHOLD) {
            logger.error(
                `Batch ${batchIdx + 1} failure rate ${((batchFailures / batch.length) * 100).toFixed(0)}% exceeds ${FAILURE_THRESHOLD * 100}% threshold — aborting remaining batches`
            );
            break;
        }

        // --- log any individual failures ---
        batchResults
            .filter(r => !r.success)
            .forEach(r => logger.warn(`Failed to send to ${r.email}: ${r.error}`));

        // --- throttle before next batch (skip delay after last batch) ---
        if (batchIdx < totalBatches - 1) {
            await sleep(INTER_BATCH_DELAY_MS);
        }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    logger.info(`Bulk email complete — total: ${results.length}, succeeded: ${succeeded}, failed: ${failed}`);

    return results;
};
