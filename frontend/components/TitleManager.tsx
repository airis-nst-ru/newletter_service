// TitleManager.tsx
"use client";

import { useEffect } from "react";
import { useTitle } from "@/app/context/TitleContext";

export default function TitleManager() {
  const titleContext = useTitle();
  const pageTitle = titleContext?.pageTitle;

  useEffect(() => {
    if (!pageTitle) {
      return;
    }
    console.log("TitleManager: Setting document.title to:", pageTitle);
    document.title = pageTitle;

    // Use a small timeout to override Next.js metadata hydration timing
    const timeoutId = setTimeout(() => {
      console.log("TitleManager (deferred): Setting document.title to:", pageTitle);
      document.title = pageTitle;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pageTitle]);

  return null;
}