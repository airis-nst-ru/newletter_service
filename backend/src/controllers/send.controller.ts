import { Request, Response } from "express";
import { organiseEmails, sendBulkEmail } from "../service/mail.service";
import { template_v2 } from "../template/v2";

const sendNewsletter = async (req: Request, res: Response) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== process.env.NEWSLETTER_SECRET_KEY) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: invalid or missing API key",
        });
    }

    const { emails, subject } = req.body;

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

    try {
        const results = await sendBulkEmail(organised, emailSubject, template_v2);

        const succeeded = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        return res.status(200).json({
            success: true,
            message: `Sent to ${succeeded} recipient(s), ${failed} failed`,
            total: organised.length,
            succeeded,
            failed,
            results,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to send emails",
            error: error.message,
        });
    }
};

export default sendNewsletter;
