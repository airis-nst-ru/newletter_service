import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function BlogPostPage(props: Props) {
  const { id } = await props.params;

  if (!id) return notFound();

  const blogPost = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!blogPost) return notFound();

  return (
    <div className="newsletter-editor light-theme bg-white !bg-white min-h-screen blog-post-renderer py-12 px-6">
      <div 
        className="ProseMirror prose max-w-4xl mx-auto text-neutral-800 leading-relaxed outline-none"
        style={{ color: '#171717' }}
        dangerouslySetInnerHTML={{ __html: blogPost.content }}
      />
    </div>
  );
}
