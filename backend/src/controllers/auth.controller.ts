import { Request, Response } from "express";
import prisma from "../config/prisma";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.util";

/**
 * Sign in user with email and password
 * POST /api/v1/auth/signin
 */
export const signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password (for now using simple comparison - use bcrypt in production)
        // TODO: Replace with bcrypt comparison in production
        const isPasswordValid = user.password === password;

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token pair
        const tokens = generateTokenPair({
            id: user.id,
            email: user.email,
            username: user.username
        });

        // Store refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: tokens.refreshToken }
        });

        // Set cookies for tokens
        const isProduction = process.env.NODE_ENV === "production";
        
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: isProduction, // Only send over HTTPS in production
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: isProduction, // Only send over HTTPS in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data without password
        const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;

        res.status(200).json({
            success: true,
            message: "Sign in successful",
            data: {
                user: userWithoutSensitiveData
            }
        });
    } catch (error) {
        console.error("Sign in error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Refresh Access Token using Refresh Token
 * POST /api/v1/auth/refresh
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        // Get refresh token from cookies
        const refreshToken = req.cookies.refreshToken;

        // Validate input
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        // Find user and verify refresh token matches stored one
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Generate new token pair
        const newTokens = generateTokenPair({
            id: user.id,
            email: user.email,
            username: user.username
        });

        // Update refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newTokens.refreshToken }
        });

        // Set new cookies for tokens
        const isProduction = process.env.NODE_ENV === "production";
        
        res.cookie("accessToken", newTokens.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully"
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Logout user by clearing refresh token
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Clear refresh token from database
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        });

        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
