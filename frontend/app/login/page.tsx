import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login | AIRIS Chronicle",
  description: "Login to AIRIS Chronicle.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_50%_0%,rgba(176,106,179,0.15)_0%,transparent_60%)] px-6 py-6 font-sans text-[#f0f0f0]">
      <section className="w-full max-w-[480px] rounded-[20px] border border-[rgba(176,106,179,0.25)] bg-[rgba(255,255,255,0.04)] px-10 py-12 text-center backdrop-blur-xl">
        <Image
          src="/logo.png"
          alt="AIRIS Logo"
          width={160}
          height={160}
          priority
          className="mx-auto mb-7 h-auto max-w-[160px] drop-shadow-[0_0_24px_rgba(176,106,179,0.35)]"
        />
        <h1 className="mb-2 bg-gradient-to-br from-[#b06ab3] to-[#d4a5d6] bg-clip-text text-[2rem] font-bold leading-tight text-transparent">
          AIRIS Chronicle
        </h1>
        <p className="mt-2 text-[0.95rem] text-[#a0a0a0]">
          The official newsletter service by AIRIS.
        </p>

        <LoginForm />

        <Link
          href={AUTH_ROUTES.home}
          className="mt-6 inline-flex text-sm font-medium text-[#d4a5d6] transition-colors hover:text-[#f0d2f2]"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
