import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";

/**
 * Extend Express Request to include user data
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                username: string;
            };
        }
    }
}

/**
 * Middleware to verify Access Token from cookies
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get access token from cookies or Authorization header
        let token = req.cookies.accessToken;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // Remove "Bearer " prefix
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Missing access token"
            });
        }

        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token"
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token verification failed"
        });
    }
};
