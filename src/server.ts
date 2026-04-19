import app from "./app";
import { appConfig } from "./config/envConfig";

const port = appConfig.port
const microserviceName = appConfig.microserviceName

/**
 * Server Entry Point.
 * 
 * Starts the Express application on the configured port.
 * On Vercel, the app is handled as a serverless function (see api/index.ts),
 * so we skip calling listen() to avoid hanging the process.
 */
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`${microserviceName} is up and running on http://localhost:${port}`);
    });
}

export default app;