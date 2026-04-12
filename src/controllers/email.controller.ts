import { Request, Response } from "express";
import prisma from "../config/prisma";

const unsubscribeEmail = async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
        return res.status(400).send("<h1>Error</h1><p>Email is required</p>");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send("<h1>Error</h1><p>Invalid email format</p>");
    }

    try {
        const existingEmail = await prisma.email.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return res.status(404).type("html").send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Not Subscribed — AIRIS</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Inter', Arial, sans-serif;
                            background-color: #0a0a0a;
                            color: #f0f0f0;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 24px;
                            background-image: radial-gradient(ellipse at 50% 0%, rgba(176, 106, 179, 0.15) 0%, transparent 60%);
                        }
                        .card {
                            background: rgba(255, 255, 255, 0.04);
                            border: 1px solid rgba(176, 106, 179, 0.25);
                            backdrop-filter: blur(12px);
                            border-radius: 20px;
                            padding: 48px 40px;
                            max-width: 480px;
                            width: 100%;
                            text-align: center;
                        }
                        .card img {
                            max-width: 160px;
                            margin-bottom: 28px;
                            filter: drop-shadow(0 0 24px rgba(176, 106, 179, 0.35));
                        }
                        .card h1 {
                            font-size: 1.75rem;
                            font-weight: 700;
                            margin-bottom: 8px;
                            background: linear-gradient(135deg, #b06ab3, #d4a5d6);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        .card p {
                            font-size: 0.95rem;
                            color: #a0a0a0;
                            margin-top: 8px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <img src="/logo.png" alt="AIRIS Logo" />
                        <h1>Not Subscribed</h1>
                        <p>You aren't subscribed to the newsletter.</p>
                    </div>
                </body>
                </html>
            `);
        }

        await prisma.email.create({
            data: { email }
        });

        return res.status(200).type("html").send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Unsubscribed — AIRIS</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        background-color: #0a0a0a;
                        color: #f0f0f0;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        background-image: radial-gradient(ellipse at 50% 0%, rgba(176, 106, 179, 0.15) 0%, transparent 60%);
                    }
                    .card {
                        background: rgba(255, 255, 255, 0.04);
                        border: 1px solid rgba(176, 106, 179, 0.25);
                        backdrop-filter: blur(12px);
                        border-radius: 20px;
                        padding: 48px 40px;
                        max-width: 480px;
                        width: 100%;
                        text-align: center;
                    }
                    .card img {
                        max-width: 160px;
                        margin-bottom: 28px;
                        filter: drop-shadow(0 0 24px rgba(176, 106, 179, 0.35));
                    }
                    .card h1 {
                        font-size: 1.75rem;
                        font-weight: 700;
                        margin-bottom: 8px;
                        background: linear-gradient(135deg, #b06ab3, #d4a5d6);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .card p {
                        font-size: 0.95rem;
                        color: #a0a0a0;
                        margin-bottom: 28px;
                    }
                    .card p strong { color: #d4a5d6; }
                    .card textarea {
                        width: 100%;
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(176, 106, 179, 0.3);
                        border-radius: 12px;
                        padding: 14px;
                        font-family: 'Inter', sans-serif;
                        font-size: 0.9rem;
                        color: #f0f0f0;
                        resize: vertical;
                        outline: none;
                        transition: border-color 0.25s ease;
                    }
                    .card textarea::placeholder { color: #666; }
                    .card textarea:focus { border-color: #b06ab3; }
                    .card button {
                        margin-top: 16px;
                        width: 100%;
                        padding: 14px;
                        border: none;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #b06ab3, #8e44ad);
                        color: #fff;
                        font-family: 'Inter', sans-serif;
                        font-size: 0.95rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: opacity 0.2s ease, transform 0.15s ease;
                    }
                    .card button:hover { opacity: 0.9; transform: translateY(-1px); }
                    .card button:active { transform: translateY(0); }
                </style>
            </head>
            <body>
                <div class="card">
                    <img src="/logo.png" alt="AIRIS Logo" />
                    <h1>Unsubscribe Successful</h1>
                    <p>You've been unsubscribed from the newsletter for <strong>${email}</strong></p>
                    <form action="/api/v1/email/feedback" method="POST">
                        <input type="hidden" name="email" value="${email}" />
                        <textarea name="feedback" placeholder="Tell us why you unsubscribed..." rows="4"></textarea>
                        <button type="submit">Submit Feedback</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        return res.status(500).send("<h1>Error</h1><p>Failed to unsubscribe</p>");
    }
};

const submitFeedback = async (req: Request, res: Response) => {
    const { email, feedback } = req.body;

    if (!email || !feedback) {
        return res.status(400).send("<h1>Error</h1><p>Email and feedback are required</p>");
    }

    try {
        await prisma.feedback.create({
            data: { email, feedback }
        });

        return res.status(200).type("html").send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Feedback — AIRIS</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        background-color: #0a0a0a;
                        color: #f0f0f0;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        background-image: radial-gradient(ellipse at 50% 0%, rgba(176, 106, 179, 0.15) 0%, transparent 60%);
                    }
                    .card {
                        background: rgba(255, 255, 255, 0.04);
                        border: 1px solid rgba(176, 106, 179, 0.25);
                        backdrop-filter: blur(12px);
                        border-radius: 20px;
                        padding: 48px 40px;
                        max-width: 480px;
                        width: 100%;
                        text-align: center;
                    }
                    .card img {
                        max-width: 160px;
                        margin-bottom: 28px;
                        filter: drop-shadow(0 0 24px rgba(176, 106, 179, 0.35));
                    }
                    .card .checkmark {
                        width: 56px;
                        height: 56px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #b06ab3, #8e44ad);
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 20px;
                        font-size: 1.6rem;
                    }
                    .card h1 {
                        font-size: 1.75rem;
                        font-weight: 700;
                        margin-bottom: 8px;
                        background: linear-gradient(135deg, #b06ab3, #d4a5d6);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .card p {
                        font-size: 0.95rem;
                        color: #a0a0a0;
                        margin-top: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <img src="/logo.png" alt="AIRIS Logo" />
                    <div class="checkmark">✓</div>
                    <h1>Thank You!</h1>
                    <p>Your feedback has been received. We appreciate you taking the time to share your thoughts.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        return res.status(500).send("<h1>Error</h1><p>Failed to submit feedback</p>");
    }
};

export default unsubscribeEmail;
export { submitFeedback };