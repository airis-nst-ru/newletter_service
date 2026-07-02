import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user = await verifyToken(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const newsletter =
      await prisma.newsletter.findUnique({
        where: { id },
      });

    if (!newsletter) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Newsletter not found",
        },
        { status: 404 }
      );
    }

    if (newsletter.sent) {
      return NextResponse.json(
        {
          success: true,
          message: "Newsletter is already marked as sent",
          data: newsletter, // Note: returning without relations to keep it simple and early
        },
        { status: 200 }
      );
    }

    if (newsletter.status !== "Approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Only approved newsletters can be marked as sent",
        },
        { status: 400 }
      );
    }

    if (user.accountType !== "Sender") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Only Sender can mark as sent",
        },
        { status: 403 }
      );
    }

    const updatedNewsletter =
      await prisma.newsletter.update({
        where: { id },

        data: {
          sent: true,
          sentDate: new Date(),
          status: "Sent",
        },

        include: {
          content: true,

          createdBy: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Newsletter marked as sent",
        data: updatedNewsletter,
      },
      { status: 200 }
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