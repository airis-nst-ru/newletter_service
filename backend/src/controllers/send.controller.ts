import { Request, Response } from "express";
import { organiseEmails, sendBulkEmail } from "../service/mail.service";
import { v2_readmore_template } from "./../template/v2_readmore";
import { getIO } from "../socket";
import { logger } from "../logger/logger";

/** Emit a log line to all connected socket clients */
const emitLog = (level: "info" | "warn" | "error", message: string) => {
    const io = getIO();
    if (io) {
        io.emit("send:log", { level, message, timestamp: new Date().toISOString() });
    }
};

const sendNewsletter = async (req: Request, res: Response) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== process.env.NEWSLETTER_SECRET_KEY) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: invalid or missing API key",
        });
    }

    const { emails, subject, html } = req.body;

    if (!emails || !Array.isArray(emails)) {
        return res.status(400).json({
            success: false,
            message: "emails is required and must be an array of strings",
        });
    }

    const organised = organiseEmails(emails);

    if (organised.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No valid email addresses found",
        });
    }

    const emailSubject = subject || "The AIRIS Chronicle";
    const templateHtml = (typeof html === "string" && html.trim().length > 0)
        ? html
        : v2_readmore_template;

    if (typeof html === "string" && html.trim().length > 0) {
        logger.info("Using newsletter HTML from request body");
        emitLog("info", "Using newsletter HTML from request body");
    } else {
        logger.info("No HTML provided — falling back to v2_readmore_template");
        emitLog("warn", "No HTML in request — using fallback template");
    }

    emitLog("info", `Total recipients: ${organised.length}`);
    emitLog("info", `Subject: "${emailSubject}"`);

    try {
        const results = await sendBulkEmail(organised, emailSubject, templateHtml, 0, emitLog);

        const succeeded = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        const summary = {
            success: true,
            message: `Sent to ${succeeded} recipient(s), ${failed} failed`,
            total: organised.length,
            succeeded,
            failed,
            results,
        };

        // Emit the final result to the socket so the terminal can show it
        const io = getIO();
        if (io) {
            io.emit("send:complete", summary);
        }

        emitLog("info", `✓ Complete — ${succeeded} sent, ${failed} failed`);

        return res.status(200).json(summary);
    } catch (error: any) {
        emitLog("error", `Fatal error: ${error.message}`);
        const io = getIO();
        if (io) {
            io.emit("send:complete", { success: false, message: error.message });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to send emails",
            error: error.message,
        });
    }
};

export default sendNewsletter;
