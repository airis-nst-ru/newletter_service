"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BlogPostClientProps {
  post: {
    id: string;
    title: string;
    editionNumber: number | null;
    newsletterId: string | null;
    createdAt: string;
  };
  headings: { id: string; title: string }[];
  blocksHtml: { id: string; html: string }[];
  recommendations: {
    id: string;
    title: string;
    editionNumber: number | null;
    createdAt: string;
    thumbnailUrl: string | null;
  }[];
  socialLinks: {
    instagramUrl: string;
    linkedinUrl: string;
    websiteUrl: string;
    mailAddress: string;
  };
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPostClient({
  post,
  headings,
  blocksHtml,
  recommendations,
  socialLinks,
}: BlogPostClientProps) {
  const [activeId, setActiveId] = useState<string>("");

  // Track the active section using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    blocksHtml.forEach((block) => {
      const el = document.getElementById(block.id);
      if (el) observer.observe(el);
    });

    return () => {
      blocksHtml.forEach((block) => {
        const el = document.getElementById(block.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [blocksHtml]);

  const scrollToBlock = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#B654A7]/20 selection:text-neutral-900 flex flex-col justify-between">
      
      {/* 1. HEADER COMPONENT - FULL WIDTH WITH MORE HEIGHT & BRAND ACCENTS */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 w-full px-8 md:px-16 py-6 flex items-center justify-between">
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-[#B654A7] transition-all duration-200 group shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Blog
        </Link>

        <span className="text-base md:text-lg font-serif font-bold text-neutral-900 truncate max-w-xs md:max-w-2xl px-4">
          {post.title}
        </span>

        <div className="text-[10px] text-[#B654A7] bg-[#B654A7]/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider shrink-0">
          {post.editionNumber ? `Edition #${post.editionNumber}` : "AIRIS Read"}
        </div>
      </header>

      {/* 2. LEFT/CENTER CONTENT & RIGHT STICKY NAVIGATION PANE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left & Center: Content (Spans 9 columns) */}
          <div className="lg:col-span-9 space-y-10 blog-post-renderer">
            {blocksHtml.map((block) => (
              <div
                key={block.id}
                id={block.id}
                className="scroll-mt-28 bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-neutral-100/80 hover:shadow-[0_15px_45px_rgba(182,84,167,0.03)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
                  <tbody dangerouslySetInnerHTML={{ __html: block.html }} />
                </table>
              </div>
            ))}
          </div>

          {/* Right Pane: Sticky Headings Navigation (Spans 3 columns) */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 self-start space-y-6 pl-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                On This Page
              </h3>
              <nav className="space-y-3 relative border-l border-neutral-100 pl-0">
                {headings.map((h) => {
                  const isActive = activeId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => scrollToBlock(h.id)}
                      className={`block text-left text-xs leading-relaxed transition-all duration-200 cursor-pointer w-full truncate pl-4 -ml-[1px] ${
                        isActive
                          ? "text-[#B654A7] font-semibold border-l-2 border-[#B654A7]"
                          : "text-neutral-400 hover:text-neutral-700 border-l border-transparent"
                      }`}
                    >
                      {h.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

        </div>
      </main>

      {/* 3. MORE READ PANE (BOTTOM RECOMMENDATIONS) */}
      {recommendations.length > 0 && (
        <section className="border-t border-neutral-100 bg-neutral-50/40 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h3 className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B654A7]" /> More from AIRIS Chronicle
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendations.map((recPost, idx) => (
                <article
                  key={recPost.id}
                  className="group bg-white rounded-3xl p-5 hover:shadow-[0_20px_50px_rgba(182,84,167,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-neutral-100/60"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-50 relative shrink-0">
                      {recPost.thumbnailUrl ? (
                        <img
                          src={recPost.thumbnailUrl}
                          alt="Article Thumbnail"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#B654A7] to-indigo-800" />
                      )}
                      {recPost.editionNumber && (
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#B654A7] font-bold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded shadow-xs">
                          Edition #{recPost.editionNumber}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider block">
                        {formatDate(recPost.createdAt)}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-neutral-900 group-hover:text-[#B654A7] line-clamp-2 leading-snug transition-colors">
                        <Link href={`/blog/${recPost.id}`}>{recPost.title}</Link>
                      </h4>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-4 mt-4 flex items-center justify-between">
                    <Link
                      href={`/blog/${recPost.id}`}
                      className="text-xs font-semibold text-neutral-600 hover:text-[#B654A7] flex items-center gap-1 group/link"
                    >
                      Read Article
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. DARK FOOTER WITH BRAND COLORS */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 px-8 md:px-16 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm tracking-wider text-white">AIRIS CHRONICLE</span>
          </div>

          <p className="text-[10px] text-neutral-500 md:order-last">
            © {new Date().getFullYear()} AIRIS AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href={socialLinks.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-[#B654A7] transition-colors duration-200"
              title="Website"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </a>
            <a
              href={socialLinks.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-[#B654A7] transition-colors duration-200"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a
              href={socialLinks.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-[#B654A7] transition-colors duration-200"
              title="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a
              href={`mailto:${socialLinks.mailAddress}`}
              className="text-neutral-400 hover:text-[#B654A7] transition-colors duration-200"
              title="Email Contact"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
