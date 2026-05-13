import type { Metadata } from "next";
import { ProtectedHeader } from "@/components/layout/protected-header";

export const metadata: Metadata = {
  title: "Editor | AIRIS Chronicle",
  description: "Create a newsletter in AIRIS Chronicle.",
};

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_50%_0%,rgba(176,106,179,0.15)_0%,transparent_60%)] px-6 py-6 font-sans text-[#f0f0f0]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <ProtectedHeader />

        <section className="rounded-[20px] border border-[rgba(176,106,179,0.25)] bg-[rgba(255,255,255,0.04)] p-8 backdrop-blur-xl">
          <p className="text-sm font-medium text-[#d4a5d6]">Editor</p>
          <h1 className="mt-2 text-2xl font-bold text-[#f0f0f0]">
            Create Newsletter
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a0a0a0]">
            Newsletter editor workspace.
          </p>
        </section>
      </div>
    </main>
  );
}
