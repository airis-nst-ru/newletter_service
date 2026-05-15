import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "../utils/jwt.util";
import prisma from "../config/prisma";

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
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
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
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                const decodedRefresh = verifyRefreshToken(refreshToken);
                if (decodedRefresh) {
                    const user = await prisma.user.findUnique({ where: { id: decodedRefresh.id } });
                    if (user && user.refreshToken === refreshToken) {
                        const newAccessToken = generateAccessToken({ id: user.id, email: user.email, username: user.username });
                        res.cookie('accessToken', newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "strict",
                            maxAge: 15 * 60 * 1000 // 15 minutes
                        });
                        req.user = { id: user.id, email: user.email, username: user.username };
                        return next();
                    }
                }
            }
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
