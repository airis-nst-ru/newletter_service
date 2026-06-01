"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTitle } from "@/app/context/TitleContext"
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const setTitle = useTitle().setPageTitle;
  useEffect(() => {
    setTitle("Airis Chronicle")
  }, [setTitle])
  return (
    <div className="bg-[rgba(255, 255, 255, 0.04)] w-full min-h-screen flex flex-col items-center justify-center gap-4">
      <Image src="/logo.png" alt="AIRIS Logo" width={200} height={200} className="mb-7" />
      <h1 className="text-4xl font-bold text-center">AIRIS Chronicle</h1>
      <p className="text-xl text-center">The official newsletter service by AIRIS.</p>
      <button className="cursor-pointer bg-[#B654A7] py-3 px-10 rounded-lg text-lg font-semibold" onClick={() => router.push("/auth/login")}>Login</button>
    </div>
  );
}
