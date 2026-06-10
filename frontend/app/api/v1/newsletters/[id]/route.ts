import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";



// GET NEWSLETTER
export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const newsletter =
      await prisma.newsletter.findUnique({
        where: { id },

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

    return NextResponse.json(
      {
        success: true,
        data: newsletter,
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



// UPDATE NEWSLETTER
export async function PUT(
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

    const body = await req.json();

    const {
      dueDate,
      title,
      content,
      state,
      variables,
      sent,
      sentDate,
      supportingNewsSection,
      status,
    } = body;

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

    if (
      newsletter.createdById !== user.id && user.accountType !== "Approver"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        { status: 403 }
      );
    }

    const updateData:
      Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }

    if (dueDate) {
      updateData.dueDate =
        new Date(dueDate);
    }

    if (sent !== undefined) {
      updateData.sent = sent;
    }

    if (sentDate) {
      updateData.sentDate =
        new Date(sentDate);
    }

    if (
      supportingNewsSection !==
      undefined
    ) {
      updateData.supportingNewsSection =
        supportingNewsSection;
    }

    await prisma.newsletter.update({
      where: { id },
      data: updateData,
    });

    if (
      title ||
      content ||
      state
    ) {
      await prisma.newsletterContent.upsert({
        where: {
          newsletterId: id,
        },

        create: {
          newsletterId: id,
          title:
            title || "Untitled",
          content:
            content || "<div></div>",
          ...(state && { state }),
        },

        update: {
          ...(title && { title }),
          ...(content && {
            content,
          }),
          ...(state && { state }),
        },
      });
    }

    if (status === "Approved") {
      const existingNewsletter = await prisma.newsletter.findUnique({
        where: { id },
        include: { content: true }
      });
      if (existingNewsletter) {
        const titleToUse = title || existingNewsletter.content?.title || "Untitled";
        const stateToUse = state || existingNewsletter.content?.state || null;
        const editionNumberToUse = existingNewsletter.editionNumber;
        const authorIdToUse = existingNewsletter.createdById;

        const existingBlogPost = await prisma.blogPost.findFirst({
          where: { newsletterId: id }
        });

        if (existingBlogPost) {
          await prisma.blogPost.update({
            where: { id: existingBlogPost.id },
            data: {
              title: titleToUse,
              state: stateToUse,
              editionNumber: editionNumberToUse,
              authorId: authorIdToUse,
            }
          });
        } else {
          await prisma.blogPost.create({
            data: {
              title: titleToUse,
              state: stateToUse,
              editionNumber: editionNumberToUse,
              newsletterId: id,
              authorId: authorIdToUse,
            }
          });
        }
      }
    }

    const updatedNewsletter =
      await prisma.newsletter.findUnique({
        where: { id },

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
          "Newsletter updated successfully",
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



// DELETE NEWSLETTER
export async function DELETE(
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

    if (
      newsletter.createdById !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        { status: 403 }
      );
    }

    await prisma.newsletter.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Newsletter deleted successfully",
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