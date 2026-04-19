import nodemailer from "nodemailer";

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

/**
 * Sends an HTML email to a list of recipients using Gmail via nodemailer.
 */
export const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    html: string
) => {
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of recipients) {
        try {
            const unsubscribeUrl = `${process.env.BASE_URL}/api/v1/email/unsubscribe?email=${encodeURIComponent(email)}`;
            const personalizedHtml = html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);

            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: email,
                subject,
                html: personalizedHtml,
            });
            results.push({ email, success: true });
        } catch (err: any) {
            results.push({ email, success: false, error: err.message });
        }
    }

    return results;
};
