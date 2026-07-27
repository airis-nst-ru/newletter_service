import React from "react";
import { prisma } from "@/lib/prisma";
import PreviewClient from "@/components/preview/PreviewClient";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id?: string | string[] }> }) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return notFound();

  const newsletter = await prisma.newsletter.findUnique({
    where: { id },
    include: { content: true, createdBy: true }
  });
  if (!newsletter) return notFound();

  const compiledHtml = newsletter.content?.content || "<div>No preview</div>";

  const meta = {
    id: newsletter.id,
    title: newsletter.content?.title || "Untitled",
    status: newsletter.status || "Draft",
    createdAt: newsletter.createdAt ? newsletter.createdAt.toISOString() : null,
    updatedAt: newsletter.updatedAt ? newsletter.updatedAt.toISOString() : null,
    createdByName: newsletter.createdBy?.username || null,
    editionNumber: newsletter.editionNumber || null,
    isSupportingNews: newsletter.isSupportingNews ?? false,
  };

  return (
    <div className="h-screen overflow-hidden bg-black text-white preview-root">
      <PreviewClient newsletterId={id} compiledHtml={compiledHtml} meta={meta} />
    </div>
  );
}
