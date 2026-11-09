
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  newsArticles,
  newsCategories,
} from "./newsData";

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
      ].some((value) =>
        value.toLowerCase().includes(keyword)
      );

      const matchCategory =
        category === "All News" ||
        article.category === category;

      return matchSearch && matchCategory;
    });
  }, [search, category]);

  const featured = filteredArticles.find(
    (article) => article.featured
  );

  const otherArticles = filteredArticles.filter(
    (article) => article.id !== featured?.id
  );

  return (
    <main className="encore-news-page">

      {/* BACKGROUND */}

      <div className="news-background" />
      <div className="news-overlay" />

      {/* TITLE */}

      <section className="news-hero">

        <h1>NEWS &amp; STORIES</h1>

        <div className="news-title-line" />

      </section>

      {/* MAIN CONTENT */}

      <section className="news-content">

        {/* SEARCH */}

        <div className="news-search">

          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
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
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        {/* CATEGORY */}

        <div className="news-categories">

          {newsCategories.map((item) => (
            <button
              type="button"
              key={item}
              className={
                category === item ? "active" : ""
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>

        <p className="news-result-count">
          {filteredArticles.length} articles
        </p>

        {/* FEATURED STORY */}

        {featured && (

          <section className="news-featured-section">

            <div className="news-section-heading">
              <h2>Featured Story</h2>
            </div>

            <Link
              href={`/news/${featured.slug}`}
              className="news-featured-card"
            >

              <div className="news-featured-image">

                <img
                  src={featured.image}
                  alt={featured.title}
                />

                <span className="news-featured-badge">
                  FEATURED
                </span>

              </div>

              <div className="news-featured-info">

                <span className="news-card-category">
                  {featured.category}
                </span>

                <h3>{featured.title}</h3>

                <p>{featured.excerpt}</p>

                <div className="news-card-meta">
                  <span>{featured.author}</span>
                  <span>{featured.date}</span>
                  <span>{featured.readTime}</span>
                </div>

                <span className="news-read-more">
                  Read Story
                  <span className="news-chevron">›</span>
                </span>

              </div>

            </Link>

          </section>

        )}

        {/* ARTICLE GRID */}

        <section className="news-articles-section">

          <div className="news-section-heading">
            <h2>Latest Stories</h2>
          </div>

          {otherArticles.length > 0 ? (

            <div className="news-grid">

              {otherArticles.map((article) => (

                <Link
                  href={`/news/${article.slug}`}
                  className="news-card"
                  key={article.id}
                >

                  <div className="news-card-image">

                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                    />

                    <span className="news-image-category">
                      {article.category}
                    </span>

                  </div>

                  <div className="news-card-info">

                    <span className="news-card-date">
                      {article.date}
                    </span>

                    <h3>{article.title}</h3>

                    <p>{article.excerpt}</p>

                    <div className="news-card-bottom">

                      <span>{article.readTime}</span>

                      <span className="news-card-arrow">
                        Read More
                        <span className="news-chevron">›</span>
                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <div className="news-empty">

              <h3>No Stories Found</h3>

              <p>
                Try another keyword or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All News");
                }}
              >
                Reset Filter
              </button>

            </div>

          )}

        </section>

        {/* CTA */}

        <section className="news-cta">

          <h2>
            Find Your Next
            <span> Live Experience</span>
          </h2>

          <p>
            Explore upcoming concerts and discover your next favorite show.
          </p>

          <Link
            href="/concerts"
            className="news-cta-button"
          >
            Explore Concerts
            <span className="news-chevron">›</span>
          </Link>

        </section>

      </section>

      {/* =================================
          NEWS PAGE CSS
      ================================= */}

      <style>{`

        /* MAIN */

        .encore-news-page {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #090714;
          color: #ffffff;
          font-family: inherit;
        }

        .encore-news-page * {
          box-sizing: border-box;
        }

        /* BACKGROUND */

        .news-background {
          position: absolute;
          z-index: -2;
          inset: 0;

          background-image: url("/images/bg%20news.jpg");
          background-position: center top;
          background-size: cover;
          background-repeat: no-repeat;

          pointer-events: none;
        }

        .news-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;

          background: linear-gradient(
            180deg,
            rgba(9,7,20,0.55) 0%,
            rgba(9,7,20,0.80) 30%,
            rgba(9,7,20,0.94) 70%,
            #090714 100%
          );

          pointer-events: none;
        }

        /* TITLE */

        .news-hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          min-height: 190px;
          padding: 55px 6% 22px;

          text-align: center;
        }

        .news-hero h1 {
          margin: 0;

          color: #ffffff;

          font-size: clamp(28px, 3.5vw, 37px);
          font-weight: 850;
          letter-spacing: -0.7px;
          line-height: 1.3;
        }

        .news-title-line {
          width: 65px;
          height: 3px;

          margin-top: 13px;

          border-radius: 5px;
          background: #8b5cf6;
        }

        /* CONTENT */

        .news-content {
          width: 100%;
          max-width: 1250px;

          margin: 0 auto;
          padding: 8px 6% 75px;
        }

        /* SEARCH */

        .news-search {
          display: flex;
          align-items: center;
          gap: 13px;

          width: 100%;
          height: 48px;

          padding: 0 16px;

          border: 1px solid rgba(196,181,253,0.23);
          border-radius: 8px;

          background: rgba(16,12,31,0.92);
        }

        .news-search svg {
          flex-shrink: 0;
          color: #b69aff;
        }

        .news-search input {
          flex: 1;
          min-width: 0;
          height: 100%;

          border: none;
          outline: none;

          background: transparent;
          color: #ffffff;

          font: inherit;
          font-size: 12px;
        }

        .news-search input::placeholder {
          color: #91889f;
        }

        .news-search button {
          border: none;
          background: transparent;
          color: #c4b5fd;
          font-size: 22px;
          cursor: pointer;
        }

        /* CATEGORIES */

        .news-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;

          margin: 19px 0;
        }

        .news-categories button {
          min-height: 36px;
          padding: 0 14px;

          border: 1px solid rgba(167,139,250,0.22);
          border-radius: 6px;

          background: rgba(20,15,38,0.9);
          color: #c8bfdc;

          font-family: inherit;
          font-size: 11px;
          font-weight: 600;

          cursor: pointer;
          transition: 0.2s;
        }

        .news-categories button:hover,
        .news-categories button.active {
          border-color: #8b5cf6;
          background: #8b5cf6;
          color: #ffffff;
        }

        .news-result-count {
          margin: 0 0 28px;
          color: #a49bb5;
          font-size: 11px;
        }

        /* SECTION HEADING */

        .news-section-heading {
          margin-bottom: 17px;
        }

        .news-section-heading h2 {
          margin: 0;
          color: #ffffff;
          font-size: 23px;
          font-weight: 800;
        }

        /* FEATURED */

        .news-featured-section {
          margin-bottom: 48px;
        }

        .news-featured-card {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;

          overflow: hidden;

          border: 1px solid rgba(196,181,253,0.15);
          border-radius: 11px;

          background: rgba(15,11,29,0.95);
          color: #ffffff;

          text-decoration: none;
          transition: 0.25s;
        }

        .news-featured-card:hover {
          border-color: #8b5cf6;
          transform: translateY(-3px);
        }

        .news-featured-image {
          position: relative;
          min-height: 310px;
          overflow: hidden;
        }

        .news-featured-image img {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 310px;

          object-fit: cover;
          transition: 0.4s;
        }

        .news-featured-card:hover
        .news-featured-image img {
          transform: scale(1.04);
        }

        .news-featured-badge {
          position: absolute;
          top: 16px;
          left: 16px;

          padding: 8px 12px;

          border-radius: 5px;
          background: #8b5cf6;
          color: #ffffff;

          font-size: 9px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .news-featured-info {
          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 32px;
        }

        .news-card-category {
          color: #b69aff;
          font-size: 10px;
          font-weight: 700;
        }

        .news-featured-info h3 {
          margin: 12px 0;

          color: #ffffff;
          font-size: 26px;
          line-height: 1.35;
          font-weight: 800;
        }

        .news-featured-info > p {
          margin: 0;
          color: #aaa2bd;
          font-size: 12px;
          line-height: 1.8;
        }

        .news-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          margin-top: 20px;

          color: #898198;
          font-size: 10px;
        }

        /* CHEVRON */

        .news-chevron {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          margin-left: 8px;

          color: #b69aff;
          font-size: 29px;
          font-weight: 400;
          line-height: 0.8;

          transition: transform 0.2s ease;
        }

        .news-featured-card:hover .news-chevron,
        .news-card:hover .news-chevron,
        .news-cta-button:hover .news-chevron {
          transform: translateX(4px);
        }

        .news-read-more {
          display: inline-flex;
          align-items: center;

          margin-top: 23px;

          color: #b69aff;
          font-size: 12px;
          font-weight: 750;
        }

        /* ARTICLE GRID */

        .news-articles-section {
          margin-bottom: 60px;
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 22px;
        }

        .news-card {
          display: flex;
          flex-direction: column;

          min-width: 0;
          overflow: hidden;

          border: 1px solid rgba(196,181,253,0.13);
          border-radius: 9px;

          background: rgba(15,11,29,0.96);
          color: #ffffff;

          text-decoration: none;
          transition: 0.25s;
        }

        .news-card:hover {
          transform: translateY(-4px);
          border-color: #8b5cf6;
        }

        .news-card-image {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #151126;
        }

        .news-card-image img {
          display: block;
          width: 100%;
          height: 100%;

          object-fit: cover;
          transition: 0.4s;
        }

        .news-card:hover .news-card-image img {
          transform: scale(1.05);
        }

        .news-image-category {
          position: absolute;
          bottom: 11px;
          left: 11px;

          padding: 7px 10px;

          border-radius: 4px;
          background: rgba(9,7,20,0.92);
          color: #c4b5fd;

          font-size: 9px;
          font-weight: 650;
        }

        .news-card-info {
          display: flex;
          flex: 1;
          flex-direction: column;

          padding: 17px;
        }

        .news-card-date {
          color: #a78bfa;
          font-size: 10px;
        }

        .news-card-info h3 {
          min-height: 48px;
          margin: 10px 0 8px;

          color: #ffffff;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 750;
        }

        .news-card-info > p {
          margin: 0;
          color: #aaa2bd;
          font-size: 11px;
          line-height: 1.8;
        }

        .news-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;

          margin-top: auto;
          padding-top: 18px;
        }

        .news-card-bottom > span:first-child {
          color: #817991;
          font-size: 10px;
        }

        .news-card-arrow {
          display: inline-flex;
          align-items: center;

          color: #b69aff;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* EMPTY */

        .news-empty {
          padding: 45px 15px;

          border: 1px solid rgba(196,181,253,0.13);
          border-radius: 9px;

          background: rgba(15,11,29,0.9);
          text-align: center;
        }

        .news-empty h3 {
          margin: 0 0 8px;
          font-size: 18px;
        }

        .news-empty p {
          color: #aaa2bd;
          font-size: 12px;
        }

        .news-empty button {
          margin-top: 10px;
          padding: 10px 17px;

          border: none;
          border-radius: 6px;

          background: #8b5cf6;
          color: #ffffff;

          font: inherit;
          font-size: 11px;
          cursor: pointer;
        }

        /* CTA - REVISED */

        .news-cta {
          padding: 42px 20px;

          border: none;
          border-radius: 0;

          background: transparent;
          text-align: center;
        }

        .news-cta h2 {
          margin: 0;
          color: #ffffff;

          font-size: clamp(24px,3.5vw,33px);
          font-weight: 850;
        }

        .news-cta h2 span {
          color: #b69aff;
        }

        .news-cta p {
          margin: 12px auto 22px;

          color: #aaa2bd;
          font-size: 12px;
          line-height: 1.8;
        }

        .news-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          padding: 12px 19px;

          border-radius: 6px;
          background: #8b5cf6;
          color: #ffffff;

          font-size: 11px;
          font-weight: 700;
          text-decoration: none;

          transition: 0.2s;
        }

        .news-cta-button:hover {
          background: #7042d4;
        }

        /* TABLET */

        @media (max-width: 900px) {

          .news-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .news-featured-info {
            padding: 23px;
          }

        }

        /* MOBILE */

        @media (max-width: 600px) {

          .news-hero {
            min-height: 165px;
            padding: 45px 5% 20px;
          }

          .news-hero h1 {
            font-size: 28px;
          }

          .news-content {
            padding: 8px 5% 50px;
          }

          .news-categories {
            gap: 7px;
          }

          .news-categories button {
            padding: 0 10px;
            font-size: 10px;
          }

          .news-featured-card {
            grid-template-columns: 1fr;
          }

          .news-featured-image,
          .news-featured-image img {
            min-height: 220px;
          }

          .news-featured-info {
            padding: 22px;
          }

          .news-featured-info h3 {
            font-size: 22px;
          }

          .news-grid {
            grid-template-columns: 1fr;
            gap: 17px;
          }

          .news-card-info h3 {
            min-height: auto;
          }

          .news-cta {
            padding: 32px 15px;
          }

        }

      `}</style>

    </main>
  );
}
