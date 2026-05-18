// app/api/v1/auth/signin/route.ts

import { NextResponse } from "next/server";
import { User } from "@/types/User";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                { status: 400 }
            );
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email address",
                },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password",
                },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username : user.username,
                accountType: user.accountType
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        const userData:User={
            id : user.id,
            email:user.email,
            username :user.username,
            accountType: user.accountType || "Editor"
        }

        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                data: {
                    user : userData,
                    token
                }
            },
            { status: 200 }
        );

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}