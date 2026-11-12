"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { newsArticles, newsCategories } from "./newsData";

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All News");

  const filteredArticles = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return newsArticles.filter((article) => {
      const matchSearch = [
        article.title,
        article.excerpt,
        article.category,
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchCategory =
        category === "All News" || article.category === category;

      return matchSearch && matchCategory;
    });
  }, [search, category]);

  const featured = filteredArticles.find((article) => article.featured);

  const otherArticles = filteredArticles.filter(
    (article) => article.id !== featured?.id
  );

  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-background text-white">
      {/* BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: 'url("/images/bg%20news.jpg")' }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,20,0.55)_0%,rgba(9,7,20,0.80)_30%,rgba(9,7,20,0.94)_70%,#090714_100%)]" />

      {/* TITLE */}
      <section className="flex min-h-[190px] flex-col items-center justify-center px-[6%] pt-[55px] pb-[22px] text-center max-[600px]:min-h-[165px] max-[600px]:px-[5%] max-[600px]:pt-[45px] max-[600px]:pb-5">
        <h1 className="m-0 font-heading text-[clamp(28px,3.5vw,37px)] leading-[1.3] font-extrabold tracking-[-0.7px] text-white max-[600px]:text-[28px]">
          NEWS & STORIES
        </h1>
        <div className="mt-[13px] h-[3px] w-[65px] rounded-[5px] bg-primary" />
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto w-full max-w-[1250px] px-[6%] pt-2 pb-[75px] max-[600px]:px-[5%] max-[600px]:pb-[50px]">
        {/* SEARCH */}
        <div className="flex h-12 w-full items-center gap-[13px] rounded-lg border border-[#c4b5fd3b] bg-[#100c1feb] px-4">
          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="shrink-0 text-[#b69aff]"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            placeholder="Search stories..."
            aria-label="Search news"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-xs text-white outline-none placeholder:text-[#91889f]"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="cursor-pointer border-0 bg-transparent text-[22px] text-[#c4b5fd]"
            >
              ×
            </button>
          )}
        </div>

        {/* CATEGORY */}
        <div className="my-[19px] flex flex-wrap gap-[9px] max-[600px]:gap-[7px]">
          {newsCategories.map((item) => {
            const active = category === item;
            return (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                className={`min-h-9 cursor-pointer rounded-md border px-3.5 text-[11px] font-semibold transition duration-200 max-[600px]:px-2.5 max-[600px]:text-[10px] ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-[#a78bfa38] bg-[#140f26e6] text-[#c8bfdc] hover:border-primary hover:bg-primary hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <p className="m-0 mb-7 text-[11px] text-[#a49bb5]">
          {filteredArticles.length} articles
        </p>

        {/* FEATURED STORY */}
        {featured && (
          <section className="mb-12">
            <div className="mb-[17px]">
              <h2 className="m-0 font-heading text-[23px] font-extrabold text-white">
                Featured Story
              </h2>
            </div>

            <Link
              href={`/news/${featured.slug}`}
              className="group grid grid-cols-[1.15fr_0.85fr] overflow-hidden rounded-[11px] border border-[#c4b5fd26] bg-[#0f0b1df2] text-white transition duration-250 hover:-translate-y-[3px] hover:border-primary max-[600px]:grid-cols-1"
            >
              <div className="relative min-h-[310px] overflow-hidden max-[600px]:min-h-[220px]">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="block h-full min-h-[310px] w-full object-cover transition duration-400 group-hover:scale-[1.04] max-[600px]:min-h-[220px]"
                />

                <span className="absolute top-4 left-4 rounded-[5px] bg-primary px-3 py-2 text-[9px] font-bold tracking-[1px] text-white">
                  FEATURED
                </span>
              </div>

              <div className="flex flex-col justify-center p-8 max-[900px]:p-[23px] max-[600px]:p-[22px]">
                <span className="text-[10px] font-bold text-[#b69aff]">
                  {featured.category}
                </span>

                <h3 className="my-3 font-heading text-[26px] leading-[1.35] font-extrabold text-white max-[600px]:text-[22px]">
                  {featured.title}
                </h3>

                <p className="m-0 text-xs leading-[1.8] text-[#aaa2bd]">
                  {featured.excerpt}
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5 text-[10px] text-[#898198]">
                  <span>{featured.author}</span>
                  <span>{featured.date}</span>
                  <span>{featured.readTime}</span>
                </div>

                <span className="mt-[23px] inline-flex items-center text-xs font-bold text-[#b69aff]">
                  Read Story
                  <span className="ml-2 inline-flex items-center justify-center text-[29px] leading-[0.8] font-normal text-[#b69aff] transition-transform duration-200 group-hover:translate-x-1">
                    ›
                  </span>
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* ARTICLE GRID */}
        <section className="mb-[60px]">
          <div className="mb-[17px]">
            <h2 className="m-0 font-heading text-[23px] font-extrabold text-white">
              Latest Stories
            </h2>
          </div>

          {otherArticles.length > 0 ? (
            <div className="grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 max-[600px]:gap-[17px]">
              {otherArticles.map((article) => (
                <Link
                  href={`/news/${article.slug}`}
                  key={article.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-[9px] border border-[#c4b5fd21] bg-[#0f0b1df5] text-white transition duration-250 hover:-translate-y-1 hover:border-primary"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="block size-full object-cover transition duration-400 group-hover:scale-105"
                    />

                    <span className="absolute bottom-[11px] left-[11px] rounded bg-[#090714eb] px-2.5 py-[7px] text-[9px] font-semibold text-[#c4b5fd]">
                      {article.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-[17px]">
                    <span className="text-[10px] text-primary-light">
                      {article.date}
                    </span>

                    <h3 className="mt-2.5 mb-2 min-h-[48px] font-heading text-base leading-normal font-bold text-white max-[600px]:min-h-0">
                      {article.title}
                    </h3>

                    <p className="m-0 text-[11px] leading-[1.8] text-[#aaa2bd]">
                      {article.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-[18px]">
                      <span className="text-[10px] text-[#817991]">
                        {article.readTime}
                      </span>

                      <span className="inline-flex items-center text-[11px] font-bold whitespace-nowrap text-[#b69aff]">
                        Read More
                        <span className="ml-2 inline-flex items-center justify-center text-[29px] leading-[0.8] font-normal text-[#b69aff] transition-transform duration-200 group-hover:translate-x-1">
                          ›
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[9px] border border-[#c4b5fd21] bg-[#0f0b1de6] px-[15px] py-[45px] text-center">
              <h3 className="m-0 mb-2 font-heading text-lg">
                No Stories Found
              </h3>

              <p className="text-xs text-[#aaa2bd]">
                Try another keyword or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All News");
                }}
                className="mt-2.5 cursor-pointer rounded-md border-0 bg-primary px-[17px] py-2.5 text-[11px] text-white"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="px-5 py-[42px] text-center max-[600px]:px-[15px] max-[600px]:py-8">
          <h2 className="m-0 font-heading text-[clamp(24px,3.5vw,33px)] font-extrabold text-white">
            Find Your Next
            <span className="text-[#b69aff]"> Live Experience</span>
          </h2>

          <p className="mx-auto mt-3 mb-[22px] text-xs leading-[1.8] text-[#aaa2bd]">
            Explore upcoming concerts and discover your next favorite show.
          </p>

          <Link
            href="/concerts"
            className="group inline-flex items-center gap-[5px] rounded-md bg-primary px-[19px] py-3 text-[11px] font-bold text-white transition duration-200 hover:bg-[#7042d4]"
          >
            Explore Concerts
            <span className="ml-2 inline-flex items-center justify-center text-[29px] leading-[0.8] font-normal text-[#b69aff] transition-transform duration-200 group-hover:translate-x-1">
              ›
            </span>
          </Link>
        </section>
      </section>
    </main>
  );
}