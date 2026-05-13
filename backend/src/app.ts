import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/httpLogger.middleware";

/**
 * Express Application Instance.
 * 
 * Configures middleware, routes, and error handling.
 */
const app = express();

// app-level middleware config
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));


// root landing page
app.get("/", (_req, res) => {
    res.type("html").send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AIRIS Chronicle</title>
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
                    margin: 0 auto 28px;
                    filter: drop-shadow(0 0 24px rgba(176, 106, 179, 0.35));
                }
                .card h1 {
                    font-size: 2rem;
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
                <h1>AIRIS Chronicle</h1>
                <p>The official newsletter service by AIRIS.</p>
            </div>
        </body>
        </html>
    `);
});

// router imports
import healthCheckRouter from "./routes/healthcheck.routes"
import emailRouter from "./routes/email.routes"
import authRouter from "./routes/auth.routes"
import newsletterRouter from "./routes/newsletter.routes"

// url mapping
app.use("/healthcheck", healthCheckRouter)
app.use("/api/v1/email", emailRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/newsletters", newsletterRouter)


// global error handler
app.use(errorHandler);


export default app;