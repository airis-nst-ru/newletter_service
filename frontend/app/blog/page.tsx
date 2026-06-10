import { prisma } from "@/lib/prisma";
import BlogHomeClient from "@/components/blog/BlogHomeClient";

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

  const serializedPosts = blogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
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
  }));

  return <BlogHomeClient posts={serializedPosts} />;
}
