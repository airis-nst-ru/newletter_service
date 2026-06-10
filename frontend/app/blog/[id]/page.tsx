import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getBlockHtml } from "@/lib/htmlCompiler";
import { Block } from "@/types/types";
import BlogPostClient from "@/components/blog/BlogPostClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

function getBlockTitle(block: Block): string | null {
  if (block.hidden) return null;
  if (block.type === "header" || block.type === "footer" || block.type === "unsubscribe" || block.type === "divider") {
    return null;
  }
  return block.title || block.gridCardsTitle || block.quoteText || null;
}

function getRecommendationThumbnail(blocks: Block[]): string | null {
  for (const block of blocks) {
    if (block.imageUrl) return block.imageUrl;
  }
  return null;
}

export default async function BlogPostPage(props: Props) {
  const { id } = await props.params;

  if (!id) return notFound();

  // Fetch the current blog post
  const blogPost = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!blogPost) return notFound();

  // Fetch up to 3 recommendations (excluding current post)
  const recommendations = await prisma.blogPost.findMany({
    where: { id: { not: id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const blocks = (blogPost.state as unknown as Block[]) || [];

  // Filter out header, footer, unsubscribe blocks
  const contentBlocks = blocks.filter(
    (block) =>
      !block.hidden &&
      block.type !== "header" &&
      block.type !== "footer" &&
      block.type !== "unsubscribe"
  );

  // Compile the blocks into HTML strings for the client
  const blocksHtml = contentBlocks.map((block) => ({
    id: block.id,
    html: getBlockHtml(block),
  }));

  // Build the headings array for the table of contents navigation
  const headings = contentBlocks
    .map((block) => ({
      id: block.id,
      title: getBlockTitle(block),
    }))
    .filter((h) => h.title !== null) as { id: string; title: string }[];

  // Extract social links from stripped footer block if present
  const footerBlock = blocks.find((b) => b.type === "footer");
  const instagramUrl = footerBlock?.instagramUrl || "https://instagram.com";
  const linkedinUrl = footerBlock?.linkedinUrl || "https://linkedin.com";
  const websiteUrl = "https://airis.nstru.com"; // placeholder website link
  const mailAddress = "airis@nstru.com"; // placeholder email address

  const socialLinks = {
    instagramUrl,
    linkedinUrl,
    websiteUrl,
    mailAddress,
  };

  // Serialize recommendation posts
  const serializedRecommendations = recommendations.map((rec) => {
    const recBlocks = (rec.state as unknown as Block[]) || [];
    return {
      id: rec.id,
      title: rec.title,
      editionNumber: rec.editionNumber,
      createdAt: rec.createdAt.toISOString(),
      thumbnailUrl: getRecommendationThumbnail(recBlocks),
    };
  });

  return (
    <BlogPostClient
      post={{
        id: blogPost.id,
        title: blogPost.title,
        editionNumber: blogPost.editionNumber,
        newsletterId: blogPost.newsletterId,
        createdAt: blogPost.createdAt.toISOString(),
      }}
      headings={headings}
      blocksHtml={blocksHtml}
      recommendations={serializedRecommendations}
      socialLinks={socialLinks}
    />
  );
}
