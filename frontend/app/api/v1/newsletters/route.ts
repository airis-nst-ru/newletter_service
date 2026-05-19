import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";


// CREATE NEWSLETTER
export async function POST(req: NextRequest) {
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

    if(user?.accountType != "Editor"){
      return NextResponse.json({
        success: false,
        message: "You are not authorized to create a newsletter",
      }, {status: 401})
    }

    const {
      dueDate,
      title,
      editionNumber,
      content,
      state,
      hasSupportingNews,
    } = await req.json();

    if (!dueDate || !title || !content) {
      return NextResponse.json(
        {
          success: false,
          message:
            "dueDate, title and content are required",
        },
        { status: 400 }
      );
    }

    const dueDateObj = new Date(dueDate);

    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid due date",
        },
        { status: 400 }
      );
    }

    const newsletter =
      await prisma.newsletter.create({
        data: {
          dueDate: dueDateObj,
          hasSupportingNews: hasSupportingNews || false,
          createdById: user.id,
          editionNumber: editionNumber,

          content: {
            create: {
              title,
              content,
              ...(state && { state }),
            },
          },
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
          "Newsletter created successfully",
        data: newsletter,
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



// GET ALL NEWSLETTERS
export async function GET() {
  try {
    const newsletters =
      await prisma.newsletter.findMany({
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

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      {
        success: true,
        data: newsletters,
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