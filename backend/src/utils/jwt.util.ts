import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret";

export interface TokenPayload {
    id: string;
    email: string;
    username: string;
}

/**
 * Generate Access Token (expires in 15 minutes)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    });
};

/**
 * Generate Refresh Token (expires in 7 days)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};

/**
 * Generate both Access and Refresh tokens
 */
export const generateTokenPair = (payload: TokenPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};
