import { prisma } from "@/lib/prisma";
import BlogHomeClient from "@/components/blog/BlogHomeClient";
import { getBlockHtml } from "@/lib/htmlCompiler";
import { Block } from "@/types/types";

// Force dynamic execution so that the blog always loads the latest posts from database
export const revalidate = 0;

export default async function BlogPage() {
  const blogPosts = await prisma.blogPost.findMany({
    include: {
      author: {
        select: {
          username: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedPosts = blogPosts.map((post) => {
    // Compile JSON editor state blocks to HTML for snippet & image extraction
    const blocks = (post.state as unknown as Block[]) || [];
    const htmlContent = blocks
      .filter((block) => !block.hidden)
      .map((block) => getBlockHtml(block))
      .join("\n");

    return {
      id: post.id,
      title: post.title,
      content: htmlContent,
      editionNumber: post.editionNumber,
      newsletterId: post.newsletterId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: post.author
        ? {
            username: post.author.username,
            email: post.author.email,
          }
        : null,
    };
  });

  return <BlogHomeClient posts={serializedPosts} />;
}
