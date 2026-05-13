import nodemailer from "nodemailer";
import { logger } from "../logger/logger";

// ---------------------------------------------------------------------------
// Transporter Setup
// ---------------------------------------------------------------------------
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
    pool: true,
    maxConnections: 2,
    maxMessages: 100,
});

transporter.on("idle", () => {
    // This logs when a connection is returned to the pool and reused
    logger.info("SMTP connection is idle (reused/available in pool)");
});

// ---------------------------------------------------------------------------
// Email Utilities
// ---------------------------------------------------------------------------

/**
 * Parses an array of emails, deduplicates, validates, and sorts them.
 */
export const organiseEmails = (rawEmails: string[]): string[] => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emails = rawEmails
        .filter(e => typeof e === 'string')
        .map(e => e.trim())
        .filter((e) => emailRegex.test(e));

    const unique = [...new Set(emails)];
    unique.sort();

    return unique;
};

// ---------------------------------------------------------------------------
// Bulk-email Configuration
// ---------------------------------------------------------------------------
const BATCH_SIZE = 20;
const CONCURRENCY = 5;
const INTER_BATCH_DELAY_MS = 4000;
const RETRY_COOLDOWN_MS = 30000; // 30 seconds cooldown for rate limits
const FAILURE_THRESHOLD = 0.3; // 30 %

/** Reusable async sleep utility. */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Batch Processor
// ---------------------------------------------------------------------------

interface EmailResult {
    email: string;
    success: boolean;
    error?: string;
    errorCode?: string | number;
    shouldRetry?: boolean;
}

/**
 * Sends a single email.
 */
const sendEmail = async (
    email: string,
    subject: string,
    html: string
): Promise<EmailResult> => {
    const unsubscribeUrl = `${process.env.BASE_URL}/api/v1/email/unsubscribe?email=${encodeURIComponent(email)}`;
    const personalizedHtml = html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);

    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            html: personalizedHtml,
        });
        return { email, success: true };
    } catch (err: any) {
        // Detect typical rate limiting or authentication pause errors
        const isRateLimit = err.responseCode === 454 || err.responseCode === 421 || err.message?.toLowerCase().includes('rate limit');
        return { 
            email, 
            success: false, 
            error: err.message, 
            errorCode: err.responseCode,
            shouldRetry: isRateLimit
        };
    }
};

/**
 * Processes a batch of emails.
 */
const processBatch = async (
    batch: string[],
    subject: string,
    html: string
): Promise<EmailResult[]> => {
    const batchResults: EmailResult[] = [];

    // Send with limited concurrency
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
        const chunk = batch.slice(i, i + CONCURRENCY);
        const chunkResults = await Promise.all(
            chunk.map(email => sendEmail(email, subject, html))
        );
        batchResults.push(...chunkResults);
    }

    return batchResults;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    html: string,
    startIndex: number = 0
) => {
    const results: EmailResult[] = [];
    const pending = recipients.slice(startIndex);
    const totalBatches = Math.ceil(pending.length / BATCH_SIZE);

    logger.info(`Total emails received for sending: ${pending.length}`);
    logger.info(`Starting bulk email send — ${totalBatches} batch(es) to process.`);

    let retryQueue: string[] = [];

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const batch = pending.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE);

        logger.info(`Processing batch ${batchIdx + 1} of ${totalBatches} (${batch.length} emails)`);

        const batchResults = await processBatch(batch, subject, html);
        
        const succeeded = batchResults.filter(r => r.success);
        const failed = batchResults.filter(r => !r.success);

        logger.info(`Batch ${batchIdx + 1} complete. Success: ${succeeded.length}, Failed: ${failed.length}`);

        let rateLimitHit = false;

        failed.forEach(r => {
            logger.warn(`Failed to send to ${r.email}: ${r.error}`);
            if (r.shouldRetry) {
                rateLimitHit = true;
                retryQueue.push(r.email);
            }
        });

        results.push(...batchResults);

        // --- failure-rate circuit breaker ---
        if (batch.length > 0 && failed.length / batch.length > FAILURE_THRESHOLD) {
            logger.error(
                `Batch ${batchIdx + 1} failure rate ${((failed.length / batch.length) * 100).toFixed(0)}% exceeds ${FAILURE_THRESHOLD * 100}% threshold — aborting remaining standard batches.`
            );
            break;
        }

        // --- throttle or cooldown before next batch ---
        if (rateLimitHit) {
            logger.warn(`Rate limit detected in batch ${batchIdx + 1}. Pausing for cooldown: ${RETRY_COOLDOWN_MS / 1000} seconds...`);
            await sleep(RETRY_COOLDOWN_MS);
        } else if (batchIdx < totalBatches - 1) {
            await sleep(INTER_BATCH_DELAY_MS);
        }
    }

    // --- Retry Logic ---
    if (retryQueue.length > 0) {
        logger.info(`Starting retry queue for ${retryQueue.length} rate-limited emails after full cooldown...`);
        await sleep(RETRY_COOLDOWN_MS); // Extra safety cooldown before retries

        const retryResults = await processBatch(retryQueue, subject, html);
        
        retryResults.forEach(r => {
            if (!r.success) {
                logger.error(`Final retry failed for ${r.email}: ${r.error}`);
            } else {
                logger.info(`Successfully sent to ${r.email} on retry.`);
            }
            
            // Update the result in the main results array
            const idx = results.findIndex(res => res.email === r.email);
            if (idx !== -1) {
                results[idx] = r;
            } else {
                results.push(r);
            }
        });
    }

    const finalSucceeded = results.filter(r => r.success).length;
    const finalFailed = results.filter(r => !r.success).length;

    logger.info(`Bulk email process complete — total: ${results.length}, succeeded: ${finalSucceeded}, failed: ${finalFailed}`);

    return results;
};
