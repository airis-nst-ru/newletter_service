// app/api/v1/auth/signup/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const {
      email,
      username,
      password,
      secretKey,
      accountType
    } = await req.json();

    if (accountType !== "Editor" && accountType !== "Approver" && accountType !== "Sender"){
      return NextResponse.json({
        success: false,
        message: "Account type not allowed for signup"
      },
      {status: 403})
    }


    // Secret key validation
    if (
      secretKey !==
      process.env.SIGNUP_SECRET_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid secret key",
        },
        { status: 403 }
      );
    }

    // Validation
    if (
      !email ||
      !username ||
      !password || 
      !accountType
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, username, password and accountType is required",
        },
        { status: 400 }
      );
    }

    // Email validation
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

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Check existing email
    const existingEmail =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    // Check existing username
    const existingUsername =
      await prisma.user.findUnique({
        where: {
          username,
        },
      });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username already taken",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user =
      await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          accountType
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error",
      },
      { status: 500 }
    );
  }
}