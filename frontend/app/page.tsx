import Image from "next/image";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function Home() {
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
        <a
          href={AUTH_ROUTES.login}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md border border-[rgba(176,106,179,0.35)] bg-[#b06ab3] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9e56a2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4a5d6]"
        >
          Login
        </a>
      </section>
    </main>
  );
}
