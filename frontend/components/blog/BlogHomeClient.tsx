"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  editionNumber: number | null;
  newsletterId: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    email: string;
  } | null;
}

interface BlogHomeClientProps {
  posts: BlogPost[];
}

function getSnippet(html: string, maxLen = 150) {
  if (!html) return "";
  // Find all <p> tags to select the first substantial body paragraph
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(html)) !== null) {
    const rawText = match[1];
    const plainText = rawText.replace(/<[^>]*>/g, " ");
    const cleanText = plainText.replace(/\s+/g, " ").trim();
    // Ignore short metadata paragraphs like "presents" or subheadings by requiring >= 100 chars
    if (cleanText.length >= 100) {
      if (cleanText.length <= maxLen) return cleanText;
      return cleanText.substring(0, maxLen) + "...";
    }
  }
  // Fallback to parsing all HTML if no matching paragraph exists
  const plainText = html.replace(/<[^>]*>/g, " ");
  const cleanText = plainText.replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLen) return cleanText;
  return cleanText.substring(0, maxLen) + "...";
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Helper to extract second img src from HTML content
function getSecondImageSrc(html: string): string | null {
  if (!html) return null;
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  const matches = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  return matches.length >= 2 ? matches[1] : null;
}

// Sleek thumbnails (extracts second image from HTML or falls back to gradient)
const PostThumbnail = ({ html, index, className = "" }: { html: string; index: number; className?: string }) => {
  const src = getSecondImageSrc(html);
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={src}
          alt="Article Thumbnail"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    );
  }
  const gradients = [
    "from-[#B654A7] to-[#8a3c7e]",
    "from-purple-600 to-[#B654A7]",
    "from-neutral-900 to-[#8a3c7e]",
    "from-indigo-600 to-pink-500",
    "from-[#B654A7] to-indigo-800",
  ];
  const grad = gradients[index % gradients.length];
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${grad} flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[1px]" />
      <BookOpen className="w-10 h-10 text-white/35 z-10 animate-pulse" />
    </div>
  );
};

export default function BlogHomeClient({ posts }: BlogHomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.author?.username || "").toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  // Asymmetric Editorial Layout division (only active when not searching)
  const featuredPost = useMemo(() => {
    return posts.length > 0 ? posts[0] : null;
  }, [posts]);

  const highlightPosts = useMemo(() => {
    return posts.slice(1, 4); // 3 items below hero
  }, [posts]);

  const sidePosts = useMemo(() => {
    return posts.slice(4, 6); // 2 horizontal items on the right side
  }, [posts]);

  const remainingPosts = useMemo(() => {
    return posts.slice(6); // remaining items in grid
  }, [posts]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#B654A7]/20 selection:text-neutral-900">
      
      {/* 1. HERO SECTION (Dark banner mirroring the Dribbble Acecat header) */}
      {!isSearching && featuredPost ? (
        <section className="bg-neutral-950 text-white pb-20 relative overflow-hidden">
          {/* Radial accent glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-radial from-[#B654A7]/15 via-transparent to-transparent pointer-events-none" />

          {/* Navigation Bar inside Hero */}
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between border-b border-white/10 mb-12">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="AIRIS Logo"
                width={42}
                height={42}
                className="group-hover:scale-105 transition-transform duration-300 filter brightness-110"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-wider text-white">
                  AIRIS
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest -mt-1">
                  Chronicle
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors duration-200">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Hero Layout */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Post Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3 text-neutral-400 text-xs">
                  {featuredPost.editionNumber && (
                    <span className="bg-[#B654A7] text-white px-3.5 py-0.5 rounded-full font-bold tracking-wide text-[10px] uppercase">
                      Edition #{featuredPost.editionNumber}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featuredPost.createdAt)}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight text-white hover:text-neutral-200 transition-colors">
                  <Link href={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                </h1>

                <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-xl">
                  {getSnippet(featuredPost.content, 200)}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/10 max-w-xl">
                  <span className="text-xs text-neutral-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-500" />
                    By {featuredPost.author?.username || "AIRIS Editor"}
                  </span>

                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white hover:text-black py-2.5 px-6 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300"
                  >
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Sleek visual thumbnail */}
              <div className="lg:col-span-6 h-[250px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl relative group">
                <PostThumbnail html={featuredPost.content} index={0} className="w-full h-full transform group-hover:scale-102 transition-transform duration-500" />
              </div>

            </div>
          </div>
        </section>
      ) : null}

      {/* 2. HEADER FOR SEARCH (Only shows when search queries are active or there are no posts) */}
      {(isSearching || !featuredPost) && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="AIRIS Logo"
                width={36}
                height={36}
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-neutral-900">AIRIS</span>
                <span className="text-[10px] text-neutral-400 font-semibold tracking-widest uppercase -mt-1">Chronicle</span>
              </div>
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-neutral-500 hover:text-neutral-900">
              Dashboard
            </Link>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Search Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-neutral-100 pb-10">
          <div>
            <h2 className="text-2xl font-bold font-serif text-neutral-900 tracking-tight">
              {isSearching ? `Search Results for "${searchQuery}"` : "Latest Editions & Reads"}
            </h2>
            <p className="text-neutral-500 text-sm mt-1">Explore all approved newsletters from the AIRIS Chronicle team.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              id="blog-search-input"
              placeholder="Search newsletters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#B654A7] focus:bg-white rounded-full pl-10 pr-4 py-2.5 text-xs outline-none shadow-xs transition-all duration-300 text-neutral-900"
            />
          </div>
        </div>

        {/* Dynamic Layout Rendering */}
        {isSearching ? (
          /* Search results layout grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
            {filteredPosts.map((post, idx) => (
              <article
                key={post.id}
                className="group flex flex-col bg-white rounded-[32px] p-6 hover:shadow-[0_15px_50px_rgba(182,84,167,0.07)] hover:-translate-y-1 transition-all duration-300 max-w-[420px] w-full mx-auto"
              >
                {/* Image (Top) */}
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-50 relative shrink-0">
                  <PostThumbnail
                    html={post.content}
                    index={idx}
                    className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                  />
                  {post.editionNumber && (
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#B654A7] font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs border border-neutral-100/60">
                      EDITION #{post.editionNumber}
                    </span>
                  )}
                </div>

                {/* Content occupying the rest of the area */}
                <div className="flex-1 flex flex-col justify-between mt-5">
                  <div className="space-y-3">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-neutral-355" />
                      {formatDate(post.createdAt)}
                    </span>

                    <h3 className="text-xl md:text-2xl font-bold font-serif text-neutral-900 group-hover:text-[#B654A7] leading-snug transition-colors">
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>

                    <p className="text-neutral-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                      {getSnippet(post.content, 180)}
                    </p>
                  </div>

                  <div className="border-t border-neutral-100 pt-5 mt-5">
                    <Link
                      href={`/blog/${post.id}`}
                      className="flex items-center justify-between text-sm font-semibold text-neutral-800 hover:text-[#B654A7] transition-colors group/link w-full"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 bg-neutral-50 border border-neutral-150 rounded-3xl">
            <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-neutral-900">No blog posts available</h3>
            <p className="text-neutral-500 text-sm mt-1">Approve newsletters to publish them to the blog.</p>
          </div>
        ) : (
          /* 3. ASYMMETRIC EDITORIAL LAYOUT (Matching Dribbble inspiration) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column (Span 8): Featured highlights & remaining grid */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Highlight Grid (Top 3 secondary posts) */}
              {highlightPosts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B654A7]" /> Highlights & Focus
                  </h3>
                  <div className="flex flex-col gap-10 max-w-4xl">
                    {highlightPosts.map((post, idx) => (
                      <article
                        key={post.id}
                        className="group flex flex-col-reverse md:flex-row gap-8 items-center justify-between bg-white border border-neutral-150 hover:border-[#B654A7]/20 rounded-3xl p-6 md:p-8 hover:shadow-[0_15px_50px_rgba(182,84,167,0.07)] hover:-translate-y-1 transition-all duration-300"
                      >
                        {/* Text (Left on desktop) */}
                        <div className="flex-1 space-y-4 w-full">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                              <Calendar className="w-3.5 h-3.5 text-neutral-355" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>

                          <h4 className="text-xl md:text-2xl font-bold font-serif text-neutral-900 group-hover:text-[#B654A7] leading-snug transition-colors">
                            <Link href={`/blog/${post.id}`}>{post.title}</Link>
                          </h4>

                          <p className="text-neutral-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                            {getSnippet(post.content, 180)}
                          </p>

                          <Link
                            href={`/blog/${post.id}`}
                            className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-700 hover:text-[#B654A7] transition-colors group/link w-full"
                          >
                            <span className="text-[11px] text-neutral-500 font-normal flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-neutral-400" />
                              By {post.author?.username || "AIRIS Editor"}
                            </span>
                            <span className="flex items-center gap-1 text-[#B654A7]">
                              Read Full Article
                              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </Link>
                        </div>

                        {/* Image (Right on desktop) */}
                        <div className="w-full md:w-64 aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-50 shrink-0 relative">
                          <PostThumbnail
                            html={post.content}
                            index={idx + 1}
                            className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                          />
                          {post.editionNumber && (
                            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#B654A7] font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs border border-neutral-100/60">
                              EDITION #{post.editionNumber}
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Remaining Posts Grid (Infinite scroll / lists) */}
              {remainingPosts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> More Editions
                  </h3>
                  <div className="flex flex-col gap-10 max-w-4xl">
                    {remainingPosts.map((post, idx) => (
                      <article
                        key={post.id}
                        className="group flex flex-col-reverse md:flex-row gap-8 items-center justify-between bg-white border border-neutral-150 hover:border-[#B654A7]/20 rounded-3xl p-6 md:p-8 hover:shadow-[0_15px_50px_rgba(182,84,167,0.07)] hover:-translate-y-1 transition-all duration-300"
                      >
                        {/* Text (Left on desktop) */}
                        <div className="flex-1 space-y-4 w-full">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                              <Calendar className="w-3.5 h-3.5 text-neutral-355" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>

                          <h4 className="text-xl md:text-2xl font-bold font-serif text-neutral-900 group-hover:text-[#B654A7] leading-snug transition-colors">
                            <Link href={`/blog/${post.id}`}>{post.title}</Link>
                          </h4>

                          <p className="text-neutral-500 text-xs md:text-sm leading-relaxed line-clamp-3">
                            {getSnippet(post.content, 180)}
                          </p>

                          <Link
                            href={`/blog/${post.id}`}
                            className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-700 hover:text-[#B654A7] transition-colors group/link w-full"
                          >
                            <span className="text-[11px] text-neutral-500 font-normal flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-neutral-400" />
                              By {post.author?.username || "AIRIS Editor"}
                            </span>
                            <span className="flex items-center gap-1 text-[#B654A7]">
                              Read Edition
                              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </Link>
                        </div>

                        {/* Image (Right on desktop) */}
                        <div className="w-full md:w-64 aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-50 shrink-0 relative">
                          <PostThumbnail
                            html={post.content}
                            index={idx + 4}
                            className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                          />
                          {post.editionNumber && (
                            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#B654A7] font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs border border-neutral-100/60">
                              EDITION #{post.editionNumber}
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (Span 4): Horizontal mini-cards & About Box */}
            <div className="lg:col-span-4 space-y-12">
              
              {/* Secondary/Side Articles (Horizontal list like right column of Dribbble shot) */}
              {sidePosts.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B654A7]" /> Trending Reads
                  </h3>
                  
                  <div className="space-y-6">
                    {sidePosts.map((post, idx) => (
                      <article key={post.id} className="group flex gap-4 bg-white p-4 rounded-2xl hover:shadow-[0_8px_30px_rgba(182,84,167,0.04)] transition-all duration-300">
                        {/* 1/3 Thumbnail width */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-50 relative">
                          <PostThumbnail html={post.content} index={idx + 8} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        {/* 2/3 Content width */}
                        <div className="flex flex-col justify-between min-w-0 py-0.5">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-[#B654A7] uppercase tracking-wider">Edition #{post.editionNumber || 1}</span>
                            <h4 className="text-xs font-bold font-serif text-neutral-900 group-hover:text-[#B654A7] transition-colors truncate leading-snug">
                              <Link href={`/blog/${post.id}`}>{post.title}</Link>
                            </h4>
                            <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3 text-neutral-300" />
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                          <Link href={`/blog/${post.id}`} className="text-[10px] font-semibold text-[#B654A7] hover:text-[#B654A7]/80 transition-colors flex items-center gap-1">
                            Read More <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* "About us" container (Dark block matching "A little bit about Acecat") */}
              <div className="bg-neutral-950 text-white rounded-3xl p-8 relative overflow-hidden space-y-4 shadow-xl border border-neutral-900">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-radial from-[#B654A7]/10 via-transparent to-transparent pointer-events-none" />
                
                <span className="text-[10px] text-[#B654A7] font-bold tracking-widest uppercase">OUR MISSION</span>
                
                <h3 className="text-xl font-bold font-serif text-white tracking-tight">
                  A little bit about AIRIS Chronicle
                </h3>
                
                <p className="text-neutral-400 text-xs leading-relaxed">
                  AIRIS Chronicle is our premium digital publishing platform designed to summarize the cutting-edge advances, research, and milestones from the AIRIS AI department. Each edition is carefully composed by our editors and peer-approved before distribution.
                </p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <Image
                    src="/logo.png"
                    alt="AIRIS Logo"
                    width={32}
                    height={32}
                    className="filter brightness-110"
                  />
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">AIRIS AI GROUP</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white mt-24 py-16 text-center text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p>© {new Date().getFullYear()} AIRIS Chronicle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
