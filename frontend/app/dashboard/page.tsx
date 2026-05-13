import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProtectedHeader } from "@/components/layout/protected-header";
import { CreateNewsletterPanel } from "@/components/newsletters/create-newsletter-panel";
import { NewsletterPanel } from "@/components/newsletters/newsletter-panel";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { ApiError } from "@/lib/http/api-error";
import { getAllNewsletters } from "@/lib/newsletters/server";
import type { Newsletter } from "@/lib/newsletters/types";

export const metadata: Metadata = {
  title: "Dashboard | AIRIS Chronicle",
  description: "AIRIS Chronicle dashboard.",
};

function buildCookieHeader(cookieStore: Awaited<ReturnType<typeof cookies>>): string {
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export default async function DashboardPage() {
  let newsletters: Newsletter[] = [];

  try {
    const cookieStore = await cookies();
    newsletters = await getAllNewsletters(buildCookieHeader(cookieStore));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect(AUTH_ROUTES.login);
    }

    throw error;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_50%_0%,rgba(176,106,179,0.15)_0%,transparent_60%)] px-6 py-6 font-sans text-[#f0f0f0]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <ProtectedHeader />

        <CreateNewsletterPanel />

        <NewsletterPanel newsletters={newsletters} />
      </div>
    </main>
  );
}
