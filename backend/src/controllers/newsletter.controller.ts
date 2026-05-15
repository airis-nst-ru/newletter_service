import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * Create a new newsletter
 * POST /api/v1/newsletters
 */
export const createNewsletter = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { dueDate, title, content, state, supportingNewsSection } = req.body;

        // Validate input
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!dueDate || !title || !content) {
            return res.status(400).json({
                success: false,
                message: "dueDate, title, and content are required"
            });
        }

        // Validate date
        const dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid dueDate format"
            });
        }

        // Create newsletter with content
        const newsletter = await prisma.newsletter.create({
            data: {
                dueDate: dueDateObj,
                supportingNewsSection: supportingNewsSection || false,
                createdById: userId,
                content: {
                    create: {
                        title,
                        content,
                        ...(state && { state })
                    }
                }
            },
            include: {
                content: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Newsletter created successfully",
            data: newsletter
        });
    } catch (error) {
        console.error("Create newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get all newsletters
 * GET /api/v1/newsletters
 */
export const getAllNewsletters = async (req: Request, res: Response) => {
    try {
        const newsletters = await prisma.newsletter.findMany({
            include: {
                content: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            success: true,
            message: "Newsletters retrieved successfully",
            data: newsletters
        });
    } catch (error) {
        console.error("Get newsletters error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get newsletter by ID
 * GET /api/v1/newsletters/:id
 */
export const getNewsletterById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const newsletter = await prisma.newsletter.findUnique({
            where: { id },
            include: {
                content: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: "Newsletter not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Newsletter retrieved successfully",
            data: newsletter
        });
    } catch (error) {
        console.error("Get newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Update newsletter
 * PUT /api/v1/newsletters/:id
 */
export const updateNewsletter = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;
        const { dueDate, title, content, sent, supportingNewsSection, sentDate, state } = req.body;

        // Validate authorization
        const newsletter = await prisma.newsletter.findUnique({
            where: { id }
        });

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: "Newsletter not found"
            });
        }

        if (newsletter.createdById !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this newsletter"
            });
        }

        // Prepare update data
        const updateData: Record<string, unknown> = {};
        if (dueDate) {
            const dueDateObj = new Date(dueDate);
            if (isNaN(dueDateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid dueDate format"
                });
            }
            updateData.dueDate = dueDateObj;
        }
        if (sent !== undefined) {
            updateData.sent = sent;
        }
        if (sentDate) {
            updateData.sentDate = new Date(sentDate);
        }
        if (supportingNewsSection !== undefined) {
            updateData.supportingNewsSection = supportingNewsSection;
        }

        // Update newsletter
        const updatedNewsletter = await prisma.newsletter.update({
            where: { id },
            data: updateData,
            include: {
                content: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        // Update content if provided (upsert to create if missing)
        if (title || content || state) {
            await prisma.newsletterContent.upsert({
                where: { newsletterId: id },
                create: {
                    newsletterId: id,
                    title: title || "Untitled",
                    content: content || "<div></div>",
                    ...(state && { state })
                },
                update: {
                    ...(title && { title }),
                    ...(content && { content }),
                    ...(state && { state })
                }
            });

            // Fetch updated newsletter with content
            const finalNewsletter = await prisma.newsletter.findUnique({
                where: { id: id as string },
                include: {
                    content: true,
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            username: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                message: "Newsletter updated successfully",
                data: finalNewsletter
            });
        }

        res.status(200).json({
            success: true,
            message: "Newsletter updated successfully",
            data: updatedNewsletter
        });
    } catch (error) {
        console.error("Update newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Mark newsletter as sent
 * PATCH /api/v1/newsletters/:id/send
 */
export const markNewsletterAsSent = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        // Validate authorization
        const newsletter = await prisma.newsletter.findUnique({
            where: { id }
        });

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: "Newsletter not found"
            });
        }

        if (newsletter.createdById !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this newsletter"
            });
        }

        const updatedNewsletter = await prisma.newsletter.update({
            where: { id: id as string },
            data: {
                sent: true,
                sentDate: new Date()
            },
            include: {
                content: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: "Newsletter marked as sent",
            data: updatedNewsletter
        });
    } catch (error) {
        console.error("Mark as sent error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Delete newsletter
 * DELETE /api/v1/newsletters/:id
 */
export const deleteNewsletter = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        // Validate authorization
        const newsletter = await prisma.newsletter.findUnique({
            where: { id }
        });

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: "Newsletter not found"
            });
        }

        if (newsletter.createdById !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this newsletter"
            });
        }

        await prisma.newsletter.delete({
            where: { id: id as string }
        });

        res.status(200).json({
            success: true,
            message: "Newsletter deleted successfully"
        });
    } catch (error) {
        console.error("Delete newsletter error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const getNewsLetterByVersion = async (req: Request, res: Response) => {
    try {
        const version = Number(req.params.version);
        const email = req.query.email as string | undefined;

        if (isNaN(version) || version <= 0) {
            return res.status(400).type('html').send("Invalid version format");
        }

        const newsletter = await prisma.newsletter.findFirst({
            where: { version },
            include: {
                content: true,
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        if (!newsletter || !newsletter.content?.content) {
            return res.status(404).type('html').send("Newsletter not found");
        }

        // Track view if email provided
        if (email) {
            await prisma.newsletterView.upsert({
                where: { email_newsletterId: { email, newsletterId: newsletter.id } },
                create: { email, newsletterId: newsletter.id },
                update: { viewedAt: new Date() }
            });

            await prisma.newsletter.update({
                where: { id: newsletter.id },
                data: { viewCount: { increment: 1 } }
            });
        }

        return res.status(200).type('html').send(newsletter.content.content);
    } catch (error) {
        console.log(error);
        return res.status(500).type('html').send("Internal server error");
    }
};
